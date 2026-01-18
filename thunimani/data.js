// data.js - The Brain of Chaos

// --- PRODUCT GENERATION (Existing Logic) ---
const VIBE_CATEGORIES = [
  "Oversized Tees", "Streetwear Mayhem", "Cotton Classics", "Hoodie Culture",
  "Nightwear Nightmares", "Summer Fits", "Layered Looks", "Graphic Tees",
  "Denim Dreams", "Accessory Anarchy", "Vintage Vibes", "Eco Warriors", "Festival Frenzy"
];
const COLORS = ["Black", "White", "Red", "Blue", "Green", "Yellow", "Purple", "Pink", "Multi"];
const IMAGE_MAP = {
  "Oversized Tees": ["1576566588028-4147f3842f27", "1521572163474-6864f9cf17ab", "1583743814966-8936f5b7be1a"],
  "Streetwear Mayhem": ["1552374196-1ab2a1c593e8", "1544441893-675973e31985", "1550614000-4b9519e0078a"],
  "Cotton Classics": ["1596755094514-f87e34085b2c", "1602810318383-e386cc2a3ccf", "1523381210434-271e8be1f52b"],
  "Hoodie Culture": ["1556821840-3a63f95609a7", "1515886657613-9f3515b0c78f", "1564557287817-3785e38aea3f"],
  "Nightwear Nightmares": ["1620799140408-ed5341cd2431", "1519238263496-63539303579c", "1584270275529-573523447959"],
  "Summer Fits": ["1519241047957-be31e73f8a37", "1572804013309-59a88b7e92f1", "1543087903-afe2f96956c3"],
  "Layered Looks": ["1514333036428-2d7c0430db83", "1483985988355-763728e1935b", "1487222477894-8943e31ef7b2"],
  "Graphic Tees": ["1554568218-0f1715e72254", "1503342394128-c104d54dba01", "1576566588028-4147f3842f27"],
  "Denim Dreams": ["1542272617-08f086303294", "1541099649105-df13a44c47f5", "1582552938306-04dd39515760"],
  "Accessory Anarchy": ["1575452285199-52c6f131a396", "1576871337632-b9aef4c17ab9", "1523292562227-99b44e6c29af"],
  "Vintage Vibes": ["1582142327304-26d6e28c460d", "1506152983158-b4a74a01c721", "1490481651871-32d87cd87733"],
  "Eco Warriors": ["1562157879902-1b080c615881", "1591047139829-d91aecb6caea", "1545959647204-7e04b4c2b535"],
  "Festival Frenzy": ["1536766820879-059fec98ec0a", "1496747611176-843222e1e57c", "1529139574466-a302d2052574"]
};

function generateProduct(id, gender, vibe, i) {
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  const basePrice = Math.floor(Math.random() * (5000 - 500) + 500);
  const discount = Math.random() > 0.5 ? Math.floor(Math.random() * 50) : 0;
  const images = IMAGE_MAP[vibe] || IMAGE_MAP["Oversized Tees"];
  const imgId = images[i % images.length];
  const image = `https://images.unsplash.com/photo-${imgId}?q=80&w=400&auto=format&fit=crop`; // Optimized size

  return {
    id: `${gender[0]}${i}_${vibe.split(' ')[0]}`,
    name: `${vibe} ${gender} #${i + 1}`,
    category: gender,
    type: vibe,
    price: basePrice,
    discount: discount,
    image: image,
    color: color,
    size: gender === 'Kids' ? ['2Y', '4Y', '6Y'] : ['S', 'M', 'L', 'XL'],
    tags: [vibe, 'New']
  };
}

let generatedProducts = [];
const GENDERS = ['Men', 'Women', 'Kids', 'Unisex'];
const ITEMS_PER_CATEGORY = 12;

VIBE_CATEGORIES.forEach(vibe => {
  GENDERS.forEach(gender => {
    for (let i = 0; i < ITEMS_PER_CATEGORY; i++) {
      generatedProducts.push(generateProduct(`gen_${vibe}_${gender}_${i}`, gender, vibe, i));
    }
  });
});

// --- DATA SERVICE ---
const DataService = {
  // PRODUCTS
  getAllProducts: () => {
    const stored = localStorage.getItem('thunimani_products');
    const customProducts = stored ? JSON.parse(stored) : [];
    // Important: Put custom products first so they are easy to find
    return [...customProducts, ...generatedProducts];
  },

  addProduct: (product) => {
    const stored = localStorage.getItem('thunimani_products');
    const customProducts = stored ? JSON.parse(stored) : [];
    const newProduct = { ...product, id: 'custom_' + Date.now() };
    customProducts.push(newProduct);
    localStorage.setItem('thunimani_products', JSON.stringify(customProducts));
    return newProduct;
  },

  getVibeCategories: () => VIBE_CATEGORIES,

  // PROFILE & USER
  getUserProfile: () => {
    const stored = localStorage.getItem('thunimani_user');
    return stored ? JSON.parse(stored) : {
      name: "New Chaos Member",
      email: "email@chaos.com",
      phone: "+91 9999999999"
    };
  },

  saveUserProfile: (data) => {
    localStorage.setItem('thunimani_user', JSON.stringify(data));
  },

  // CART
  getCart: () => {
    const stored = localStorage.getItem('thunimani_cart');
    return stored ? JSON.parse(stored) : [];
  },

  addToCart: (product) => {
    const cart = DataService.getCart();
    cart.push(product);
    localStorage.setItem('thunimani_cart', JSON.stringify(cart));
    // Trigger event for UI updates
    window.dispatchEvent(new Event('cartUpdated'));
  },

  removeFromCart: (index) => {
    const cart = DataService.getCart();
    cart.splice(index, 1);
    localStorage.setItem('thunimani_cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
  },

  clearCart: () => {
    localStorage.removeItem('thunimani_cart');
    window.dispatchEvent(new Event('cartUpdated'));
  },

  // ORDERS
  getOrders: () => {
    const stored = localStorage.getItem('thunimani_orders');
    return stored ? JSON.parse(stored) : [];
  },

  createOrder: (cartItems, totalAmount) => {
    const orders = DataService.getOrders();
    const newOrder = {
      id: 'ORD-' + Date.now(),
      date: new Date().toLocaleDateString(),
      items: cartItems,
      total: totalAmount,
      status: 'Processing'
    };
    orders.unshift(newOrder); // Newest first
    localStorage.setItem('thunimani_orders', JSON.stringify(orders));
    DataService.clearCart();
    return newOrder;
  }
};
