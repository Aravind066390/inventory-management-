/* script.js - Inventory + Billing + Print */
document.addEventListener('DOMContentLoaded', initApp);

/* --- Simple in-memory DB (persisted to localStorage) --- */
const STORAGE_KEY = 'ims_inventory_v1';
const CART_KEY = 'ims_cart_v1';

let inventory = [];
let cart = [];

function initApp(){
  loadFromStorage();
  bindForms();
  renderInventory();
  renderCartCount();
}

/* ---------- storage ---------- */
function loadFromStorage(){
  const inv = localStorage.getItem(STORAGE_KEY);
  const c = localStorage.getItem(CART_KEY);
  inventory = inv ? JSON.parse(inv) : sampleInventory();
  cart = c ? JSON.parse(c) : [];
  saveInventory(); // ensure defaults saved
}

function saveInventory(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(inventory));
}

function saveCart(){
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

/* ---------- sample data ---------- */
function sampleInventory(){
  return [
    { id: genId(), name: 'Pen', qty: 50, price: 10.00, description: 'Blue ink pen', image: '' },
    { id: genId(), name: 'Notebook', qty: 30, price: 45.00, description: 'A4 ruled', image: '' },
    { id: genId(), name: 'Stapler', qty: 10, price: 150.00, description: 'Standard stapler', image: '' }
  ];
}

function genId(){
  return 'it_' + Math.random().toString(36).slice(2,9);
}

/* ---------- UI wiring ---------- */
function bindForms(){
  const form = document.getElementById('inventoryForm');
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    addInventoryItemFromForm();
  });

  const editForm = document.getElementById('editForm');
  editForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    saveEdit();
  });

  document.getElementById('chatToggleBtn').addEventListener('click', toggleChatbot);
}

function addInventoryItemFromForm(){
  const name = document.getElementById('item-name').value.trim();
  const qty = +document.getElementById('item-quantity').value;
  const price = +document.getElementById('item-price').value;
  const description = document.getElementById('item-description').value.trim();
  const image = document.getElementById('item-image').value.trim();

  if(!name || isNaN(qty) || isNaN(price)){
    alert('Please fill required fields correctly.');
    return;
  }

  const item = { id: genId(), name, qty, price: parseFloat(price.toFixed(2)), description, image };
  inventory.unshift(item);
  saveInventory();
  renderInventory();
  document.getElementById('inventoryForm').reset();
  closeFormPanel();
}

