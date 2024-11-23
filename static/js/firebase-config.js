// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signInWithRedirect,
    getRedirectResult, 
    GoogleAuthProvider,
    browserLocalPersistence,
    setPersistence
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

import { getStorage } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCKF66lKTNM8SDuGEVeTPSC0Xvwv37FfqQ",
    authDomain: "shopnet-72085.firebaseapp.com",
    projectId: "shopnet-72085",
    storageBucket: "shopnet-72085.firebasestorage.app",
    messagingSenderId: "354461289730",
    appId: "1:354461289730:web:958c3774a0f23812e7061b",
    measurementId: "G-T78FEG8P40"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Configure GoogleAuthProvider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
    prompt: 'select_account'
});

// Set persistence to LOCAL
setPersistence(auth, browserLocalPersistence)
    .then(() => {
        console.log('Persistence set to LOCAL');
    })
    .catch((error) => {
        console.error('Error setting persistence:', error);
    });

export { 
    auth, 
    db, 
    storage, 
    googleProvider,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithRedirect,
    getRedirectResult
};