function getProductId() {
    let params = new URLSearchParams(window.location.search);
    return params.get('id');
}

function calcNewPrice(price, discount) {
    return (price * (1 - discount / 100)).toFixed(2);
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
    mainImage.src = productData.images[0] || productData.thumbnail;

    let thumbnailsContainer = document.getElementById('thumbnailsContainer');
    thumbnailsContainer.innerHTML = '';

    (productData.images || []).forEach(imgUrl => {
        let img = document.createElement('img');
        img.src = imgUrl;
        img.width = 80;
        img.classList.add('img-thumbnail', 'cursor-pointer');
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

    document.getElementById('newPrice').innerText =
        `$${calcNewPrice(productData.price, productData.discountPercentage)}`;

    document.getElementById('oldPrice').innerText =
        `$${productData.price}`;

    document.getElementById('discountPercent').innerText =
        `-${productData.discountPercentage.toFixed(2)}%`;

    document.getElementById('productDesc').innerText =
        productData.description;

    setupQuantityControls(productData.stock);
    renderReviews(productData);

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
    }

    plusBtn.onclick = () => {
        let value = parseInt(qtyInput.value);
        if (value < stock) {
            qtyInput.value = value + 1;
        } else {
            Swal.fire({
                icon: "info",
                title: "Stock limit reached",
                text: `Only ${stock} item(s) available in stock`,
                confirmButtonText: "OK"
            });
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
        if (isNaN(value) || value < 1){
            value = 1;
        }
        if (value > stock) {
            Swal.fire({
                icon: "info",
                title: "Stock limit reached",
                text: `Only ${stock} items available in stock`,
                confirmButtonText: "OK"
            });
            value = stock;
        }
        qtyInput.value = value;
        updateButtons();
    };
    updateButtons();
}

function renderReviews(productData) {
    let container = document.getElementById('reviewsContainer');
    container.innerHTML = '';
    productData.reviews.forEach(rev => {
        let date = new Date(rev.date)
            .toLocaleDateString('en-GB');
        container.innerHTML += `
            <div class="col-md-4 mb-3">
                <div class="p-3 shadow-sm rounded h-100">
                    <div class="d-flex align-items-center gap-2 mb-2">
                        <div class="d-flex justify-content-center align-items-center bg-primary rounded-circle text-light" style="width:50px;height:50px;font-size:20px;">
                            <i class="fa-regular fa-user"></i>
                        </div>

                        <div>
                            <h6 class="mb-0 fw-bold">
                                ${rev.reviewerName}
                            </h6>
                            <small class="text-muted">
                                ${date}
                            </small>
                        </div>
                    </div>

                    <div class="rating-stars mb-2">
                        ${stars(rev.rating)}
                    </div>

                    <p class="small mb-0">
                        "${rev.comment}"
                    </p>
                </div>
            </div>
        `;
    });
}

function fetchProduct(productId) {
    let request = new XMLHttpRequest();
    request.open('GET', `http://localhost:3000/products/${productId}`);
    request.send();

    request.addEventListener("readystatechange", function () {
        if (request.readyState === 4 && request.status === 200) {
            const productData =JSON.parse(request.responseText);

            displayProduct(productData);
        }
    });
}

window.onload = () => {
    const productId = getProductId();
    if (productId) fetchProduct(productId);
};

function addToCart(productData) {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
        alert("Please login first!");
        return;
    }

    const qty = parseInt(document.getElementById("qtyInput").value);

    // Check if product exists
    let checkRequest = new XMLHttpRequest();
    checkRequest.open("GET",`http://localhost:3000/carts?userId=${user.id}&productId=${productData.id}`);
    checkRequest.send();

    checkRequest.onreadystatechange = function () {
        if (checkRequest.readyState === 4 && checkRequest.status === 200) {
            const existing = JSON.parse(checkRequest.responseText);

            if (existing.length > 0) {
                // update quantity
                let updateRequest = new XMLHttpRequest();
                updateRequest.open("PATCH",`http://localhost:3000/carts/${existing[0].id}`);
                updateRequest.setRequestHeader("Content-Type","application/json;charset=UTF-8");

                updateRequest.send(
                    JSON.stringify({
                        quantity: existing[0].quantity + qty
                    })
                );
                updateRequest.onreadystatechange = function () {
                    if (updateRequest.readyState === 4) {
                        updateCartCount();
                    }
                };

            } else {
                // add new item
                let addRequest = new XMLHttpRequest();
                addRequest.open("POST", "http://localhost:3000/carts");
                addRequest.setRequestHeader(
                    "Content-Type",
                    "application/json;charset=UTF-8"
                );

                addRequest.send(JSON.stringify({
                    userId: user.id,
                    productId: productData.id,
                    title: productData.title,
                    price: productData.price,
                    discountPercentage:productData.discountPercentage,
                    image: productData.thumbnail,
                    quantity: qty
                }));

                addRequest.onreadystatechange = function () {
                    if (addRequest.readyState === 4 && addRequest.status === 201) {
                        updateCartCount();
                    }
                };
            }
        }
    };
}
