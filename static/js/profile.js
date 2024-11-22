import { auth } from './firebase-config.js';
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const db = getFirestore();
const IMGUR_CLIENT_ID = '572b888393bb5ae'; // Replace with your Client ID

// DOM Elements
const profileImage = document.getElementById('profileImage');
const photoInput = document.getElementById('photoInput');
const displayNameElement = document.getElementById('displayName');
const userEmailElement = document.getElementById('userEmail');
const profileForm = document.getElementById('profileForm');
const nameInput = document.getElementById('name');
const phoneInput = document.getElementById('phone');

// Function to upload image to Imgur
async function uploadToImgur(file) {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch('https://api.imgur.com/3/image', {
        method: 'POST',
        headers: {
            'Authorization': `Client-ID ${IMGUR_CLIENT_ID}`
        },
        body: formData
    });

    if (!response.ok) {
        throw new Error('Failed to upload image to Imgur');
    }

    const data = await response.json();
    return data.data.link;
}

// Check authentication state
auth.onAuthStateChanged(async (user) => {
    if (user) {
        // Load user profile
        userEmailElement.textContent = user.email;
        displayNameElement.textContent = user.displayName || 'Set your display name';
        
        // Load profile data from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
            const data = userDoc.data();
            nameInput.value = data.displayName || '';
            phoneInput.value = data.phone || '';
            if (data.photoURL) {
                profileImage.src = data.photoURL;
            }
        }
    } else {
        window.location.href = '/login';
    }
});

// Handle profile image change
document.getElementById('changePhotoBtn').addEventListener('click', () => {
    photoInput.click();
});

photoInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
        try {
            const user = auth.currentUser;
            if (!user) throw new Error('No user logged in');

            // Show loading state
            profileImage.style.opacity = '0.5';

            // Upload to Imgur
            const imageUrl = await uploadToImgur(file);
            console.log('Image uploaded to Imgur:', imageUrl);
            
            // Update profile image
            profileImage.src = imageUrl;
            profileImage.style.opacity = '1';
            
            // Save URL to Firestore
            await setDoc(doc(db, 'users', user.uid), {
                photoURL: imageUrl
            }, { merge: true });
            
            console.log('Profile image updated successfully');
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Error uploading image: ' + error.message);
            profileImage.style.opacity = '1';
        }
    }
});

// Handle profile form submission
profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    
    try {
        await setDoc(doc(db, 'users', user.uid), {
            displayName: nameInput.value,
            phone: phoneInput.value
        }, { merge: true });
        
        displayNameElement.textContent = nameInput.value;
        alert('Profile updated successfully!');
    } catch (error) {
        console.error('Error updating profile:', error);
        alert('Error updating profile');
    }
});

// Handle logout
document.getElementById('logoutBtn').addEventListener('click', async () => {
    try {
        await auth.signOut();
        window.location.href = '/login';
    } catch (error) {
        console.error('Error signing out:', error);
    }
}); 