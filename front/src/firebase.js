// firebase.js
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

// Replace these values with your real config
const firebaseConfig = {
  apiKey: "AIzaSyD20sA723i92a6IDtLDD4dSl65TUuioVZQ",
  authDomain: "myteacher-df880.firebaseapp.com",
  projectId: "myteacher-df880",
  storageBucket: "myteacher-df880.firebasestorage.app",
  messagingSenderId: "468163058893",
  appId: "1:468163058893:web:693e8efea38ca7970ddd84",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { app, storage };
