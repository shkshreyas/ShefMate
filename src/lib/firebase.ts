// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDBf400bpmlOm_F9eLJRJ8qRvsViAoS5KU",
  authDomain: "shefmate-8a34d.firebaseapp.com",
  projectId: "shefmate-8a34d",
  storageBucket: "shefmate-8a34d.firebasestorage.app",
  messagingSenderId: "1007605275637",
  appId: "1:1007605275637:web:0a75ac0e27e293bef1debc",
  measurementId: "G-1ZYE0D26L8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export { app, db, storage, auth, analytics }; 