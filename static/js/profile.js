import { auth } from './firebase-config.js';
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const db = getFirestore();
const storage = getStorage();

// DOM Elements
const profileImage = document.getElementById('profileImage');
const photoInput = document.getElementById('photoInput');
const displayNameElement = document.getElementById('displayName');
const userEmailElement = document.getElementById('userEmail');
const profileForm = document.getElementById('profileForm');
const nameInput = document.getElementById('name');
const phoneInput = document.getElementById('phone');
const addressList = document.getElementById('addressList');
const addressModal = document.getElementById('addressModal');
const addressForm = document.getElementById('addressForm');
const addAddressBtn = document.getElementById('addAddressBtn');
const closeModalBtn = document.querySelector('.close');

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
            // Load addresses
            if (data.addresses) {
                renderAddresses(data.addresses);
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
            const storageRef = ref(storage, `profile_images/${user.uid}`);
            await uploadBytes(storageRef, file);
            const photoURL = await getDownloadURL(storageRef);
            
            // Update profile image
            profileImage.src = photoURL;
            
            // Save to Firestore
            await setDoc(doc(db, 'users', user.uid), {
                photoURL: photoURL
            }, { merge: true });
            
        } catch (error) {
            console.error('Error uploading image:', error);
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

// Handle address modal
addAddressBtn.addEventListener('click', () => {
    addressModal.style.display = 'block';
});

closeModalBtn.addEventListener('click', () => {
    addressModal.style.display = 'none';
});

// Handle address form submission
addressForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    
    const newAddress = {
        street: document.getElementById('street').value,
        city: document.getElementById('city').value,
        state: document.getElementById('state').value,
        zipcode: document.getElementById('zipcode').value
    };
    
    try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const addresses = userDoc.exists() ? (userDoc.data().addresses || []) : [];
        addresses.push(newAddress);
        
        await setDoc(doc(db, 'users', user.uid), {
            addresses: addresses
        }, { merge: true });
        
        renderAddresses(addresses);
        addressModal.style.display = 'none';
        addressForm.reset();
    } catch (error) {
        console.error('Error adding address:', error);
        alert('Error adding address');
    }
});

// Render addresses
function renderAddresses(addresses) {
    addressList.innerHTML = addresses.map((address, index) => `
        <div class="address-card">
            <div>
                ${address.street}<br>
                ${address.city}, ${address.state} ${address.zipcode}
            </div>
            <button onclick="deleteAddress(${index})" class="delete-btn">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');
}

// Handle logout
document.getElementById('logoutBtn').addEventListener('click', async () => {
    try {
        await auth.signOut();
        window.location.href = '/login';
    } catch (error) {
        console.error('Error signing out:', error);
    }
}); 