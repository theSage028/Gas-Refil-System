import { updateDoc, doc } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { getAuth, onAuthStateChanged, updateProfile } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';
import { addDoc, collection } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCX0vxlyd0hXXDur4v3SpAnNuRwrm4Fyyc",
  authDomain: "gas-refill-app.firebaseapp.com",
  projectId: "gas-refill-app",
  storageBucket: "gas-refill-app.firebasestorage.app",
  messagingSenderId: "369760533545",
  appId: "1:369760533545:web:5bc99b940b30154fe3b038",
  measurementId: "G-8GV51M539Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // Initialize auth
const db = getFirestore(app);

// Get modal and form elements
const profileModal = document.getElementById('profileModal');
const closeModalButton = document.getElementById('closeModalButton');
const profileForm = document.getElementById('profileForm');

// Function to update the profile and password
async function updateProfileAndPassword(user, newDisplayName, newPassword) {
  try {
    // Update the user's profile information in Firestore
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      displayName: newDisplayName,
    });

    // Update the user's Firebase Authentication profile
    await updateProfile(user, {
      displayName: newDisplayName,
    });

    // Update the user's password if provided
    if (newPassword) {
      await updatePassword(user, newPassword);
    }

    console.log('Profile and password updated successfully');
  } catch (error) {
    console.error('Error updating profile and password:', error);
  }
}

// Listen for the authentication state change
onAuthStateChanged(auth, (user) => {
  if (user) {
    // Show modal when the user clicks on "Update Profile"
    document.getElementById('update-profile-btn').addEventListener('click', () => {
      profileModal.style.display = 'block'; // Show the modal
    });

    // Handle form submission to update profile and password
    profileForm.addEventListener('submit', async (e) => {
      e.preventDefault(); // Prevent the default form submission

      const newDisplayName = document.getElementById('displayName').value;
      const newPassword = document.getElementById('newPassword').value;
      const confirmPassword = document.getElementById('confirmPassword').value;

      // Check if password and confirm password match
      if (newPassword && newPassword !== confirmPassword) {
        console.log('Passwords do not match');
        return;
      }

      // Call the function to update the profile and password
      await updateProfileAndPassword(user, newDisplayName, newPassword);

      // Close the modal after saving changes
      profileModal.style.display = 'none';
    });

    // Close modal when the user clicks on the close button
    closeModalButton.addEventListener('click', () => {
      profileModal.style.display = 'none';
    });

    // Close modal if the user clicks outside of the modal
    window.addEventListener('click', (event) => {
      if (event.target === profileModal) {
        profileModal.style.display = 'none';
      }
    });
  } else {
    console.log('No user is signed in');
  }
});


// Get references to modals
const bankModal = document.getElementById('bankModal');
const orderModal = document.getElementById('orderModal');

// Function to place the order
async function placeOrder() {
    const orderForm = document.getElementById('orderForm');
    const gasType = document.getElementById("gasType").value;
    const quantity = document.getElementById("quantity").value;
    const deliveryAddress = document.getElementById("deliveryAddress").value;
  
    const user = auth.currentUser;
  
    if (user) {
      try {
        // Add order to Firestore
        await addDoc(collection(db, "orders"), {
          userId: user.uid,
          gasType,
          quantity: parseInt(quantity),
          deliveryAddress,
          orderDate: new Date().toISOString(),
          status: "Pending",
        });
        alert("Your order has been placed. Thank you for your payment!");
        orderForm.reset(); // Reset the form
  
        // Fetch and display the order history
        fetchOrderHistory(user.uid); // Refresh order history
  
        // Close modals after order placement
        bankModal.style.display = 'none';
        orderModal.style.display = 'none';
      } catch (error) {
        console.error("Error placing order:", error.message);
        alert("Failed to place order. Please try again.");
      }
    } else {
      alert("You must be logged in to place an order.");
    }
  }
  

// Add event listener to proceed payment button
const proceedPaymentButton = document.getElementById('proceedPaymentButton');
if (proceedPaymentButton) {
  proceedPaymentButton.addEventListener('click', () => {
    placeOrder(); // Call the function to place the order
  });
}