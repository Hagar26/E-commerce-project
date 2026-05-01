let cartContainer = document.getElementById("cartItems");
let subtotalEl = document.getElementById("subtotal");
let itemsCountEl = document.getElementById("itemsCount");
let totalEl = document.getElementById("total");
let savingsEl = document.getElementById("savings");

var FIREBASE_URL = "https://e-commerce-2d795-default-rtdb.firebaseio.com";

async function updateCartCount() {
    let user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
        document.querySelectorAll(".cart-count").forEach(el => el.textContent = "0");
        return;
    }

    try {
        let res = await fetch(`${FIREBASE_URL}/carts.json`);
        let data = await res.json();

        let total = 0;
        if (data) {
            Object.values(data).forEach(item => {
                if (item.userId === user.id) {
                    total += item.quantity || 0;
                }
            });
        }

        document.querySelectorAll(".cart-count").forEach(el => el.textContent = total);
    } catch (err) {
        console.error(err);
        document.querySelectorAll(".cart-count").forEach(el => el.textContent = "0");
    }
}

async function loadCart() {
    let user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
        renderEmptyCart();
        return;
    }

    try {
        let res = await fetch(`${FIREBASE_URL}/carts.json`);
        let data = await res.json();

        cartContainer.innerHTML = "";

        let cartItems = [];
        if (data) {
            cartItems = Object.keys(data)
                .map(key => ({ firebaseId: key, ...data[key] }))
                .filter(item => item.userId === user.id);
        }

        if (cartItems.length === 0) {
            renderEmptyCart();
            updateCartCount();
            return;
        }

        let subtotal = 0;
        let total = 0;
        let totalItems = 0;
        let totalSavings = 0;

        cartItems.forEach(item => {
            let discount = item.discountPercentage
                ? (item.price * item.discountPercentage / 100)
                : 0;

            let priceAfterDiscount = item.price - discount;
            subtotal += item.price * item.quantity;
            total += priceAfterDiscount * item.quantity;
            totalSavings += discount * item.quantity;
            totalItems += item.quantity;

            let div = document.createElement("div");
            div.classList.add("cart-item", "d-flex", "align-items-center", "mb-3");
            div.innerHTML = `
                <img src="${item.image}" width="60" class="me-3 rounded">
                <div class="flex-grow-1">
                <h6>${item.title}</h6>
                <p>
                    $ ${priceAfterDiscount.toFixed(2)} x ${item.quantity}
                    ${discount > 0
                        ? `<span class="text-success">(Saved $ ${discount.toFixed(2)} each)</span>`
                        : ""
                    }
                </p>
                </div>
                <button class="btn btn-sm btn-danger">Remove</button>
            `;

            div.querySelector("button").addEventListener("click", () => {
                fetch(`${FIREBASE_URL}/carts/${item.firebaseId}.json`, { method: "DELETE" })
                    .then(() => loadCart())
                    .catch(err => console.error(err));
            });

            cartContainer.appendChild(div);
        });

        subtotalEl.textContent = "$ " + subtotal.toFixed(2);
        savingsEl.textContent = "$ " + totalSavings.toFixed(2);
        totalEl.textContent = "$ " + total.toFixed(2);
        itemsCountEl.textContent = totalItems;
        updateCartCount();
    } catch (err) {
        console.error(err);
        renderEmptyCart();
    }
}

async function addToCart(product) {
    let user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
        alert("You must login first!");
        window.location.href = "../html/login.html";
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
            await fetch(`${FIREBASE_URL}/carts/${existingKey}.json`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ quantity: existingQty + 1 })
            });
        } else {
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
        loadCart();
    } catch (err) {
        console.error("Error adding to cart:", err);
    }
}

function renderEmptyCart() {
    cartContainer.innerHTML = `
        <div class="text-center py-5">
        <i class="fa-solid fa-cart-shopping fa-6x text-secondary mb-4"></i>
        <h3 class="text-secondary fw-bold">Your cart is empty</h3>
        <p class="text-muted">Looks like you haven't added any products yet.</p>
        <a href="../html/products.html" class="btn btn-dark px-4 py-2 mt-2">Continue Shopping</a>
        </div>
    `;

    subtotalEl.textContent = "$ 0";
    totalEl.textContent = "$ 0";
    itemsCountEl.textContent = "0";
    savingsEl.textContent = "$ 0";

    updateCartCount();
}

document.addEventListener("DOMContentLoaded", loadCart);