/* script.js - Inventory + Billing System */
document.addEventListener("DOMContentLoaded", initApp);

let inventory = [];
let cart = [];

// Utility to generate unique IDs
function genId() {
  return "_" + Math.random().toString(36).substr(2, 9);
}

function initApp() {
  renderInventory();
  document.getElementById("inventoryForm").addEventListener("submit", addItem);
  document.getElementById("editForm").addEventListener("submit", saveEdit);
}

// ---------- INVENTORY MANAGEMENT ----------
function addItem(e) {
  e.preventDefault();
  const name = document.getElementById("item-name").value.trim();
  const qty = parseInt(document.getElementById("item-quantity").value);
  const price = parseFloat(document.getElementById("item-price").value);
  const description = document.getElementById("item-description").value.trim();
  const image = document.getElementById("item-image").value.trim();

  const newItem = { id: genId(), name, qty, price, description, image };
  inventory.push(newItem);

  e.target.reset();
  renderInventory();
}

function renderInventory() {
  const tbody = document.querySelector("#inventoryTable tbody");
  tbody.innerHTML = "";

  inventory.forEach(item => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="clickable" onclick="viewItem('${item.id}')">${item.name}</td>
      <td>${item.qty}</td>
      <td>₹${item.price.toFixed(2)}</td>
      <td class="actions">
        <button onclick="deleteItem('${item.id}')">Delete</button>
        <button class="view-button" onclick="viewItem('${item.id}')">View</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function deleteItem(id) {
  inventory = inventory.filter(item => item.id !== id);
  renderInventory();
}

// ---------- ITEM DETAIL ----------
function viewItem(id) {
  const item = inventory.find(it => it.id === id);
  if (!item) return;

  document.getElementById("detail-title").textContent = item.name;
  document.getElementById("detail-description").textContent = item.description;
  document.getElementById("detail-price").textContent = "₹" + item.price.toFixed(2);
  document.getElementById("detail-quantity").value = item.qty;
  document.getElementById("detail-total").textContent = "₹" + (item.qty * item.price).toFixed(2);
  document.getElementById("detail-image").src = item.image || "https://via.placeholder.com/150";

  document.getElementById("detailPanel").style.display = "block";
  document.getElementById("formPanel").style.display = "none";

  document.getElementById("edit-name").value = item.name;
  document.getElementById("edit-description").value = item.description;
  document.getElementById("edit-price").value = item.price;
  document.getElementById("edit-quantity").value = item.qty;
  document.getElementById("edit-image").value = item.image;

  document.getElementById("editForm").dataset.id = item.id;

  // Add "Add to Cart" button dynamically
  if (!document.getElementById("addToCartBtn")) {
    const btn = document.createElement("button");
    btn.id = "addToCartBtn";
    btn.textContent = "Add to Bill";
    btn.onclick = () => addToCart(item.id);
    document.querySelector(".item-detail .read-mode").appendChild(btn);
  }
}

function hideDetailPanel() {
  document.getElementById("detailPanel").style.display = "none";
}

function switchToEditMode() {
  document.getElementById("detailPanel").classList.add("detail-edit");
}
function cancelEdit() {
  document.getElementById("detailPanel").classList.remove("detail-edit");
}
function saveEdit(e) {
  e.preventDefault();
  const id = e.target.dataset.id;
  const item = inventory.find(it => it.id === id);
  if (!item) return;

  item.name = document.getElementById("edit-name").value;
  item.description = document.getElementById("edit-description").value;
  item.price = parseFloat(document.getElementById("edit-price").value);
  item.qty = parseInt(document.getElementById("edit-quantity").value);
  item.image = document.getElementById("edit-image").value;

  renderInventory();
  cancelEdit();
  viewItem(id);
}

// ---------- QUANTITY CONTROL ----------
function increaseQuantity() {
  const qtyEl = document.getElementById("detail-quantity");
  qtyEl.value = parseInt(qtyEl.value) + 1;
  updateTotal();
}
function decreaseQuantity() {
  const qtyEl = document.getElementById("detail-quantity");
  if (parseInt(qtyEl.value) > 1) {
    qtyEl.value = parseInt(qtyEl.value) - 1;
    updateTotal();
  }
}
function updateTotal() {
  const qty = parseInt(document.getElementById("detail-quantity").value);
  const price = parseFloat(document.getElementById("detail-price").textContent.replace("₹", ""));
  document.getElementById("detail-total").textContent = "₹" + (qty * price).toFixed(2);
}

// ---------- BILLING ----------
function addToCart(id) {
  const item = inventory.find(it => it.id === id);
  if (!item) return;

  const existing = cart.find(it => it.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...item, qty: 1 });
  }
  alert(item.name + " added to bill!");
}

