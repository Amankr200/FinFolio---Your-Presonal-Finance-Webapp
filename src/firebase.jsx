// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
 
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDs-qb8iQHXi76MrR8LQQNu2-94xrBYPA0",
  authDomain: "financely-aman.firebaseapp.com",
  projectId: "financely-aman",
  storageBucket: "financely-aman.firebasestorage.app",
  messagingSenderId: "275938500272",
  appId: "1:275938500272:web:5d9a638eda7593597f2575",
  measurementId: "G-K5VNN0RH3Z"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
export { db, auth, provider, doc, setDoc };