function renderInventory(filter = ''){
  const tbody = document.querySelector('#inventoryTable tbody');
  tbody.innerHTML = '';
  const list = inventory.filter(it => it.name.toLowerCase().includes(filter.toLowerCase()));
  list.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="clickable" onclick="showDetail('${item.id}')">${escapeHtml(item.name)}</td>
      <td>${item.qty}</td>
      <td>₹${item.price.toFixed(2)}</td>
      <td class="actions">
        <button onclick="addToCartFromInventory('${item.id}')">Add to Cart</button>
        <button class="view-button" onclick="showDetail('${item.id}')">View</button>
        <button style="background:#607D8B;" onclick="editItem('${item.id}')">Edit</button>
        <button style="background:#f44336;" onclick="deleteItem('${item.id}')">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function escapeHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

/* ---------- search ---------- */
function searchItem(){
  const q = document.getElementById('search-bar').value;
  renderInventory(q);
}

/* ---------- detail / edit ---------- */
let currentDetailId = null;

function showDetail(id){
  currentDetailId = id;
  const item = inventory.find(i=>i.id===id);
  if(!item) return;
  document.getElementById('detail-title').textContent = item.name;
  document.getElementById('detail-image').src = item.image || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="120"><rect width="100%" height="100%" fill="%23ddd"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#666">No image</text></svg>';
  document.getElementById('detail-description').textContent = item.description || '-';
  document.getElementById('detail-price').textContent = item.price.toFixed(2);
  document.getElementById('detail-quantity').value = item.qty;
  document.getElementById('detail-total').textContent = (item.price * item.qty).toFixed(2);

  // show panels
  document.getElementById('detailPanel').style.display = 'block';
  document.getElementById('formPanel').style.display = 'none';
}

function hideDetailPanel(){
  document.getElementById('detailPanel').style.display = 'none';
}

function switchToEditMode(){
  const item = inventory.find(i=>i.id===currentDetailId);
  if(!item) return;
  document.querySelector('.detail-view .read-mode').style.display = 'none';
  document.querySelector('.detail-view .edit-mode').style.display = 'block';

  document.getElementById('edit-name').value = item.name;
  document.getElementById('edit-description').value = item.description;
  document.getElementById('edit-price').value = item.price;
  document.getElementById('edit-quantity').value = item.qty;
  document.getElementById('edit-image').value = item.image || '';
}

function cancelEdit(){
  document.querySelector('.detail-view .read-mode').style.display = 'block';
  document.querySelector('.detail-view .edit-mode').style.display = 'none';
}

function saveEdit(){
  const idx = inventory.findIndex(i=>i.id===currentDetailId);
  if(idx === -1) return;
  inventory[idx].name = document.getElementById('edit-name').value.trim();
  inventory[idx].description = document.getElementById('edit-description').value.trim();
  inventory[idx].price = parseFloat(document.getElementById('edit-price').value) || 0;
  inventory[idx].qty = parseInt(document.getElementById('edit-quantity').value) || 0;
  inventory[idx].image = document.getElementById('edit-image').value.trim();
  saveInventory();
  renderInventory();
  cancelEdit();
  hideDetailPanel();
}

/* ---------- CRUD ---------- */
function editItem(id){
  showDetail(id);
  switchToEditMode();
}

function deleteItem(id){
  if(!confirm('Delete this item from inventory?')) return;
  inventory = inventory.filter(i=>i.id!==id);
  saveInventory();
  renderInventory();
}

/* ---------- form panel toggles ---------- */
function toggleFormPanel(){
  const p = document.getElementById('formPanel');
  p.style.display = (p.style.display === 'block') ? 'none' : 'block';
  document.getElementById('detailPanel').style.display = 'none';
}
function closeFormPanel(){ document.getElementById('formPanel').style.display = 'none'; }

/* ---------- quantity adjustments in detail ---------- */
function increaseQuantity(){
  const item = inventory.find(i=>i.id===currentDetailId);
  if(!item) return;
  item.qty++;
  saveInventory();
  document.getElementById('detail-quantity').value = item.qty;
  document.getElementById('detail-total').textContent = (item.qty * item.price).toFixed(2);
  renderInventory();
}
function decreaseQuantity(){
  const item = inventory.find(i=>i.id===currentDetailId);
  if(!item) return;
  if(item.qty>0) item.qty--;
  saveInventory();
  document.getElementById('detail-quantity').value = item.qty;
  document.getElementById('detail-total').textContent = (item.qty * item.price).toFixed(2);
  renderInventory();
}

/* ---------- CART ---------- */
function addToCartFromInventory(itemId){
  const item = inventory.find(i=>i.id===itemId);
  if(!item) return alert('Item not found.');
  const cartItem = cart.find(c=>c.id===itemId);
  if(cartItem){
    cartItem.qty++;
  } else {
    cart.push({ id: item.id, name: item.name, price: item.price, qty: 1 });
  }
  saveCart();
  renderCartCount();
  alert('Added to cart.');
}

function renderCartCount(){
  const count = cart.reduce((s,it)=>s+it.qty, 0);
  document.getElementById('cartCount').textContent = count;
}

function showCart(){
  updateCartUI();
  document.getElementById('cartDrawer').style.display = 'block';
}
function closeCart(){
  document.getElementById('cartDrawer').style.display = 'none';
}

function updateCartUI(){
  const container = document.getElementById('cartItemsContainer');
  container.innerHTML = '';
  if(cart.length===0){ container.innerHTML = '<p><i>Cart is empty</i></p>'; document.getElementById('cartSummary').innerHTML = ''; return; }
  cart.forEach(it=>{
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <div style="flex:1;">
        <strong>${escapeHtml(it.name)}</strong><br/>
        ₹${it.price.toFixed(2)} x ${it.qty}
      </div>
      <div style="display:flex; flex-direction:column; gap:6px;">
        <button onclick="changeCartQty('${it.id}', 1)">+</button>
        <button onclick="changeCartQty('${it.id}', -1)">-</button>
        <button onclick="removeFromCart('${it.id}')" style="background:#f44336;">Remove</button>
      </div>
    `;
    container.appendChild(div);
  });
  renderCartSummary();
}

function changeCartQty(id, delta){
  const it = cart.find(c=>c.id===id);
  if(!it) return;
  it.qty += delta;
  if(it.qty <= 0){
    cart = cart.filter(c=>c.id!==id);
  }
  saveCart();
  renderCartCount();
  updateCartUI();
}

function removeFromCart(id){
  cart = cart.filter(c=>c.id!==id);
  saveCart();
  renderCartCount();
  updateCartUI();
}

function clearCart(){
  if(!confirm('Clear cart?')) return;
  cart = [];
  saveCart();
  renderCartCount();
  updateCartUI();
}

/* ---------- summary & checkout ---------- */
function renderCartSummary(){
  const sub = cart.reduce((s,it)=>s + (it.price * it.qty), 0);
  const discountPct = parseFloat(document.getElementById('discountPct').value) || 0;
  const discountAmount = sub * (discountPct/100);
  const taxable = sub - discountAmount;
  const taxPct = 0; // set to 0 or change to say 12% etc
  const tax = taxable * (taxPct/100);
  const grand = taxable + tax;

  const summary = `
    Subtotal: ₹${sub.toFixed(2)} <br/>
    Discount (${discountPct}%): -₹${discountAmount.toFixed(2)} <br/>
    Tax (${taxPct}%): ₹${tax.toFixed(2)} <br/>
    <strong>Total: ₹${grand.toFixed(2)}</strong>
  `;
  document.getElementById('cartSummary').innerHTML = summary;
}

function checkout(){
  if(cart.length===0) return alert('Cart is empty.');
  // build invoice object
  const discountPct = parseFloat(document.getElementById('discountPct').value) || 0;
  const invoice = {
    id: 'INV-' + Date.now(),
    date: new Date().toLocaleString(),
    items: JSON.parse(JSON.stringify(cart)),
    discountPct
  };
  generateAndPrintInvoice(invoice);
}

/* ---------- invoice generation & printing ---------- */
function generateAndPrintInvoice(inv){
  // compute totals
  const sub = inv.items.reduce((s,it)=>s + (it.price * it.qty), 0);
  const discountAmount = sub * (inv.discountPct/100);
  const taxable = sub - discountAmount;
  const taxPct = 0; // change if needed
  const tax = taxable * (taxPct/100);
  const grand = taxable + tax;

  // build HTML
  let rows = '';
  inv.items.forEach((it, idx)=>{
    rows += `<tr>
      <td>${idx+1}</td>
      <td>${escapeHtml(it.name)}</td>
      <td style="text-align:right;">${it.qty}</td>
      <td style="text-align:right;">₹${it.price.toFixed(2)}</td>
      <td style="text-align:right;">₹${(it.price*it.qty).toFixed(2)}</td>
    </tr>`;
  });

  const invoiceHtml = `
  <html>
    <head>
      <title>Invoice ${inv.id}</title>
      <style>
        body{ font-family: Arial, sans-serif; padding:20px; color:#111; }
        .invoice{ max-width:800px; margin:0 auto; }
        header{ display:flex; justify-content:space-between; align-items:center; }
        table{ width:100%; border-collapse:collapse; margin-top:12px; }
        table th, table td{ border:1px solid #ddd; padding:8px; font-size:14px; }
        table th{ background:#f4f4f4; }
        .totals{ margin-top:12px; width:100%; display:flex; justify-content:flex-end; }
        .totals div{ width:300px; }
        .right { text-align:right; }
        @media print {
          @page { margin: 10mm; }
        }
      </style>
    </head>
    <body>
      <div class="invoice">
        <header>
          <div>
            <h2>My Shop Name</h2>
            <div>Address line 1</div>
            <div>Phone: 0000000000</div>
          </div>
          <div>
            <strong>Invoice: ${inv.id}</strong><br/>
            <small>${inv.date}</small>
          </div>
        </header>

        <table>
          <thead>
            <tr>
              <th>#</th><th>Description</th><th>Qty</th><th>Rate</th><th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>

        <div class="totals">
          <div>
            <div style="display:flex; justify-content:space-between; padding:4px 0;"><div>Subtotal</div><div class="right">₹${sub.toFixed(2)}</div></div>
            <div style="display:flex; justify-content:space-between; padding:4px 0;"><div>Discount (${inv.discountPct}%)</div><div class="right">-₹${discountAmount.toFixed(2)}</div></div>
            <div style="display:flex; justify-content:space-between; padding:4px 0;"><div>Tax</div><div class="right">₹${tax.toFixed(2)}</div></div>
            <hr/>
            <div style="display:flex; justify-content:space-between; padding:6px 0; font-weight:bold;"><div>Total</div><div class="right">₹${grand.toFixed(2)}</div></div>
          </div>
        </div>

        <p style="margin-top:28px; font-size:12px;">Thank you for your purchase!</p>
      </div>
      <script>
        setTimeout(()=>{ window.print(); }, 300);
        // close window after print (some browsers block close)
        window.onafterprint = () => { try{ window.close(); }catch(e){} };
      </script>
    </body>
  </html>
  `;

  // open new window and write invoice
  const w = window.open('', '_blank');
  w.document.open();
  w.document.write(invoiceHtml);
  w.document.close();

  // reduce inventory quantities based on cart
  inv.items.forEach(ci=>{
    const it = inventory.find(i=>i.id===ci.id);
    if(it){
      it.qty = Math.max(0, it.qty - ci.qty);
    }
  });
  saveInventory();

  // clear cart
  cart = [];
  saveCart();
  renderCartCount();
  renderInventory();
}

/* ---------- small chat assistant (toy) ---------- */
function toggleChatbot(){
  const c = document.getElementById('chatbotContainer');
  c.style.display = (c.style.display === 'block') ? 'none' : 'block';
}
function sendMessage(){
  const input = document.getElementById('chatInput');
  const msg = input.value.trim();
  if(!msg) return;
  const msgBox = document.createElement('div');
  msgBox.className = 'user-message';
  msgBox.textContent = msg;
  document.getElementById('chatbotMessages').appendChild(msgBox);

  // tiny builtin responses
  const bot = document.createElement('div');
  bot.className = 'bot-message';

  const lower = msg.toLowerCase();
  if(lower.includes('help')){
    bot.innerHTML = 'Commands: <br>- "list": show inventory count <br>- "cart": show cart count <br>- "clear cart": clears cart';
  } else if(lower.includes('list')){
    bot.textContent = 'Inventory: ' + inventory.map(i=>`${i.name}(${i.qty})`).slice(0,6).join(', ');
  } else if(lower.includes('cart')){
    bot.textContent = `Cart items: ${cart.length}  — total qty ${cart.reduce((s,it)=>s+it.qty,0)}`;
  } else if(lower.includes('clear cart')){
    cart = [];
    saveCart();
    renderCartCount();
    bot.textContent = 'Cart cleared.';
  } else {
    bot.textContent = "Sorry, I can only answer a few inventory commands (try 'help').";
  }
  document.getElementById('chatbotMessages').appendChild(bot);
  input.value = '';
  // scroll
  document.getElementById('chatbotMessages').scrollTop = document.getElementById('chatbotMessages').scrollHeight;
}

/* ---------- small helpers ---------- */
function showAlert(msg){ alert(msg); }
