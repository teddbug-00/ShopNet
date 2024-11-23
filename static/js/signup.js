import { 
    auth, 
    createUserWithEmailAndPassword, 
    signInWithRedirect, 
    getRedirectResult, 
    googleProvider,
    db
} from './firebase-config.js';
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

console.log('Auth script loaded');

// Check for redirect result FIRST
async function checkRedirectResult() {
    try {
        const result = await getRedirectResult(auth);
        if (result) {
            const user = result.user;
            console.log('Google sign-up successful:', user);
            
            // Store user info
            localStorage.setItem('user', JSON.stringify({
                email: user.email,
                uid: user.uid,
                displayName: user.displayName
            }));
            
            showSuccess('Account created successfully!');
            setTimeout(() => {
                window.location.href = '/';
            }, 1000);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Redirect result error:', error);
        showError(error.message);
        return false;
    }
}

// Check redirect result when page loads
window.addEventListener('load', async () => {
    const hasRedirectResult = await checkRedirectResult();
    if (!hasRedirectResult) {
        // Check if user is already signed in
        const user = auth.currentUser;
        if (user) {
            console.log('User already signed in:', user);
            window.location.href = '/';
        }
    }
});

// Handle Google sign-up
document.getElementById('googleSignIn').addEventListener('click', async () => {
    try {
        console.log('Starting Google sign-in redirect...');
        googleProvider.addScope('profile');
        googleProvider.addScope('email');
        await signInWithRedirect(auth, googleProvider);
    } catch (error) {
        console.error('Google sign-in error:', error);
        showError(error.message);
    }
});

// Handle email/password signup
document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
        showError('Passwords do not match');
        return;
    }

    try {
        // Create the user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Create initial Firestore document for the user
        await setDoc(doc(db, 'users', user.uid), {
            email: user.email,
            displayName: '',
            phone: '',
            createdAt: new Date().toISOString()
        });

        showSuccess('Account created successfully!');
        setTimeout(() => {
            window.location.href = '/';
        }, 1000);
    } catch (error) {
        console.error('Signup error:', error);
        showError(error.message);
    }
});

// Add a listener for auth state changes
auth.onAuthStateChanged((user) => {
    if (user) {
        console.log('User is signed in:', user);
        localStorage.setItem('user', JSON.stringify({
            email: user.email,
            uid: user.uid,
            displayName: user.displayName
        }));
        redirectToHome();
    } else {
        console.log('No user signed in');
    }
});

function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    const successDiv = document.getElementById('successMessage');
    successDiv.style.display = 'none';
    errorDiv.style.display = 'block';
    errorDiv.textContent = message;
}

function showSuccess(message) {
    const errorDiv = document.getElementById('errorMessage');
    const successDiv = document.getElementById('successMessage');
    errorDiv.style.display = 'none';
    successDiv.style.display = 'block';
    successDiv.textContent = message;
}

function redirectToHome() {
    window.location.href = '/';
} 