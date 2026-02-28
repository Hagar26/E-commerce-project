let categoriesList = [];

//fetchCategories
function fetchCategories() {
    let request = new XMLHttpRequest();
    request.open("GET", "http://localhost:3000/categories");
    request.send();
    request.onreadystatechange = function () {
        if (request.readyState === 4 && request.status === 200) {
            categoriesList = JSON.parse(request.responseText);
            displayCategories(categoriesList);
        }
    };
}

//displayCategories
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
    return (price * (1 - discount / 100)).toFixed(2);
}

//Fetch Products
function fetchProducts(callback) {
    let request = new XMLHttpRequest();
    request.open("GET", "http://localhost:3000/products");
    request.send();
    request.onreadystatechange = function () {
        if (request.readyState === 4) {
            if (request.status === 200) {
                let products = JSON.parse(request.responseText);
                callback(products);
            } else {
                console.error("Error fetching products:", request.status);
            }
        }
    };
}

//get top products
function getTopProducts(products) {
    let sorted = [...products].sort((a, b) => b.rating - a.rating);
    return sorted.slice(0, 4);
}

// Get Random Products
function getRandomProducts(products) {
    let shuffled = [...products].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 4);
}

//display Products
function displayProducts(products, sectionId) {
    let container = ``;
    for (let i = 0; i < products.length; i++) {
        let discountBadge = products[i].discountPercentage > 0
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

//add To Cart
function addToCart(product) {
    const user = JSON.parse(localStorage.getItem("user"));
    if(!user){
        alert("Please login first!");
        return;
    }

    // Check if product already in cart
    let checkRequest = new XMLHttpRequest();
    checkRequest.open("GET", `http://localhost:3000/carts?userId=${user.id}&productId=${product.id}`);
    checkRequest.send();
    checkRequest.onreadystatechange = function () {
        if(checkRequest.readyState === 4){
            if(checkRequest.status === 200){
                const existing = JSON.parse(checkRequest.responseText);

                if(existing.length > 0){
                    // Update quantity
                    let updateRequest = new XMLHttpRequest();
                    updateRequest.open("PATCH", `http://localhost:3000/carts/${existing[0].id}`);
                    updateRequest.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                    updateRequest.send(JSON.stringify({ quantity: existing[0].quantity + 1 }));

                    updateRequest.onreadystatechange = function () {
                        if(updateRequest.readyState === 4 && updateRequest.status === 200){
                            updateCartCount();
                        }
                    };
                } else {
                    // Add new product
                    let addRequest = new XMLHttpRequest();
                    addRequest.open("POST", "http://localhost:3000/carts");
                    addRequest.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                    addRequest.send(JSON.stringify({
                        userId: user.id,
                        productId: product.id,
                        title: product.title,
                        price: product.price,
                        discountPercentage:product.discountPercentage,
                        image: product.thumbnail,
                        quantity: 1
                    }));

                    addRequest.onreadystatechange = function () {
                        if(addRequest.readyState === 4 && addRequest.status === 201){
                            updateCartCount();
                        }
                    };
                }

            } else {
                console.error("Error checking cart:", checkRequest.status);
            }
        }
    };
}

//updateCartCount
function updateCartCount() {
    const user = JSON.parse(localStorage.getItem("user"));
    if(!user) return;

    let request = new XMLHttpRequest();
    request.open("GET", `http://localhost:3000/carts?userId=${user.id}`);
    request.send();
    request.onreadystatechange = function () {
        if(request.readyState === 4 && request.status === 200){
            const cart = JSON.parse(request.responseText);
            let total = 0;
            cart.forEach(item => total += item.quantity);
            document.querySelectorAll(".cart-count").forEach(el => el.textContent = total);
        }
    };
}

fetchCategories();
fetchProducts(products => {
    displayProducts(getRandomProducts(products), "random-products-section");
    displayProducts(getTopProducts(products), "top-products-section");
});

document.addEventListener("DOMContentLoaded", updateCartCount);
