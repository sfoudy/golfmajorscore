import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';

export default function JoinPool() {
  const { poolId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const joinPool = async () => {
      try {
        const idToken = await auth.currentUser.getIdToken();
        const response = await fetch(`http://localhost:8000/pools/${poolId}/join`, {
          headers: {
            'Authorization': `Bearer ${idToken}`
          }
        });
        
        if (!response.ok) throw new Error('Join failed');
        navigate(`/pools/${poolId}`);
      } catch (err) {
        alert(err.message);
        navigate('/');
      }
    };

    if (auth.currentUser) {
      joinPool();
    } else {
      navigate(`/login?redirect=/join/${poolId}`);
    }
  }, [poolId, navigate]);

  return <div>Joining pool...</div>;
}
