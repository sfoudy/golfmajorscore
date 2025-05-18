// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAXL1zp7P6BIg99Jbg-VY0lE2IqTFZw_TE",
  authDomain: "golf-major-score.firebaseapp.com",
  projectId: "golf-major-score",
  storageBucket: "golf-major-score.firebasestorage.app",
  messagingSenderId: "474725500608",
  appId: "1:474725500608:web:8ac1ecd166f081411a0f25",
  measurementId: "G-KSLSVCSHC9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);