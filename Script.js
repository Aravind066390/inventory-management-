/* script.js - Fixed for your HTML layout */
document.addEventListener("DOMContentLoaded", initApp);

let inventory = [
  { id: genId(), name: "Pen", qty: 50, price: 10.0, description: "Blue ink pen", image: "" },
  { id: genId(), name: "Notebook", qty: 30, price: 45.0, description: "A4 ruled", image: "" },
  { id: genId(), name: "Stapler", qty: 10, price: 150.0, description: "Standard stapler", image: "" },
];
let cart = [];

/* ----------- INIT ----------- */
function initApp() {
  renderInventory();
  renderCartCount();

  // search
  document.getElementById("search-btn").addEventListener("click", searchItem);

  // add item
  document.getElementById("inventoryForm").addEventListener("submit", (e) => {
    e.preventDefault();
    addInventoryItemFromForm();
  });

  // dark/light mode
  document.getElementById("theme-toggle").addEventListener("click", toggleTheme);

  // chat toggle
  document.getElementById("chat-toggle").addEventListener("click", toggleChat);

  // send chat msg
  document.getElementById("chat-send").addEventListener("click", sendMessage);

  // cart open
  document.getElementById("cart-open").addEventListener("click", showCart);
}

/* ----------- Inventory ----------- */
function genId() {
  return "it_" + Math.random().toString(36).slice(2, 9);
}

function addInventoryItemFromForm() {
  const name = document.getElementById("item-name").value.trim();
  const qty = +document.getElementById("item-quantity").value;
  const price = +document.getElementById("item-price").value;
  const description = document.getElementById("item-description").value.trim();
  const image = document.getElementById("item-image").value.trim();

  if (!name || isNaN(qty) || isNaN(price)) {
    alert("Please fill all fields correctly.");
    return;
  }

  inventory.push({ id: genId(), name, qty, price, description, image });
  renderInventory();
  document.getElementById("inventoryForm").reset();
}

function renderInventory(filter = "") {
  const tbody = document.querySelector("#inventoryTable tbody");
  tbody.innerHTML = "";
  inventory
    .filter((i) => i.name.toLowerCase().includes(filter.toLowerCase()))
    .forEach((item) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${item.name}</td>
        <td>${item.qty}</td>
        <td>₹${item.price.toFixed(2)}</td>
        <td>
          <button onclick="addToCart('${item.id}')">Add to Cart</button>
          <button onclick="deleteItem('${item.id}')" style="background:#f44336;color:#fff;">Delete</button>
        </td>`;
      tbody.appendChild(tr);
    });
}

function searchItem() {
  const q = document.getElementById("search-bar").value;
  renderInventory(q);
}

function deleteItem(id) {
  if (!confirm("Delete this item?")) return;
  inventory = inventory.filter((i) => i.id !== id);
  renderInventory();
}

/* ----------- Cart ----------- */
function addToCart(id) {
  const item = inventory.find((i) => i.id === id);
  if (!item) return;
  const existing = cart.find((c) => c.id === id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ ...item, qty: 1 });
  }
  renderCartCount();
  alert("Added to cart");
}

function renderCartCount() {
  const count = cart.reduce((s, i) => s + i.qty, 0);
  document.getElementById("cart-open").innerText = `Open Cart (${count})`;
}

function showCart() {
  let text = "Cart:\n";
  cart.forEach((c) => (text += `${c.name} x ${c.qty} = ₹${c.price * c.qty}\n`));
  text += `\nTotal = ₹${cart.reduce((s, i) => s + i.price * i.qty, 0)}`;
  alert(text);
}

/* ----------- Dark / Light Mode ----------- */
function toggleTheme() {
  document.body.classList.toggle("dark-mode");
}

/* ----------- Chat Assistant ----------- */
function toggleChat() {
  const chat = document.getElementById("chatbox");
  chat.style.display = chat.style.display === "block" ? "none" : "block";
}

function sendMessage() {
  const input = document.getElementById("chat-input");
  const msg = input.value.trim();
  if (!msg) return;

  const box = document.getElementById("chat-messages");
  box.innerHTML += `<div class="user-msg">${msg}</div>`;

  let reply = "I can only answer 'help', 'list', 'cart'.";
  if (msg.toLowerCase().includes("help")) {
    reply = "Try: 'list' (inventory), 'cart' (cart count).";
  } else if (msg.toLowerCase().includes("list")) {
    reply = "Inventory: " + inventory.map((i) => `${i.name}(${i.qty})`).join(", ");
  } else if (msg.toLowerCase().includes("cart")) {
    reply = `Cart items: ${cart.length}`;
  }

  box.innerHTML += `<div class="bot-msg">${reply}</div>`;
  input.value = "";
  box.scrollTop = box.scrollHeight;
    }
/* ----------- Invoice Printing ----------- */
function printInvoice() {
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  let invoiceHtml = `
    <html>
    <head>
      <title>Invoice</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { text-align: center; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #333; padding: 8px; text-align: left; }
        th { background: #eee; }
        .total { font-weight: bold; text-align: right; }
      </style>
    </head>
    <body>
      <h1>Invoice</h1>
      <table>
        <tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr>
        ${cart.map(c => `
          <tr>
            <td>${c.name}</td>
            <td>${c.qty}</td>
            <td>₹${c.price.toFixed(2)}</td>
            <td>₹${(c.qty * c.price).toFixed(2)}</td>
          </tr>
        `).join("")}
        <tr>
          <td colspan="3" class="total">Grand Total</td>
          <td>₹${total.toFixed(2)}</td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const w = window.open("", "_blank");
  w.document.open();
  w.document.write(invoiceHtml);
  w.document.close();
  w.onload = () => {
    w.print();
    w.close();
  };
}
