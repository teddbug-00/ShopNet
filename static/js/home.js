import { auth } from './firebase-config.js';
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const db = getFirestore();

// DOM Elements
const userMenuBtn = document.getElementById('userMenuBtn');
const userDropdown = document.getElementById('userDropdown');
const logoutBtn = document.getElementById('logoutBtn');
const productGrid = document.getElementById('productGrid');
const cartCount = document.querySelector('.cart-count');

// Toggle user dropdown menu
userMenuBtn?.addEventListener('click', () => {
    userDropdown.classList.toggle('show');
});

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (!userMenuBtn?.contains(e.target) && !userDropdown?.contains(e.target)) {
        userDropdown?.classList.remove('show');
    }
});

// Handle logout
logoutBtn?.addEventListener('click', async (e) => {
    e.preventDefault();
    try {
        await auth.signOut();
        window.location.href = '/login';
    } catch (error) {
        console.error('Error signing out:', error);
    }
});

// Check authentication state
auth.onAuthStateChanged((user) => {
    if (user) {
        // User is signed in
        userMenuBtn.innerHTML = `
            <i class="fas fa-user"></i>
            ${user.displayName || 'Account'}
        `;
        loadUserCart(user.uid);
    } else {
        // User is signed out
        userMenuBtn.innerHTML = `
            <i class="fas fa-user"></i>
            <a href="/login">Sign In</a>
        `;
    }
});

// Load user's cart
async function loadUserCart(userId) {
    try {
        const cartDoc = await getDocs(collection(db, `users/${userId}/cart`));
        const cartItemCount = cartDoc.docs.length;
        cartCount.textContent = cartItemCount;
    } catch (error) {
        console.error('Error loading cart:', error);
        cartCount.textContent = '0';
    }
}

// Load and display products
async function loadProducts() {
    try {
        const productsSnapshot = await getDocs(collection(db, 'products'));
        const productsHTML = productsSnapshot.docs.map(doc => {
            const product = doc.data();
            return `
                <div class="product-card" data-id="${doc.id}">
                    <img src="${product.imageUrl}" alt="${product.name}">
                    <h3>${product.name}</h3>
                    <p class="price">$${product.price.toFixed(2)}</p>
                    <button class="add-to-cart-btn" onclick="addToCart('${doc.id}')">
                        Add to Cart
                    </button>
                </div>
            `;
        }).join('');

        productGrid.innerHTML = productsHTML;
    } catch (error) {
        console.error('Error loading products:', error);
        productGrid.innerHTML = '<p>Error loading products. Please try again later.</p>';
    }
}

// Add to cart functionality
window.addToCart = async function(productId) {
    const user = auth.currentUser;
    if (!user) {
        window.location.href = '/login';
        return;
    }

    try {
        const userCartRef = collection(db, `users/${user.uid}/cart`);
        // Add product to cart logic here
        // You'll need to implement this based on your data structure
        
        // Update cart count
        loadUserCart(user.uid);
    } catch (error) {
        console.error('Error adding to cart:', error);
        alert('Failed to add item to cart');
    }
}

// Add some CSS for the product cards
const style = document.createElement('style');
style.textContent = `
    .product-card {
        background: white;
        border-radius: 8px;
        padding: 1rem;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        transition: transform 0.3s;
    }

    .product-card:hover {
        transform: translateY(-5px);
    }

    .product-card img {
        width: 100%;
        height: 200px;
        object-fit: cover;
        border-radius: 4px;
        margin-bottom: 1rem;
    }

    .product-card h3 {
        margin: 0.5rem 0;
        color: var(--text-color);
    }

    .product-card .price {
        color: var(--primary-color);
        font-weight: bold;
        font-size: 1.2rem;
        margin: 0.5rem 0;
    }

    .add-to-cart-btn {
        width: 100%;
        padding: 0.8rem;
        background: var(--primary-color);
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: background 0.3s;
    }

    .add-to-cart-btn:hover {
        background: var(--secondary-color);
    }
`;
document.head.appendChild(style);

// Load products when the page loads
document.addEventListener('DOMContentLoaded', loadProducts); 