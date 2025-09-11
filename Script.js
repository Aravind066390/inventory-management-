/* Script.js – Enhanced Inventory + Cart + Print + Chatbot + Theme */

// ---------------- Inventory & Cart State ----------------
let inventory = [
  { id: genId(), name: "Pen", qty: 50, price: 10.0, description: "Blue ink pen", image: "" },
  { id: genId(), name: "Notebook", qty: 30, price: 45.0, description: "A4 ruled notebook", image: "" }
];
let cart = [];
let selectedItem = null;
let darkMode = false;

// ---------------- Utility ----------------
function genId() {
  return "_" + Math.random().toString(36).substr(2, 9);
}

// ---------------- Inventory Rendering ----------------
function renderInventory() {
  const tbody = document.querySelector("#inventoryTable tbody");
  tbody.innerHTML = "";
  inventory.forEach(item => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.name}</td>
      <td>${item.qty}</td>
      <td>₹${item.price.toFixed(2)}</td>
      <td>
        <button onclick="viewDetails('${item.id}')">View</button>
        <button onclick="addToCart('${item.id}')">Add to Cart</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// ---------------- Inventory Form ----------------
document.getElementById("inventoryForm").addEventListener("submit", e => {
  e.preventDefault();
  const newItem = {
    id: genId(),
    name: document.getElementById("item-name").value,
    qty: parseInt(document.getElementById("item-quantity").value),
    price: parseFloat(document.getElementById("item-price").value),
    description: document.getElementById("item-description").value,
    image: document.getElementById("item-image").value
  };
  inventory.push(newItem);
  renderInventory();
  e.target.reset();
  closeFormPanel();
});

// ---------------- Detail Panel ----------------
function viewDetails(id) {
  selectedItem = inventory.find(i => i.id === id);
  if (!selectedItem) return;

  document.getElementById("detail-title").innerText = selectedItem.name;
  document.getElementById("detail-description").innerText = selectedItem.description;
  document.getElementById("detail-price").innerText = selectedItem.price.toFixed(2);
  document.getElementById("detail-quantity").value = selectedItem.qty;
  document.getElementById("detail-total").innerText = (selectedItem.qty * selectedItem.price).toFixed(2);
  document.getElementById("detail-image").src = selectedItem.image || "https://via.placeholder.com/150";

  document.getElementById("detailPanel").style.display = "block";
}
function hideDetailPanel() {
  document.getElementById("detailPanel").style.display = "none";
}

// Quantity control
function increaseQuantity() {
  if (!selectedItem) return;
  selectedItem.qty++;
  viewDetails(selectedItem.id);
  renderInventory();
}
function decreaseQuantity() {
  if (!selectedItem) return;
  if (selectedItem.qty > 0) selectedItem.qty--;
  viewDetails(selectedItem.id);
  renderInventory();
}

// Edit Mode
function switchToEditMode() {
  document.querySelector("#detailPanel .read-mode").style.display = "none";
  document.querySelector("#detailPanel .edit-mode").style.display = "block";

  document.getElementById("edit-name").value = selectedItem.name;
  document.getElementById("edit-description").value = selectedItem.description;
  document.getElementById("edit-price").value = selectedItem.price;
  document.getElementById("edit-quantity").value = selectedItem.qty;
  document.getElementById("edit-image").value = selectedItem.image;
}
function cancelEdit() {
  document.querySelector("#detailPanel .read-mode").style.display = "block";
  document.querySelector("#detailPanel .edit-mode").style.display = "none";
}
document.getElementById("editForm").addEventListener("submit", e => {
  e.preventDefault();
  selectedItem.name = document.getElementById("edit-name").value;
  selectedItem.description = document.getElementById("edit-description").value;
  selectedItem.price = parseFloat(document.getElementById("edit-price").value);
  selectedItem.qty = parseInt(document.getElementById("edit-quantity").value);
  selectedItem.image = document.getElementById("edit-image").value;

  renderInventory();
  cancelEdit();
  viewDetails(selectedItem.id);
});

// ---------------- Cart System ----------------
function addToCart(id) {
  const item = inventory.find(i => i.id === id);
  if (!item || item.qty <= 0) {
    alert("Item not available!");
    return;
  }
  const cartItem = cart.find(c => c.id === id);
  if (cartItem) {
    cartItem.qty++;
  } else {
    cart.push({ ...item, qty: 1 });
  }
  item.qty--;
  updateCartDisplay();
  renderInventory();
}

function updateCartDisplay() {
  document.getElementById("cartCount").innerText = cart.reduce((sum, i) => sum + i.qty, 0);

  const container = document.getElementById("cartItemsContainer");
  container.innerHTML = "";
  let total = 0;
  cart.forEach(c => {
    const subtotal = c.qty * c.price;
    total += subtotal;
    const div = document.createElement("div");
    div.innerHTML = `
      ${c.name} x ${c.qty} = ₹${subtotal.toFixed(2)}
      <button onclick="removeFromCart('${c.id}')">Remove</button>
    `;
    container.appendChild(div);
  });

  let discountPct = parseFloat(document.getElementById("discountPct").value) || 0;
  let discountAmount = total * (discountPct / 100);
  let finalTotal = total - discountAmount;

  document.getElementById("cartSummary").innerHTML =
    `Subtotal: ₹${total.toFixed(2)} <br> Discount: ₹${discountAmount.toFixed(2)} <br> <b>Total: ₹${finalTotal.toFixed(2)}</b>`;
}
function removeFromCart(id) {
  const index = cart.findIndex(c => c.id === id);
  if (index >= 0) {
    inventory.find(i => i.id === id).qty += cart[index].qty;
    cart.splice(index, 1);
  }
  updateCartDisplay();
  renderInventory();
}
function clearCart() {
  cart.forEach(c => {
    inventory.find(i => i.id === c.id).qty += c.qty;
  });
  cart = [];
  updateCartDisplay();
  renderInventory();
}

// ---------------- Cart Popup + Print ----------------
function showCart() {
  document.getElementById("cartDrawer").style.display = "block";
  updateCartDisplay();
}
function closeCart() {
  document.getElementById("cartDrawer").style.display = "none";
}

function checkout() {
  if (cart.length === 0) {
    alert("Cart is empty!");
    return;
  }

  // Open bill in new window
  let billWindow = window.open("", "Bill", "width=600,height=800");
  billWindow.document.write("<html><head><title>Bill</title></head><body>");
  billWindow.document.write("<h2>Invoice</h2><table border='1' width='100%' style='border-collapse:collapse;text-align:center;'>");
  billWindow.document.write("<tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr>");

  let total = 0;
  cart.forEach(c => {
    const sub = c.qty * c.price;
    total += sub;
    billWindow.document.write(`<tr><td>${c.name}</td><td>${c.qty}</td><td>₹${c.price.toFixed(2)}</td><td>₹${sub.toFixed(2)}</td></tr>`);
  });

  let discountPct = parseFloat(document.getElementById("discountPct").value) || 0;
  let discountAmount = total * (discountPct / 100);
  let finalTotal = total - discountAmount;

  billWindow.document.write(`<tr><td colspan="3"><b>Subtotal</b></td><td>₹${total.toFixed(2)}</td></tr>`);
  billWindow.document.write(`<tr><td colspan="3"><b>Discount</b></td><td>₹${discountAmount.toFixed(2)}</td></tr>`);
  billWindow.document.write(`<tr><td colspan="3"><b>Final Total</b></td><td><b>₹${finalTotal.toFixed(2())}</b></td></tr>`);
  billWindow.document.write("</table>");
  billWindow.document.write("<br><button onclick='window.print()'>Print Bill</button>");
  billWindow.document.write("</body></html>");
  billWindow.document.close();

  clearCart();
  closeCart();
}

// ---------------- Search ----------------
function searchItem() {
  const query = document.getElementById("search-bar").value.toLowerCase();
  const tbody = document.querySelector("#inventoryTable tbody");
  tbody.innerHTML = "";
  inventory
    .filter(i => i.name.toLowerCase().includes(query))
    .forEach(item => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${item.name}</td>
        <td>${item.qty}</td>
        <td>₹${item.price.toFixed(2)}</td>
        <td>
          <button onclick="viewDetails('${item.id}')">View</button>
          <button onclick="addToCart('${item.id}')">Add to Cart</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
}

// ---------------- Form Panel Toggle ----------------
function toggleFormPanel() {
  const panel = document.getElementById("formPanel");
  panel.style.display = panel.style.display === "block" ? "none" : "block";
}
function closeFormPanel() {
  document.getElementById("formPanel").style.display = "none";
}

// ---------------- Theme ----------------
function toggleTheme() {
  darkMode = !darkMode;
  document.body.classList.toggle("dark-mode", darkMode);
  document.querySelector(".theme-toggle-icon").innerText = darkMode ? "🌙" : "☀";
}

// ---------------- Chatbot ----------------
function toggleChatbot() {
  const chat = document.getElementById("chatbotContainer");
  chat.style.display = chat.style.display === "block" ? "none" : "block";
}

function sendMessage() {
  const input = document.getElementById("chatInput");
  const msg = input.value.trim();
  if (!msg) return;

  const messages = document.getElementById("chatbotMessages");
  messages.innerHTML += `<div class="user-message">${msg}</div>`;

  let reply = "Sorry, I didn't understand.";
  if (msg.toLowerCase() === "help") {
    reply = "You can search items, add to cart, checkout, or ask about stock.";
  } else if (msg.toLowerCase().includes("stock")) {
    reply = "Check the inventory list to view stock quantities.";
  }

  messages.innerHTML += `<div class="bot-message">${reply}</div>`;
  input.value = "";
  messages.scrollTop = messages.scrollHeight;
}

// ---------------- Init ----------------
document.addEventListener("DOMContentLoaded", () => {
  renderInventory();
  updateCartDisplay();
});
