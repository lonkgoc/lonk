// profile.js - Identity & Commerce Logic

// Elements
const uName = document.getElementById('uName');
const uEmail = document.getElementById('uEmail');
const uPhone = document.getElementById('uPhone');
const editBtn = document.getElementById('editBtn');
const saveBtn = document.getElementById('saveBtn');

const cartList = document.getElementById('cartList');
const cartCount = document.getElementById('cartCount');
const cartTotalDiv = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');
const orderList = document.getElementById('orderList');
const cartBadge = document.getElementById('cartBadge');

// Init
document.addEventListener('DOMContentLoaded', () => {
    loadProfile();
    loadCart();
    loadOrders();

    // Button Listeners
    editBtn.onclick = enableEdit;
    saveBtn.onclick = saveProfile;
    checkoutBtn.onclick = handleCheckout;
});

// --- PROFILE LOGIC ---
function loadProfile() {
    const user = DataService.getUserProfile();
    uName.value = user.name;
    uEmail.value = user.email;
    uPhone.value = user.phone;
}

function enableEdit() {
    uName.disabled = false;
    uEmail.disabled = false;
    uPhone.disabled = false;
    editBtn.style.display = 'none';
    saveBtn.style.display = 'inline-block';
}

function saveProfile() {
    const data = {
        name: uName.value,
        email: uEmail.value,
        phone: uPhone.value
    };
    DataService.saveUserProfile(data);

    uName.disabled = true;
    uEmail.disabled = true;
    uPhone.disabled = true;
    editBtn.style.display = 'inline-block';
    saveBtn.style.display = 'none';

    alert('Identity Updated. Continue the chaos.');
}

// --- CART LOGIC ---
function loadCart() {
    const cart = DataService.getCart();

    // Update Header Badge
    if (cartBadge) {
        cartBadge.innerText = cart.length;
        cartBadge.style.display = cart.length > 0 ? 'inline-block' : 'none';
    }

    // Update Page
    cartCount.innerText = cart.length;
    cartList.innerHTML = '';

    if (cart.length === 0) {
        cartList.innerHTML = '<p style="text-align:center; color:var(--muted); padding:20px;">Cart is empty. Go feed it.</p>';
        cartTotalDiv.style.display = 'none';
        checkoutBtn.style.display = 'none';
        return;
    }

    let total = 0;
    cart.forEach((product, index) => {
        const price = Math.floor(product.price - (product.price * (product.discount / 100)));
        total += price;

        cartList.innerHTML += `
      <div class="cart-item">
        <div style="display: flex; align-items: center;">
          <img src="${product.image}" alt="${product.name}">
          <div>
            <h4 style="font-family: 'Syne'; margin:0;">${product.name}</h4>
            <p style="font-size: 14px; color: var(--muted); margin:0;">${product.size?.[0] || 'One Size'} • ₹${price}</p>
          </div>
        </div>
        <button class="nav-btn" style="padding: 5px 10px; font-size: 12px; border-color: var(--accent); color: var(--accent);" 
          onclick="removeItem(${index})">Remove</button>
      </div>
    `;
    });

    cartTotalDiv.querySelector('span').innerText = total;
    cartTotalDiv.style.display = 'block';
    checkoutBtn.style.display = 'block';
}

// Global remove function
window.removeItem = (index) => {
    DataService.removeFromCart(index);
    loadCart(); // Reload UI
}

function handleCheckout() {
    const cart = DataService.getCart();
    let total = 0;
    cart.forEach(p => total += Math.floor(p.price - (p.price * (p.discount / 100))));

    if (confirm(`Confirm order for ₹${total}?`)) {
        DataService.createOrder(cart, total);
        alert('Order Placed! The chaos is on its way.');
        loadCart();
        loadOrders();
        // Scroll to orders
        orderList.scrollIntoView({ behavior: 'smooth' });
    }
}

// --- ORDER LOGIC ---
function loadOrders() {
    const orders = DataService.getOrders();
    orderList.innerHTML = '';

    if (orders.length === 0) {
        orderList.innerHTML = '<p style="text-align:center; color:var(--muted);">No past chaos found.</p>';
        return;
    }

    orders.forEach(order => {
        const itemNames = order.items.map(i => i.name).join(', ');

        orderList.innerHTML += `
      <div class="order-item">
        <div>
          <h4 style="font-family: 'Syne'">${order.id}</h4>
          <p style="font-size: 14px; color: var(--muted)">${order.date} • ${order.items.length} items</p>
          <p style="font-size: 12px; margin-top: 5px; color: var(--text); opacity: 0.8;">${itemNames}</p>
        </div>
        <div style="text-align: right">
          <p style="font-weight: bold">₹${order.total}</p>
          <span style="font-size: 12px; background: var(--secondary); padding: 4px 8px; border-radius: 5px; color: #fff">${order.status}</span>
        </div>
      </div>
    `;
    });
}
