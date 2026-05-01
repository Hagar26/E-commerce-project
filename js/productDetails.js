var FIREBASE_URL = "https://e-commerce-2d795-default-rtdb.firebaseio.com";

function getProductId() {
    let params = new URLSearchParams(window.location.search);
    return params.get('id');
}

function calcNewPrice(price, discount) {
    return (price * (1 - (discount || 0) / 100)).toFixed(2);
}

function stars(rating) {
    let starsHtml = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= Math.floor(rating)) {
            starsHtml += `<i class="fa-solid fa-star text-warning"></i>`;
        } else if (i - rating < 1) {
            starsHtml += `<i class="fa-solid fa-star-half-stroke text-warning"></i>`;
        } else {
            starsHtml += `<i class="fa-regular fa-star text-secondary"></i>`;
        }
    }
    return starsHtml;
}

function displayProduct(productData) {
    let mainImage = document.getElementById('mainImage');
    mainImage.src = productData.images ? productData.images[0] : productData.thumbnail;

    let thumbnailsContainer = document.getElementById('thumbnailsContainer');
    thumbnailsContainer.innerHTML = '';

    (productData.images || [productData.thumbnail]).forEach(imgUrl => {
        let img = document.createElement('img');
        img.src = imgUrl;
        img.width = 80;
        img.classList.add('img-thumbnail', 'cursor-pointer', 'm-1');
        img.onclick = () => mainImage.src = imgUrl;
        thumbnailsContainer.appendChild(img);
    });

    document.getElementById('productTitle').innerText = productData.title;
    document.getElementById('stars').innerHTML = stars(productData.rating);
    document.getElementById('ratingValue').innerText = `(${productData.rating})`;
    document.getElementById('category').innerText = productData.category;

    let availability = document.getElementById('availability');
    let addBtn = document.getElementById("addToCartBtn");

    if (productData.stock > 0) {
        availability.innerText = `In Stock (${productData.stock})`;
        availability.className = "text-success fw-bold";
        addBtn.disabled = false;
    } else {
        availability.innerText = "Out of Stock";
        availability.className = "text-danger fw-bold";
        addBtn.disabled = true;
    }

    document.getElementById('newPrice').innerText = `$${calcNewPrice(productData.price, productData.discountPercentage)}`;
    document.getElementById('oldPrice').innerText = `$${productData.price}`;
    document.getElementById('discountPercent').innerText = `-${(productData.discountPercentage || 0).toFixed(2)}%`;
    document.getElementById('productDesc').innerText = productData.description;

    setupQuantityControls(productData.stock);
    if (productData.reviews) renderReviews(productData);

    document.getElementById("addToCartBtn").onclick = function () {
        addToCart(productData);
    };
}

function setupQuantityControls(stock) {
    let qtyInput = document.getElementById("qtyInput");
    let plusBtn = document.getElementById("plusBtn");
    let minusBtn = document.getElementById("minusBtn");

    qtyInput.value = 1;
    function updateButtons() {
        let value = parseInt(qtyInput.value);
        minusBtn.disabled = value <= 1;
        plusBtn.disabled = value >= stock;
    }

    plusBtn.onclick = () => {
        let value = parseInt(qtyInput.value);
        if (value < stock) {
            qtyInput.value = value + 1;
        } else {
            Swal.fire({ icon: "info", title: "Stock limit reached", text: `Only ${stock} items available` });
        }
        updateButtons();
    };

    minusBtn.onclick = () => {
        let value = parseInt(qtyInput.value);
        if (value > 1) qtyInput.value = value - 1;
        updateButtons();
    };

    qtyInput.oninput = () => {
        let value = parseInt(qtyInput.value);
        if (isNaN(value) || value < 1) value = 1;
        if (value > stock) value = stock;
        qtyInput.value = value;
        updateButtons();
    };
    updateButtons();
}

function renderReviews(productData) {
    let container = document.getElementById('reviewsContainer');
    if (!container) return;
    container.innerHTML = '';
    
    let reviews = Array.isArray(productData.reviews) ? productData.reviews : Object.values(productData.reviews || {});
    
    reviews.forEach(rev => {
        let date = new Date(rev.date).toLocaleDateString('en-GB');
        container.innerHTML += `
            <div class="col-md-4 mb-3">
                <div class="p-3 shadow-sm rounded h-100 border">
                    <div class="d-flex align-items-center gap-2 mb-2">
                        <div class="d-flex justify-content-center align-items-center bg-primary rounded-circle text-light" style="width:40px;height:40px;">
                            <i class="fa-regular fa-user"></i>
                        </div>
                        <div>
                            <h6 class="mb-0 fw-bold">${rev.reviewerName}</h6>
                            <small class="text-muted">${date}</small>
                        </div>
                    </div>
                    <div class="rating-stars mb-2">${stars(rev.rating)}</div>
                    <p class="small mb-0">"${rev.comment}"</p>
                </div>
            </div>`;
    });
}

async function fetchProduct(productId) {
    try {
        let res = await fetch(`${FIREBASE_URL}/products.json`);
        let products = await res.json();
        
        let product = Object.values(products).find(p => p.id == productId);
        
        if (product) {
            displayProduct(product);
        } else {
            console.error("Product not found");
        }
    } catch (err) {
        console.error("Error fetching product:", err);
    }
}

async function addToCart(productData) {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
        alert("Please login first!");
        return;
    }

    const qty = parseInt(document.getElementById("qtyInput").value);

    try {
        let res = await fetch(`${FIREBASE_URL}/carts.json`);
        let data = await res.json();
        
        let existingKey = null;
        let currentQty = 0;

        if (data) {
            for (let key in data) {
                if (data[key].userId === user.id && data[key].productId === productData.id) {
                    existingKey = key;
                    currentQty = data[key].quantity;
                    break;
                }
            }
        }

        if (existingKey) {
            await fetch(`${FIREBASE_URL}/carts/${existingKey}.json`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ quantity: currentQty + qty })
            });
        } else {
            await fetch(`${FIREBASE_URL}/carts.json`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: user.id,
                    productId: productData.id,
                    title: productData.title,
                    price: productData.price,
                    discountPercentage: productData.discountPercentage || 0,
                    image: productData.thumbnail,
                    quantity: qty
                })
            });
        }
        
        if (typeof updateCartCount === "function") updateCartCount();
        alert(`Added ${qty} item(s) to cart!`);
        
    } catch (err) {
        console.error("Error adding to cart:", err);
    }
}

window.onload = () => {
    const productId = getProductId();
    if (productId) fetchProduct(productId);
};