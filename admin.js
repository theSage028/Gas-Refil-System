// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";
import { doc, updateDoc } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";


// Your Firebase configuration
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
const auth = getAuth(app);
const db = getFirestore(app);

// DOM Elements
const pendingOrdersTable = document.getElementById("pendingOrdersTable");
const completedOrdersTable = document.getElementById("completedOrdersTable");
const generateReportButton = document.getElementById("generateReportButton");
const logoutButton = document.getElementById("logoutButton");

// Fetch Orders
const fetchOrders = async () => {
  const ordersRef = collection(db, "orders");
  const q = query(ordersRef);
  const querySnapshot = await getDocs(q);

  pendingOrdersTable.innerHTML = "";
  completedOrdersTable.innerHTML = "";

  querySnapshot.forEach((doc) => {
    const order = doc.data();
    const orderDate = new Date(order.orderDate).toLocaleString();
    const row = `
      <tr>
        <td>${doc.id}</td>
        <td>${order.gasType}</td>
        <td>${order.quantity}</td>
        <td>${order.deliveryAddress}</td>
        <td>${order.status}</td>
        <td>${orderDate}</td>
        ${order.status === "Pending" ? `<td><button onclick="acceptOrder('${doc.id}')">Accept</button></td>` : ""}
      </tr>
    `;

    if (order.status === "Pending") {
      pendingOrdersTable.innerHTML += row;
    } else if (order.status === "Completed") {
      completedOrdersTable.innerHTML += row;
    }
  });
};

// Accept Order
window.acceptOrder = async (orderId) => {
  const orderRef = doc(db, "orders", orderId);
  await updateDoc(orderRef, { status: "Completed" });
  alert("Order accepted successfully!");
  fetchOrders();
};

// Generate Report
const generateReport = async () => {
  const ordersRef = collection(db, "orders");
  const q = query(ordersRef);
  const querySnapshot = await getDocs(q);

  const reportData = [];
  querySnapshot.forEach((doc) => {
    const order = doc.data();
    reportData.push({
      OrderID: doc.id,
      GasType: order.gasType,
      Quantity: order.quantity,
      DeliveryAddress: order.deliveryAddress,
      Status: order.status,
      OrderDate: new Date(order.orderDate).toLocaleString(),
    });
  });

  // Convert to CSV
  const csvContent = "data:text/csv;charset=utf-8," + 
    ["OrderID,GasType,Quantity,DeliveryAddress,Status,OrderDate"].concat(
      reportData.map((row) => 
        `${row.OrderID},${row.GasType},${row.Quantity},${row.DeliveryAddress},${row.Status},${row.OrderDate}`
      )
    ).join("\n");

  // Create download link
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "order_report.csv");
  document.body.appendChild(link); // Required for Firefox
  link.click();
  document.body.removeChild(link);
};

// Attach Event Listeners
generateReportButton.addEventListener("click", generateReport);
logoutButton.addEventListener("click", () => {
  signOut(auth).then(() => {
    alert("Logged out successfully!");
    window.location.href = "index.html";
  });
});

// Authenticate Admin
onAuthStateChanged(auth, (user) => {
  if (user) {
    fetchOrders();
  } else {
    alert("Unauthorized access!");
    window.location.href = "index.html";
  }
});