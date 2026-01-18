// shop.js - The Logic of Madness (Optimized)

// State
let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
const ITEMS_PER_PAGE = 24; // Optimized for 3/4 column grids

let currentFilters = {
    category: [],
    type: [],
    color: [],
    maxPrice: 10000
};
let currentSort = 'featured';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    allProducts = DataService.getAllProducts();

    // Initial Filter & Render
    applyFilters();

    // Event Listeners
    setupEventListeners();
    updateCartBadge();

    // Listen for global cart updates
    window.addEventListener('cartUpdated', updateCartBadge);
});

function setupEventListeners() {
    // Checkboxes
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(box => {
        box.addEventListener('change', () => {
            currentPage = 1; // Reset to page 1 on filter change
            updateFilters();
        });
    });

    // Price Range
    const priceRange = document.getElementById('priceRange');
    priceRange.addEventListener('input', (e) => {
        document.getElementById('priceValue').innerText = e.target.value;
        currentPage = 1;
        updateFilters();
    });

    // Sort
    document.getElementById('sortSort').addEventListener('change', (e) => {
        currentSort = e.target.value;
        currentPage = 1;
        applyFilters();
    });
}

function updateFilters() {
    const getCheckedValues = (name) => {
        return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`))
            .map(cb => cb.value);
    };

    currentFilters.category = getCheckedValues('category');
    currentFilters.type = getCheckedValues('type');
    currentFilters.color = getCheckedValues('color');
    currentFilters.maxPrice = document.getElementById('priceRange').value;

    applyFilters();
}

function applyFilters() {
    let temp = allProducts;

    // 1. Category
    if (currentFilters.category.length > 0) {
        temp = temp.filter(p => currentFilters.category.includes(p.category));
    }
    // 2. Type
    if (currentFilters.type.length > 0) {
        temp = temp.filter(p => currentFilters.type.includes(p.type));
    }
    // 3. Color
    if (currentFilters.color.length > 0) {
        temp = temp.filter(p => currentFilters.color.includes(p.color));
    }
    // 4. Price
    temp = temp.filter(p => p.price <= currentFilters.maxPrice);

    // 5. Sort
    switch (currentSort) {
        case 'lowHigh': temp.sort((a, b) => a.price - b.price); break;
        case 'highLow': temp.sort((a, b) => b.price - a.price); break;
        case 'discount': temp.sort((a, b) => b.discount - a.discount); break;
    }

    filteredProducts = temp;
    renderProducts();
}

function renderProducts() {
    const grid = document.getElementById('productGrid');
    const countSpan = document.getElementById('productCount');

    countSpan.innerText = filteredProducts.length;
    grid.innerHTML = '';

    if (filteredProducts.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 50px;"><h3>No chaos found. Reset filters!</h3></div>';
        return;
    }

    // PAGINATION LOGIC
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const pageItems = filteredProducts.slice(startIndex, endIndex);

    pageItems.forEach(product => {
        grid.innerHTML += createProductCard(product);
    });

    // APPEND PAGINATION CONTROLS
    renderPaginationControls(grid);
}

function renderPaginationControls(container) {
    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
    if (totalPages <= 1) return;

    const paginationDiv = document.createElement('div');
    paginationDiv.className = 'pagination-controls';
    paginationDiv.style.gridColumn = '1 / -1';
    paginationDiv.style.display = 'flex';
    paginationDiv.style.justifyContent = 'center';
    paginationDiv.style.gap = '20px';
    paginationDiv.style.marginTop = '40px';

    const prevBtn = document.createElement('button');
    prevBtn.className = 'nav-btn';
    prevBtn.innerHTML = '<i class="fa-solid fa-arrow-left"></i> Prev';
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => { if (currentPage > 1) { currentPage--; renderProducts(); window.scrollTo(0, 0); } };

    const nextBtn = document.createElement('button');
    nextBtn.className = 'nav-btn';
    nextBtn.innerHTML = 'Next <i class="fa-solid fa-arrow-right"></i>';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.onclick = () => { if (currentPage < totalPages) { currentPage++; renderProducts(); window.scrollTo(0, 0); } };

    const info = document.createElement('span');
    info.style.alignSelf = 'center';
    info.innerText = `Page ${currentPage} of ${totalPages}`;

    paginationDiv.appendChild(prevBtn);
    paginationDiv.appendChild(info);
    paginationDiv.appendChild(nextBtn);
    container.appendChild(paginationDiv);
}

function createProductCard(product) {
    const discountedPrice = Math.floor(product.price - (product.price * (product.discount / 100)));
    const hasDiscount = product.discount > 0;
    // Use string replace to safely escape quotes if needed, though product names are simple here
    return `
    <div class="product-card">
      ${hasDiscount ? `<div class="discount-badge">-${product.discount}%</div>` : ''}
      <img src="${product.image}" alt="${product.name}" class="product-image" loading="lazy">
      <div class="product-info">
        <div class="product-category">${product.category} • ${product.type}</div>
        <h3 class="product-name">${product.name}</h3>
        <div class="product-price">
          ₹${discountedPrice}
          ${hasDiscount ? `<span class="original-price">₹${product.price}</span>` : ''}
        </div>
        <button class="nav-btn" style="width: 100%; margin-top: 15px; margin-left: 0;" 
          onclick="addToCart('${product.id}')">
          Add to Cart
        </button>
      </div>
    </div>
  `;
}

// Global addToCart helper to find product object by ID
window.addToCart = (id) => {
    const product = allProducts.find(p => p.id === id);
    if (product) {
        DataService.addToCart(product);
        alert(`Added ${product.name} to Cart!`);
    }
};

function updateCartBadge() {
    // Logic to update cart count in nav (will be implemented in html updates)
    const cart = DataService.getCart();
    const badge = document.getElementById('cartBadge');
    if (badge) {
        badge.innerText = cart.length;
        badge.style.display = cart.length > 0 ? 'inline-block' : 'none';
    }
}
