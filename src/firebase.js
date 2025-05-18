import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAXL1zp7P6BIg99Jbg-VY0lE2IqTFZw_TE",
    authDomain: "golf-major-score.firebaseapp.com",
    projectId: "golf-major-score",
    storageBucket: "golf-major-score.firebasestorage.app",
    messagingSenderId: "474725500608",
    appId: "1:474725500608:web:8ac1ecd166f081411a0f25",
    measurementId: "G-KSLSVCSHC9"
  };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
