// Mobile menu toggle functionality
const menuToggle = document.getElementById('menuToggle');
const sideNav = document.getElementById('sideNav');

if (menuToggle && sideNav) {
    menuToggle.addEventListener('click', () => {
        sideNav.classList.toggle('active');
    });

    // Close menu when clicking outside on mobile
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 992) {
            if (!sideNav.contains(e.target) && e.target !== menuToggle) {
                sideNav.classList.remove('active');
            }
        }
    });
}

// Main functionality for cart and categories
document.addEventListener('DOMContentLoaded', function() {
    // Get all add to cart buttons
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    
    // Add click event listeners to all buttons
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Get the parent item div (works for both featured-item and menu-item)
            const itemElement = this.closest('.featured-item') || this.closest('.menu-item');
            
            // Extract item details
            const name = itemElement.querySelector('h3').innerText;
            const description = itemElement.querySelector('p') ? itemElement.querySelector('p').innerText : '';
            
            // Handle different price formats
            const priceElement = itemElement.querySelector('.price span') || itemElement.querySelector('.price');
            const priceText = priceElement.innerText;
            const price = parseFloat(priceText.replace('Rs', '').trim());
            
            const image = itemElement.querySelector('img').src;
            
            // Get category if it exists
            const categoryElement = itemElement.querySelector('.category');
            const category = categoryElement ? categoryElement.innerText : null;
            
            // Get existing cart items from localStorage
            const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
            
            // Check if item already exists in cart
            const existingItemIndex = cartItems.findIndex(item => item.name === name);
            
            if (existingItemIndex !== -1) {
                // If item exists, increase quantity
                cartItems[existingItemIndex].quantity += 1;
            } else {
                // If item doesn't exist, add new item
                const newItem = {
                    name: name,
                    description: description,
                    price: price,
                    image: image,
                    quantity: 1
                };
                
                // Add category if it exists
                if (category) {
                    newItem.category = category;
                }
                
                cartItems.push(newItem);
            }
            
            // Save updated cart to localStorage
            localStorage.setItem('cartItems', JSON.stringify(cartItems));
            
            // Show toast notification
            showToast('Item added to cart!');
            
            // Update cart count in navbar and cart display if on cart page
            updateNavCartCount();
            if (document.getElementById('cart-items')) {
                updateCartDisplay();
            }
        });
    });
    
    // Initialize cart count on page load
    updateNavCartCount();
    
    // Initialize cart display if on cart page
    if (document.getElementById('cart-items')) {
        updateCartDisplay();
    }

    // Initialize checkout page if on checkout page
    if (document.querySelector('.order-summary')) {
        initializeCheckoutPage();
    }

    // Category filter functionality
    const categoryFilters = document.querySelectorAll('.category-filter');
    categoryFilters.forEach(filter => {
        filter.addEventListener('click', function() {
            // Remove active class from all filters
            categoryFilters.forEach(f => f.classList.remove('active'));
            // Add active class to clicked filter
            this.classList.add('active');
            
            const category = this.textContent;
            filterMenuItems(category);
        });
    });
});

// Function to initialize checkout page
// Function to initialize checkout page
function initializeCheckoutPage() {
    // Try to get cart items from localStorage
    let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    
    // If no items in localStorage, use sample data for testing
    if (cartItems.length === 0) {
        cartItems = [
            {
                name: "Classic Burger",
                price: 188.99,
                quantity: 1
            },
            {
                name: "Margherita Pizza",
                price: 112.99,
                quantity: 2
            }
        ];
    }
    
    const orderItemsContainer = document.querySelector('.order-items');
    const subtotalElement = document.getElementById('subtotal') || document.querySelector('.summary-item:nth-child(1) span:last-child');
    const taxElement = document.querySelector('.summary-item:nth-child(3) span:last-child');
    const totalElement = document.querySelector('.summary-total span:last-child');
    
    // Calculate totals
    let subtotal = 0;
    const deliveryFee = 30; // Fixed delivery fee
    const taxRate = 0.05; // 5% tax
    
    // Clear existing items
    if (orderItemsContainer) {
        orderItemsContainer.innerHTML = '';
        
        // Add each item to the order summary
        cartItems.forEach((item) => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            
            const itemElement = document.createElement('div');
            itemElement.className = 'order-item';
            itemElement.innerHTML = `
                <div class="item-name">
                    <span>${item.quantity}</span>
                    ${item.name}
                </div>
                <div class="item-price">Rs${itemTotal.toFixed(2)}</div>
            `;
            orderItemsContainer.appendChild(itemElement);
        });
    }
    
    // Calculate tax and total
    const tax = subtotal * taxRate;
    const total = subtotal + deliveryFee + tax;
    
    // Update the summary
    if (subtotalElement) subtotalElement.textContent = `Rs${subtotal.toFixed(2)}`;
    if (taxElement) taxElement.textContent = `Rs${tax.toFixed(2)}`;
    if (document.querySelector('.summary-item:nth-child(2) span:last-child')) {
        document.querySelector('.summary-item:nth-child(2) span:last-child').textContent = `Rs${deliveryFee.toFixed(2)}`;
    }
    if (totalElement) totalElement.textContent = `Rs${total.toFixed(2)}`;
    
    // Handle place order button
    const placeOrderBtn = document.getElementById('place-order-btn');
    if (placeOrderBtn) {
        placeOrderBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Validate form
            const form = document.getElementById('order-form');
            if (form && !form.checkValidity()) {
                form.reportValidity();
                return;
            }
            
            // Show order tracking section
            const orderTracking = document.getElementById('order-tracking');
            if (orderTracking) {
                orderTracking.style.display = 'block';
                if (document.getElementById('driver-info')) {
                    document.getElementById('driver-info').style.display = 'flex';
                }
                
                // Scroll to tracking section
                orderTracking.scrollIntoView({ behavior: 'smooth' });
            }
            
            // Clear cart after order is placed
            localStorage.removeItem('cartItems');
            
            // Update cart count in nav
            updateNavCartCount();
        });
    }
    
    // Handle delivery time selection
    const deliveryTimeSelect = document.getElementById('delivery-time');
    const scheduledTimeContainer = document.getElementById('scheduled-time-container');
    
    if (deliveryTimeSelect && scheduledTimeContainer) {
        deliveryTimeSelect.addEventListener('change', function() {
            if (this.value === 'schedule') {
                scheduledTimeContainer.style.display = 'block';
            } else {
                scheduledTimeContainer.style.display = 'none';
            }
        });
    }
}

