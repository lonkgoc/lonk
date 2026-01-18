// admin.js - The Governance of Chaos

// Dom Elements
const form = document.getElementById('productForm');
const previewContainer = document.getElementById('previewContainer');

// Listeners
form.addEventListener('submit', handleFormSubmit);
form.addEventListener('input', updatePreview);

// Handle Submit
function handleFormSubmit(e) {
    e.preventDefault();

    const product = getProductFromForm();

    // Basic validation
    if (!product.name || !product.price || !product.image) {
        alert('Fill in the chaos details properly!');
        return;
    }

    // Save via DataService
    DataService.addProduct(product);

    alert('Product Uploaded to the Matrix! Check the Shop.');
    form.reset();
    updatePreview();
}

// Update Preview Card
function updatePreview() {
    const product = getProductFromForm();

    // If fields are empty, show placeholder
    if (!product.name) product.name = "Your Product Name";
    if (!product.price) product.price = 999;
    if (!product.image) product.image = "https://via.placeholder.com/300x350?text=Image+URL";

    // Use the same createProductCard function?
    // We can duplicate the HTML logic here or import it if modular.
    // For simplicity, I'll rewrite the template string logic here matching shop.js

    const discountedPrice = Math.floor(product.price - (product.price * (product.discount / 100)));
    const hasDiscount = product.discount > 0;

    const html = `
    <div class="product-card">
      ${hasDiscount ? `<div class="discount-badge">-${product.discount}%</div>` : ''}
      
      <img src="${product.image}" alt="${product.name}" class="product-image" style="height: 350px; width: 100%; object-fit: cover;">
      
      <div class="product-info" style="padding: 20px;">
        <div class="product-category" style="font-size: 12px; color: var(--secondary); text-transform: uppercase;">${product.category} • ${product.type}</div>
        <h3 class="product-name" style="font-family: 'Syne'; margin: 5px 0;">${product.name}</h3>
        
        <div class="product-price" style="font-weight: bold; font-size: 20px; color: var(--accent);">
          ₹${discountedPrice}
          ${hasDiscount ? `<span class="original-price" style="font-size: 14px; text-decoration: line-through; color: var(--muted); margin-left:10px;">₹${product.price}</span>` : ''}
        </div>
      </div>
    </div>
  `;

    previewContainer.innerHTML = html;
}

// Extract Data
function getProductFromForm() {
    return {
        name: document.getElementById('pName').value,
        image: document.getElementById('pImage').value,
        category: document.getElementById('pCategory').value,
        type: document.getElementById('pType').value,
        price: parseFloat(document.getElementById('pPrice').value) || 0,
        discount: parseFloat(document.getElementById('pDiscount').value) || 0,
        color: document.getElementById('pColor').value,
        size: ['S', 'M', 'L'], // Default sizes for custom products
        tags: ['New', 'Custom']
    };
}

// Initial Preview
updatePreview();
