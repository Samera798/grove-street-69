// ================= 1. بيانات المكملات الغذائية =================
// يمكنك تعديل الأسماء والأسعار وحالة التوفر (inStock: true أو false) هنا بسهولة
const products = [
    {
        id: 'supp-1',
        name: 'واي بروتين أيزوليت (Whey Isolate)',
        category: 'protein',
        weight: '2 كجم - 60 سكوب',
        price: 2800,
        inStock: true,
        image: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&w=600&q=80'
    },
    {
        id: 'supp-2',
        name: 'كرياتين مونوهيدرات نقي (Creatine)',
        category: 'creatine',
        weight: '300 جرام - 60 جرعة',
        price: 950,
        inStock: true,
        image: 'https://images.unsplash.com/photo-1579722820308-d74e571900a9?auto=format&fit=crop&w=600&q=80'
    },
    {
        id: 'supp-3',
        name: 'بري ورك أوت (Pre-Workout)',
        category: 'preworkout',
        weight: '30 سكوب - طاقة وتركيز',
        price: 1150,
        inStock: true,
        image: 'https://images.unsplash.com/photo-1546483875-ad9014c88eba?auto=format&fit=crop&w=600&q=80'
    },
    {
        id: 'supp-4',
        name: 'ماس جينر للضخامة (Mass Gainer)',
        category: 'protein',
        weight: '3 كجم',
        price: 2200,
        inStock: false,
        image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=600&q=80'
    },
    {
        id: 'supp-5',
        name: 'مالتي فيتامين وأوميجا 3',
        category: 'vitamins',
        weight: '90 كبسولة',
        price: 650,
        inStock: true,
        image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80'
    }
];

// رقم الواتساب الخاص بالكوتش (بصيغة دولية بدون +)
const WHATSAPP_NUMBER = '201026244371';

// ================= 2. إدارة الوضع الليلي والفاتح =================
const themeToggle = document.getElementById('themeToggle');
const htmlEl = document.documentElement;

// استرجاع المظهر المحفوظ
const savedTheme = localStorage.getItem('grove_theme') || 'dark';
htmlEl.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);

themeToggle.addEventListener('click', () => {
    const currentTheme = htmlEl.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    htmlEl.setAttribute('data-theme', newTheme);
    localStorage.setItem('grove_theme', newTheme);
    updateThemeIcon(newTheme);
});

function updateThemeIcon(theme) {
    themeToggle.innerHTML = theme === 'dark'
        ? '<i class="fa-solid fa-sun"></i>'
        : '<i class="fa-solid fa-moon"></i>';
}

// ================= 3. قائمة الموبايل =================
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');

menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

// إغلاق القائمة عند الضغط على أي رابط
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => navLinks.classList.remove('active'));
});

// ================= 4. عرض وفلترة المكملات =================
const productsGrid = document.getElementById('productsGrid');
const filterBtns = document.querySelectorAll('.filter-btn');