function generateBill() {
  if (cart.length === 0) {
    alert("Cart is empty!");
    return;
  }

  let billWindow = window.open("", "Bill", "width=600,height=800");
  billWindow.document.write("<h1>Customer Bill</h1>");
  billWindow.document.write("<table border='1' width='100%' style='border-collapse:collapse;text-align:center;'>");
  billWindow.document.write("<tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr>");

  let grandTotal = 0;
  cart.forEach(item => {
    const total = item.qty * item.price;
    grandTotal += total;
    billWindow.document.write(
      `<tr><td>${item.name}</td><td>${item.qty}</td><td>₹${item.price.toFixed(2)}</td><td>₹${total.toFixed(2)}</td></tr>`
    );
  });

  billWindow.document.write(`<tr><td colspan="3"><b>Grand Total</b></td><td><b>₹${grandTotal.toFixed(2)}</b></td></tr>`);
  billWindow.document.write("</table>");
  billWindow.document.write("<br><button onclick='window.print()'>Print Bill</button>");
  billWindow.document.close();

  cart = []; // clear after bill generation
}

// ---------- SEARCH ----------
function searchItem() {
  const query = document.getElementById("search-bar").value.toLowerCase();
  const tbody = document.querySelector("#inventoryTable tbody");
  tbody.innerHTML = "";

  inventory
    .filter(item => item.name.toLowerCase().includes(query))
    .forEach(item => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="clickable" onclick="viewItem('${item.id}')">${item.name}</td>
        <td>${item.qty}</td>
        <td>₹${item.price.toFixed(2)}</td>
        <td class="actions">
          <button onclick="deleteItem('${item.id}')">Delete</button>
          <button class="view-button" onclick="viewItem('${item.id}')">View</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
}

// ---------- THEME & CHAT ----------
function toggleTheme() {
  document.body.classList.toggle("dark-mode");
}
function toggleFormPanel() {
  const panel = document.getElementById("formPanel");
  panel.style.display = panel.style.display === "block" ? "none" : "block";
}
function toggleChatbot() {
  const bot = document.getElementById("chatbotContainer");
  bot.style.display = bot.style.display === "flex" ? "none" : "flex";
}
function sendMessage() {
  const input = document.getElementById("chatInput");
  const msg = input.value.trim();
  if (!msg) return;

  const container = document.getElementById("chatbotMessages");
  const userMsg = document.createElement("div");
  userMsg.className = "user-message";
  userMsg.textContent = msg;
  container.appendChild(userMsg);

  const botMsg = document.createElement("div");
  botMsg.className = "bot-message";
  botMsg.textContent = "You said: " + msg;
  container.appendChild(botMsg);

  input.value = "";
  container.scrollTop = container.scrollHeight;
}
function exitInventory() {
  if (confirm("Are you sure you want to exit?")) {
    window.close();
  }
}

// Add a floating "Generate Bill" button
window.onload = () => {
  const btn = document.createElement("button");
  btn.textContent = "Generate Bill";
  btn.style.position = "fixed";
  btn.style.bottom = "20px";
  btn.style.left = "20px";
  btn.style.backgroundColor = "#2196F3";
  btn.onclick = generateBill;
  document.body.appendChild(btn);
};
