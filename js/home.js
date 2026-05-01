let categoriesList = [];
// اللينك بتاعك الأساسي
// هنشيل const ونخليها var عشان المتصفح ميزعلش لو اتكررت
var FIREBASE_URL = FIREBASE_URL || "https://e-commerce-2d795-default-rtdb.firebaseio.com";
// 1. fetchCategories
async function fetchCategories() {
    try {
        let res = await fetch(`${FIREBASE_URL}/categories.json`);
        let data = await res.json();
        
        // تحويل الكائن لمصفوفة لأن فايربيز بيرجع Objects
        categoriesList = data ? Object.values(data) : [];
        displayCategories(categoriesList);
    } catch (err) {
        console.error("Error fetching categories:", err);
    }
}

// 2. displayCategories
function displayCategories(list) {
    let container = ``;
    for (let i = 0; i < list.length; i++) {
        container += `
        <a href="html/products.html?category=${encodeURIComponent(list[i].name)}" class="text-decoration-none text-dark d-block">
            <div class="category-card text-center p-2 border rounded" style="min-width:120px; cursor:pointer;">
                <img src="${list[i].image}" class="mb-2" width="100px" height="100px" alt="${list[i].name}">
                <p>${list[i].name}</p>
            </div>
        </a>
        `;
    }
    document.getElementById("Categories").innerHTML = container;
}

function calcNewPrice(price, discount) {
    return (price * (1 - (discount || 0) / 100)).toFixed(2);
}

// 3. Fetch Products
async function fetchProducts(callback) {
    try {
        let res = await fetch(`${FIREBASE_URL}/products.json`);
        let data = await res.json();
        
        // تحويل كائن فايربيز لمصفوفة
        let products = data ? Object.values(data) : [];
        callback(products);
    } catch (err) {
        console.error("Error fetching products:", err);
    }
}

// 4. get top products
function getTopProducts(products) {
    let sorted = [...products].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    return sorted.slice(0, 4);
}

// 5. Get Random Products
function getRandomProducts(products) {
    let shuffled = [...products].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 4);
}

// 6. display Products
function displayProducts(products, sectionId) {
    let container = ``;
    for (let i = 0; i < products.length; i++) {
        let discountBadge = (products[i].discountPercentage > 0)
            ? `<span class="text-danger rounded-end bg-danger-subtle p-2">
                    ${products[i].discountPercentage.toFixed(0)}% off
                </span>`
            : "";

        container += `
        <div class="col-lg-3 col-md-4 col-sm-6 mb-4">
            <div class="card product-card h-100 border-0 shadow-sm">
                <a href="html/productDetails.html?id=${products[i].id}" class="text-decoration-none text-dark">
                    <div class="img-container">
                        ${discountBadge}
                        <img src="${products[i].thumbnail}" class="card-img-top ll">
                    </div>
                </a>
                <div class="card-body">
                    <div class="d-flex justify-content-between gap-1">
                        <p class="text-muted mb-1">${products[i].category}</p>
                        <p><i class="fa-solid fa-star text-warning" style="margin-right: 5px;"></i>${products[i].rating}</p>
                    </div>
                    <a href="html/productDetails.html?id=${products[i].id}" class="text-decoration-none text-dark">
                        <h6 class="fw-bold">${products[i].title}</h6>
                    </a>
                    <p class="text-success fw-medium">
                        <span class="fs-5">$${calcNewPrice(products[i].price, products[i].discountPercentage)}</span>
                        <span class="text-decoration-line-through text-secondary">$${products[i].price}</span>
                    </p>
                    <button class="btn btn-dark w-100 mt-3 add-to-cart" data-id="${products[i].id}">
                        Add To Cart
                    </button>
                </div>
            </div>
        </div>`;
    }
    document.getElementById(sectionId).innerHTML = container;

    document.querySelectorAll(`#${sectionId} .add-to-cart`).forEach(btn => {
        btn.addEventListener("click", function () {
            const prodId = this.getAttribute("data-id");
            const product = products.find(p => p.id == prodId);
            addToCart(product);
        });
    });
}

// 7. add To Cart (متوافق مع نظام Firebase)
async function addToCart(product) {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
        alert("Please login first!");
        return;
    }

    try {
        let res = await fetch(`${FIREBASE_URL}/carts.json`);
        let data = await res.json();
        
        let existingKey = null;
        let existingQty = 0;

        if (data) {
            for (let key in data) {
                if (data[key].userId === user.id && data[key].productId === product.id) {
                    existingKey = key;
                    existingQty = data[key].quantity;
                    break;
                }
            }
        }

        if (existingKey) {
            // Update quantity
            await fetch(`${FIREBASE_URL}/carts/${existingKey}.json`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ quantity: existingQty + 1 })
            });
        } else {
            // Add new product
            await fetch(`${FIREBASE_URL}/carts.json`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: user.id,
                    productId: product.id,
                    title: product.title,
                    price: product.price,
                    discountPercentage: product.discountPercentage || 0,
                    image: product.thumbnail || product.image,
                    quantity: 1
                })
            });
        }
        updateCartCount();
        alert(`${product.title} added to cart!`);
    } catch (err) {
        console.error("Error adding to cart:", err);
    }
}

// 8. updateCartCount
async function updateCartCount() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;

    try {
        let res = await fetch(`${FIREBASE_URL}/carts.json`);
        let data = await res.json();
        
        let total = 0;
        if (data) {
            Object.values(data).forEach(item => {
                if (item.userId === user.id) {
                    total += (item.quantity || 0);
                }
            });
        }
        document.querySelectorAll(".cart-count").forEach(el => el.textContent = total);
    } catch (err) {
        console.error("Error updating cart count:", err);
    }
}

// تشغيل الوظائف عند التحميل
fetchCategories();
fetchProducts(products => {
    displayProducts(getRandomProducts(products), "random-products-section");
    displayProducts(getTopProducts(products), "top-products-section");
});

document.addEventListener("DOMContentLoaded", updateCartCount);