function renderProducts(filter = 'all') {
    productsGrid.innerHTML = '';
    const filtered = filter === 'all'
        ? products
        : products.filter(p => p.category === filter);

    filtered.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-img">
                <img src="${product.image}" alt="${product.name}">
                <span class="stock-status ${product.inStock ? 'in-stock' : 'out-of-stock'}">
                    ${product.inStock ? 'متوفر' : 'نفذت الكمية'}
                </span>
            </div>
            <div class="product-info">
                <span class="product-meta">${product.weight}</span>
                <h3>${product.name}</h3>
                <div class="product-bottom">
                    <span class="product-price">${product.price} ج.م</span>
                    ${product.inStock
                        ? `<button class="btn btn-primary" onclick="addToCart('${product.id}', '${product.name}', ${product.price}, 'مكمل غذائي')">
                            أضف <i class="fa-solid fa-plus"></i>
                           </button>`
                        : `<button class="btn-disabled" disabled>غير متوفر</button>`
                    }
                </div>
            </div>
        `;
        productsGrid.appendChild(card);
    });
}

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderProducts(btn.getAttribute('data-filter'));
    });
});

// ================= 5. عربة التسوق (Cart System) =================
let cart = JSON.parse(localStorage.getItem('grove_cart')) || [];

const cartDrawer = document.getElementById('cartDrawer');
const cartOverlay = document.getElementById('cartOverlay');
const cartToggle = document.getElementById('cartToggle');
const closeCart = document.getElementById('closeCart');
const cartItemsContainer = document.getElementById('cartItems');
const cartBadge = document.getElementById('cartBadge');
const cartTotalEl = document.getElementById('cartTotal');
const cartFooter = document.getElementById('cartFooter');

function openCart() {
    cartDrawer.classList.add('active');
    cartOverlay.classList.add('active');
}

function closeCartDrawer() {
    cartDrawer.classList.remove('active');
    cartOverlay.classList.remove('active');
}

cartToggle.addEventListener('click', openCart);
closeCart.addEventListener('click', closeCartDrawer);
cartOverlay.addEventListener('click', closeCartDrawer);

function addToCart(id, name, price, type) {
    const existingItem = cart.find(item => item.id === id);
    if (existingItem) {
        existingItem.qty += 1;
    } else {
        cart.push({ id, name, price, type, qty: 1 });
    }
    saveAndRenderCart();
    showToast(`تمت إضافة "${name}" إلى العربة`);
}

function updateQty(id, change) {
    const item = cart.find(i => i.id === id);
    if (!item) return;

    item.qty += change;
    if (item.qty <= 0) {
        cart = cart.filter(i => i.id !== id);
    }
    saveAndRenderCart();
}

function removeFromCart(id) {
    cart = cart.filter(i => i.id !== id);
    saveAndRenderCart();
}

function saveAndRenderCart() {
    localStorage.setItem('grove_cart', JSON.stringify(cart));

    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

    cartBadge.textContent = totalQty;
    cartTotalEl.textContent = `${totalPrice} ج.م`;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <i class="fa-solid fa-cart-arrow-down"></i>
                <p>عربة الشراء فارغة حالياً</p>
            </div>
        `;
        cartFooter.style.display = 'none';
        return;
    }

    cartFooter.style.display = 'block';
    cartItemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <span>${item.price * item.qty} ج.م</span>
            </div>
            <div class="qty-controls">
                <button class="qty-btn" onclick="updateQty('${item.id}', -1)">-</button>
                <span>${item.qty}</span>
                <button class="qty-btn" onclick="updateQty('${item.id}', 1)">+</button>
                <button class="remove-btn" onclick="removeFromCart('${item.id}')" title="حذف">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// ================= 6. تأكيد الطلب عبر واتساب =================
function checkoutWhatsApp() {
    if (cart.length === 0) return;

    const name = document.getElementById('customerName').value.trim();
    const phone = document.getElementById('customerPhone').value.trim();
    const payment = document.getElementById('paymentMethod').value;
    const notes = document.getElementById('customerNotes').value.trim();

    if (!name || !phone) {
        showToast('من فضلك اكتب الاسم ورقم الواتساب أولاً!');
        return;
    }

    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

    let message = `🔥 *طلب جديد من موقع Grove street 69* 🔥\n\n`;
    message += `👤 *الاسم:* ${name}\n`;
    message += `📱 *رقم التواصل:* ${phone}\n`;
    message += `💳 *طريقة الدفع:* ${payment}\n`;
    if (notes) message += `📝 *ملاحظات:* ${notes}\n`;
    message += `\n🛒 *تفاصيل الطلب:*\n`;

    cart.forEach((item, index) => {
        message += `${index + 1}. ${item.name} (الكمية: ${item.qty}) - ${item.price * item.qty} ج.م\n`;
    });

    message += `\n💰 *الإجمالي المطلوب:* ${totalPrice} ج.م`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');
}

// ================= 7. أدوات مساعدة (نسخ + إشعارات) =================
function copyText(text) {
    navigator.clipboard.writeText(text);
    showToast(`تم نسخ الرقم: ${text}`);
}

function showToast(msg) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fa-solid fa-circle-check highlight"></i> <span>${msg}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// تشغيل العرض المبدئي عند فتح الصفحة
renderProducts();
saveAndRenderCart();