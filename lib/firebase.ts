// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCpvnIP1EBRiC9RLFF_CYs-OUZh-kJG8eQ",
  authDomain: "brosolve-d2bee.firebaseapp.com",
  projectId: "brosolve-d2bee",
  storageBucket: "brosolve-d2bee.firebasestorage.app",
  messagingSenderId: "433489591023",
  appId: "1:433489591023:web:709d84a8a416b3ba49791a",
  measurementId: "G-Q7QPYQSKY1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);