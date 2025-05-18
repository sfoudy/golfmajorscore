from fastapi import FastAPI, Depends, HTTPException, status, Body
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict
from datetime import datetime, timedelta, timezone
import requests
import firebase_admin
from firebase_admin import credentials, auth as firebase_auth
from google.cloud import firestore
import uuid

# Initialize FastAPI app
app = FastAPI()

# Configure CORS
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Firebase and Firestore setup
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)
db = firestore.Client.from_service_account_json("serviceAccountKey.json")

# Authentication dependency
security = HTTPBearer()
async def get_current_user(token: HTTPAuthorizationCredentials = Depends(security)):
    try:
        decoded_token = firebase_auth.verify_id_token(token.credentials)
        return decoded_token
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
        )

# DataGolf configuration
DG_API_KEY = "45323a83fa8d25b3c3d745bd63d9"  # Keep your actual key

# --------------------------
# Teams Endpoints (Legacy/Compatibility)
# --------------------------

@app.get("/teams", response_model=Dict[str, List[str]])
async def get_teams(user=Depends(get_current_user)):
    """Get all teams for the authenticated user (compatibility endpoint)"""
    user_id = user["uid"]
    doc_ref = db.collection("teams").document(user_id)
    doc = doc_ref.get()
    return doc.to_dict().get("teams", {}) if doc.exists else {}

@app.post("/teams/{team_name}", response_model=bool)
async def add_or_update_team(
    team_name: str,
    golfers: List[str] = Body(...),
    user=Depends(get_current_user)
):
    """Add/update a team (compatibility endpoint)"""
    user_id = user["uid"]
    doc_ref = db.collection("teams").document(user_id)
    doc = doc_ref.get()
    teams = doc.to_dict().get("teams", {}) if doc.exists else {}
    teams[team_name] = golfers
    doc_ref.set({"teams": teams})
    return True
# --------------------------
# Pool Management Endpoints
# --------------------------

@app.post("/pools")
async def create_pool(
    pool_data: dict = Body(...),
    user=Depends(get_current_user)
):
    """Create a new pool with unique ID"""
    # In your create_pool endpoint
    user_email = firebase_auth.get_user(user["uid"]).email
    pool_data.update({
        "creator": user_email,  # Use email instead of UID
    
})

    pool_id = str(uuid.uuid4())
    pool_ref = db.collection("pools").document(pool_id)
    
    pool_data.update({
        "invited_emails": [],  # Add this line
        "joined_users": [],    # Add this line
        "settings": {
            "allow_edits": True,
            "max_selections": pool_data.get("max_selections", 5)
    }
})

    
    pool_ref.set(pool_data)
    return {"pool_id": pool_id}

@app.post("/pools/{pool_id}/invite")
async def invite_users(
    pool_id: str,
    emails: List[str] = Body(...),
    user=Depends(get_current_user)
):
    pool_ref = db.collection("pools").document(pool_id)
    pool = pool_ref.get().to_dict()
    user_email = firebase_auth.get_user(user["uid"]).email

    if not pool:
        raise HTTPException(404, "Pool not found")

    if pool["creator"] != user_email:
        raise HTTPException(403, "Only pool creator can invite users")

    pool_ref.update({
        "invited_emails": firestore.ArrayUnion(emails)
    })
    return {"status": "invites_sent"}

@app.post("/pools/{pool_id}/lock")
async def lock_selections(
    pool_id: str,
    user=Depends(get_current_user)
):
    """Lock selections (admin only)"""
    pool_ref = db.collection("pools").document(pool_id)
    pool = pool_ref.get().to_dict()
    
    if not pool or pool["creator"] != user["uid"]:
        raise HTTPException(status_code=403, detail="Only pool creator can lock selections")
    
    pool_ref.update({
        "settings.allow_edits": False
    })
    return {"status": "selections_locked"}