// Make sure the function is called when the page is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('.order-summary')) {
        initializeCheckoutPage();
    }
});

// Rest of your existing functions remain the same...
// (filterMenuItems, showToast, updateNavCartCount, updateCartDisplay, updateQuantity, removeFromCart)
// These functions don't need any changes

// Function to filter menu items by category
function filterMenuItems(category) {
    const menuItems = document.querySelectorAll('.menu-item');
    
    menuItems.forEach(item => {
        const itemCategory = item.querySelector('.category').innerText;
        
        if (category === 'All' || itemCategory === category) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// Function to show toast notification
function showToast(message) {
    // Create toast if it doesn't exist
    let toast = document.getElementById('toast');
    
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        
        const icon = document.createElement('i');
        icon.className = 'fas fa-check-circle';
        toast.appendChild(icon);
        
        const span = document.createElement('span');
        span.id = 'toast-message';
        toast.appendChild(span);
        
        document.body.appendChild(toast);
    }
    
    // Update toast message
    const messageElement = document.getElementById('toast-message');
    if (messageElement) {
        messageElement.textContent = message;
    }
    
    // Show toast
    toast.classList.add('show');
    
    // Hide toast after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Function to update cart count in navbar
function updateNavCartCount() {
    const navCartCount = document.getElementById('nav-cart-count');
    if (navCartCount) {
        const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
        const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
        navCartCount.textContent = totalItems > 0 ? `(${totalItems})` : '(0)';
    }
}

// Function to update cart display based on localStorage
function updateCartDisplay() {
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    const emptyCartElement = document.getElementById('cart-empty');
    const cartItemsElement = document.getElementById('cart-items');
    const cartSummaryElement = document.getElementById('cart-summary');
    
    if (!cartItemsElement) return; // Exit if not on cart page
    
    if (cartItems.length === 0) {
        // Show empty cart message
        emptyCartElement.style.display = 'block';
        cartItemsElement.innerHTML = '';
        cartSummaryElement.style.display = 'none';
    } else {
        // Hide empty cart message and show items
        emptyCartElement.style.display = 'none';
        cartSummaryElement.style.display = 'block';
        
        // Clear and rebuild cart items
        cartItemsElement.innerHTML = '';
        
        // Calculate totals
        let subtotal = 0;
        
        cartItems.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            
            const cartItemElement = document.createElement('div');
            cartItemElement.className = 'cart-item';
            cartItemElement.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-info">
                    <h3>${item.name}</h3>
                    <p>${item.description}</p>
                </div>
                <div class="cart-item-price">Rs${itemTotal.toFixed(2)}</div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn" onclick="updateQuantity(${index}, -1)"><i class="fas fa-minus"></i></button>
                    <span class="quantity-value">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${index}, 1)"><i class="fas fa-plus"></i></button>
                    <button class="cart-item-remove" onclick="removeFromCart(${index})"><i class="fas fa-trash"></i></button>
                </div>
            `;
            
            cartItemsElement.appendChild(cartItemElement);
        });
        
        // Update summary totals
        const tax = subtotal * 0.05; // 5% tax
        const total = subtotal + tax + 30; // 30 is delivery fee
        
        document.getElementById('subtotal').textContent = `Rs${subtotal.toFixed(2)}`;
        document.getElementById('tax').textContent = `Rs${tax.toFixed(2)}`;
        document.getElementById('total').textContent = `Rs${total.toFixed(2)}`;
    }
}

// Function to update item quantity
function updateQuantity(index, change) {
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    
    if (cartItems[index]) {
        cartItems[index].quantity += change;
        
        // Remove item if quantity is 0 or less
        if (cartItems[index].quantity <= 0) {
            cartItems.splice(index, 1);
            showToast('Item removed from cart');
        } else {
            showToast('Cart updated');
        }
        
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
        updateCartDisplay();
        updateNavCartCount();
    }
}

// Function to remove item from cart
function removeFromCart(index) {
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    
    if (cartItems[index]) {
        cartItems.splice(index, 1);
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
        showToast('Item removed from cart');
        updateCartDisplay();
        updateNavCartCount();
    }
}