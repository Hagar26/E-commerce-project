let footerBasePath = "";
if (window.location.pathname.includes("/html/")) {
    footerBasePath = "../";
}

const footerContainer = document.getElementById("footer-container");

if (footerContainer) {
    footerContainer.innerHTML = `
    <footer class="bg-dark text-light pt-5 pb-3 mt-5">
    <div class="container">
        <div class="row g-4">

        <div class="col-lg-4 col-md-6">
            <h4 class="fw-bold mb-3 logo">Salla</h4>
            <p class="text-light">
            Your one-stop shop for the latest products with the best prices.
            Fast delivery, secure payment and trusted quality.
            </p>

            <div class="d-flex gap-3 mt-3">
            <a href="#" class="text-light fs-5"><i class="fab fa-facebook-f"></i></a>
            <a href="#" class="text-light fs-5"><i class="fab fa-twitter"></i></a>
            <a href="#" class="text-light fs-5"><i class="fab fa-instagram"></i></a>
            <a href="#" class="text-light fs-5"><i class="fab fa-linkedin-in"></i></a>
            </div>
        </div>

        <div class="col-lg-2 col-md-6">
            <h6 class="fw-bold mb-3">Quick Links</h6>
            <ul class="list-unstyled">
            <li><a href="${footerBasePath}index.html" class="text-decoration-none text-light">Home</a></li>
            <li><a href="${footerBasePath}html/products.html" class="text-decoration-none text-light">Products</a></li>
            <li><a href="${footerBasePath}html/cart.html" class="text-decoration-none text-light">Cart</a></li>
            <li><a href="${footerBasePath}html/myOrder.html" class="text-decoration-none text-light">My Orders</a></li>
            </ul>
        </div>

        <div class="col-lg-3 col-md-6">
            <h6 class="fw-bold mb-3">Categories</h6>
            <ul class="list-unstyled">
            <li><a href="#" class="text-decoration-none text-light">Electronics</a></li>
            <li><a href="#" class="text-decoration-none text-light">Fashion</a></li>
            <li><a href="#" class="text-decoration-none text-light">Accessories</a></li>
            <li><a href="#" class="text-decoration-none text-light">Home & Living</a></li>
            </ul>
        </div>

        <div class="col-lg-3 col-md-6">
            <h6 class="fw-bold mb-3">Newsletter</h6>
            <p class="text-light">Subscribe to get latest updates and offers.</p>

            <form class="d-flex mb-3">
            <input type="email" class="form-control me-2" placeholder="Your email">
            <button class="btn btn-warning fw-bold">Subscribe</button>
            </form>

            <div class="small text-light">
            <div><i class="fas fa-envelope me-2"></i> salla@shopping.com</div>
            <div><i class="fas fa-phone me-2"></i> +20 100 000 0000</div>
            </div>
        </div>

        </div>

        <hr class="border-secondary my-4">

        <div class="text-center small text-light">
        © 2026 Shopping. All Rights Reserved.
        </div>
    </div>
    </footer>
    `;
}