@app.delete("/teams/{team_name}", response_model=bool)
async def delete_team(team_name: str, user=Depends(get_current_user)):
    user_id = user["uid"]
    doc_ref = db.collection("teams").document(user_id)
    doc = doc_ref.get()
    if doc.exists:
        teams = doc.to_dict().get("teams", {})
        if team_name in teams:
            del teams[team_name]
            doc_ref.set({"teams": teams})
            return True
        else:
            raise HTTPException(status_code=404, detail="Team not found")
    else:
        raise HTTPException(status_code=404, detail="No teams found for user")



# --------------------------
# Selection Management
# --------------------------

@app.post("/pools/{pool_id}/selections")
async def save_selections(
    pool_id: str,
    selections: List[str] = Body(...),
    user=Depends(get_current_user)
):
    """Save user selections with validation"""
    # Get pool data
    pool_ref = db.collection("pools").document(pool_id)
    pool = pool_ref.get().to_dict()
    
    if not pool:
        raise HTTPException(status_code=404, detail="Pool not found")
    
    # Verify user invitation
    user_email = firebase_auth.get_user(user["uid"]).email
    if user_email not in pool["invited_users"]:
        raise HTTPException(status_code=403, detail="Not invited to this pool")
    
    # Check selection limits
    max_selections = pool["settings"].get("max_selections", 5)
    if len(selections) > max_selections:
        raise HTTPException(
            status_code=400,
            detail=f"Maximum {max_selections} selections allowed"
        )
    
    # Check if edits allowed
    if not pool["settings"]["allow_edits"]:
        raise HTTPException(status_code=400, detail="Selections are locked")
    
    # Save selections
    selections_ref = db.collection("selections").document(f"{pool_id}_{user['uid']}")
    selections_ref.set({
        "pool_id": pool_id,
        "user_id": user["uid"],
        "selections": selections,
        "submitted_at": datetime.now(timezone.utc)
    })
    
    return {"status": "selections_saved"}

# --------------------------
# Data Retrieval Endpoints
# --------------------------

@app.get("/pools/{pool_id}")
async def get_pool(pool_id: str, user=Depends(get_current_user)):
    """Get pool details"""
    pool_ref = db.collection("pools").document(pool_id)
    pool = pool_ref.get().to_dict()
    
    if not pool:
        raise HTTPException(status_code=404, detail="Pool not found")
    
    # Only return basic info to non-creators
    if pool["creator"] != user["uid"]:
        return {
            "name": pool["name"],
            "settings": pool["settings"]
        }
    
    return pool

@app.get("/live-players")
async def get_live_players():
    """Get live player data from DataGolf"""
    try:
        response = requests.get(
            "https://feeds.datagolf.com/preds/in-play",
            params={
                "tour": "pga",
                "key": DG_API_KEY,
                "file_format": "json"
            }
        )
        response.raise_for_status()
        data = response.json()
        
        players = []
        for p in data["data"]:
            # Format name as "First Last"
            if ", " in p["player_name"]:
                last, first = p["player_name"].split(", ", 1)
                name = f"{first} {last}"
            else:
                name = p["player_name"]
            
            players.append({
                "id": p["dg_id"],
                "name": name,
                "current_score": p.get("current_score", 0),
                "status": p.get("status", "")
            })
        
        return {"players": players}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
from firebase_admin import auth as firebase_auth  # Ensure this import exists

@app.post("/pools/{pool_id}/join")
async def join_pool(
    pool_id: str,
    user=Depends(get_current_user)
):
    pool_ref = db.collection("pools").document(pool_id)
    pool = pool_ref.get().to_dict()
    
    if not pool:
        raise HTTPException(404, "Pool not found")
    
    user_email = firebase_auth.get_user(user["uid"]).email
    
    if user_email not in pool.get("invited_emails", []):
        raise HTTPException(403, "Not invited to this pool")
    
    if user["uid"] not in pool["joined_users"]:
        pool_ref.update({
            "joined_users": firestore.ArrayUnion([user["uid"]])
        })
    
    return {"status": "joined"}

# --------------------------
# Root Endpoint
# --------------------------

@app.get("/")
def read_root():
    return {"message": "Golf Pool Manager API"}