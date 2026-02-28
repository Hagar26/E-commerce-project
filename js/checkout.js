let orderList = document.getElementById("orderList");
let totalPriceEl = document.getElementById("totalPrice");

let cartItems = [];
let currentUser = null;

async function fetchCart() {
    try {
        currentUser = JSON.parse(localStorage.getItem("user"));

        if (!currentUser) {
            alert("Please login first!");
            window.location.href = "login.html";
            return;
        }

        let res = await fetch(
            `http://localhost:3000/carts?userId=${currentUser.id}`
        );

        cartItems = await res.json();
        renderCart();

    } catch (err) {
        console.error("Failed to fetch cart:", err);
    }
}

function renderCart() {
    orderList.innerHTML = "";

    if (cartItems.length === 0) {
        orderList.innerHTML =
            "<li class='list-group-item text-center'>Your cart is empty</li>";
        totalPriceEl.textContent = "$0";
        return;
    }

    let total = 0;

    cartItems.forEach(item => {
        let quantity = item.quantity || item.qty || 1;
        let price = parseFloat(item.price || 0);

        let li = document.createElement("li");
        li.className =
            "list-group-item d-flex justify-content-between align-items-center";

        li.innerHTML = `
            <div class="d-flex align-items-center gap-3">
                <img src="${item.image || item.thumbnail || 'https://via.placeholder.com/50'}" width="50" height="50" style="object-fit:cover;border-radius:5px;">
                <span>${item.title} x ${quantity}</span>
            </div>
            <span>$${(price * quantity).toFixed(2)}</span>
        `;

        orderList.appendChild(li);
        total += price * quantity;
    });

    totalPriceEl.textContent = `$${total.toFixed(2)}`;
}

document.addEventListener("DOMContentLoaded", fetchCart);

let cardFormContainer = document.getElementById("cardFormContainer");

function showCardForm() {
    let payment =
        document.querySelector("input[name='payment']:checked").value;

    if (payment === "Card") {
        cardFormContainer.innerHTML = `
            <h5 class="mt-3">Card Details</h5>
            <div class="mb-3">
                <label>Card Number</label>
                <input type="text" class="form-control" id="cardNumber" maxlength="16" required>
            </div>
            <div class="row">
                <div class="col-md-6 mb-3">
                    <label>Expiry</label>
                    <input type="text" class="form-control" id="expiry" placeholder="MM/YY" required>
                </div>
                <div class="col-md-6 mb-3">
                    <label>CVV</label>
                    <input type="text" class="form-control" id="cvv" maxlength="3" required>
                </div>
            </div>
        `;
    } else {
        cardFormContainer.innerHTML = "";
    }
}

document.querySelectorAll("input[name='payment']").forEach(r => {
    r.addEventListener("change", showCardForm);
});

document
    .getElementById("checkoutForm")
    .addEventListener("submit", async function (e) {
        e.preventDefault();

        if (cartItems.length === 0) {
            alert("Your cart is empty!");
            return;
        }

        let orderData = {
            userId: currentUser.id,
            customer:
                document.getElementById("firstName").value +
                " " +
                document.getElementById("lastName").value,

            email: document.getElementById("email").value,
            address: document.getElementById("address").value,
            phone: document.getElementById("phone").value,

            paymentMethod:
                document.querySelector("input[name='payment']:checked")
                    .value,

            products: cartItems,

            total: cartItems.reduce(
                (a, b) =>
                    a +
                    (b.price * (b.quantity || b.qty || 1)),
                0
            ),

            status: "Pending",
            date: new Date().toISOString().split("T")[0]
        };

        if (orderData.paymentMethod === "Card") {
            let cardNumber =
                document.getElementById("cardNumber").value;
            let expiry =
                document.getElementById("expiry").value;
            let cvv =
                document.getElementById("cvv").value;

            if (cardNumber.length !== 16 || cvv.length !== 3 || !expiry) {
                alert("Please enter valid card details!");
                return;
            }

            orderData.cardInfo = { cardNumber, expiry, cvv };
        }

        try {
            let res = await fetch(
                "http://localhost:3000/orders",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(orderData)
                }
            );

            if (!res.ok) throw new Error("Order failed");

            for (let item of cartItems) {
                await fetch(
                    `http://localhost:3000/carts/${item.id}`,
                    { method: "DELETE" }
                );
            }

            window.location.href = "success.html";

        } catch (err) {
            console.error(err);
            alert("Failed to place order!");
        }
    });
