let basePath = "";
if (window.location.pathname.includes("/html/")) {
  basePath = "../";
}

const navbarContainer = document.getElementById("navbar-container");

if (navbarContainer) {
  navbarContainer.innerHTML = `
    <nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm py-2">
      <div class="container">
        <a class="logo fw-bold text-dark" href="${basePath}index.html">
          Salla
        </a>

        <button class="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#mainNavbar">
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="mainNavbar">
          <ul id="nav-links"
              class="navbar-nav ms-auto align-items-lg-center gap-lg-3 text-center">

            <li class="nav-item">
              <a class="nav-link px-3" href="${basePath}index.html">Home</a>
            </li>

            <li class="nav-item">
              <a class="nav-link px-3" href="${basePath}html/products.html">Products</a>
            </li>

            <li class="nav-item">
              <a class="nav-link cart-link position-relative px-3" href="${basePath}html/cart.html">
                Cart <i class="fa-solid fa-cart-shopping"></i>
                <span class="cart-count badge bg-dark rounded-pill ms-1">0</span>
              </a>
            </li>

            <li class="nav-item">
              <a class="nav-link px-3 orders-link" href="${basePath}html/myOrder.html">
                My Orders
              </a>
            </li>

          </ul>
        </div>
      </div>
    </nav>
  `;
}

const navLinks = document.getElementById("nav-links");
const cartCountElements = document.querySelectorAll(".cart-count");

function getCurrentUser() {
  return JSON.parse(localStorage.getItem("user"));
}

function protectRoute(e) {
  let user = getCurrentUser();
  if (!user) {
    e.preventDefault();
    alert("You must login first!");
    window.location.href = basePath + "html/login.html";
  }
}

async function updateCartCount() {
  let user = getCurrentUser();

  if (!user) {
    cartCountElements.forEach(el => el.textContent = "0");
    return;
  }

  try {
    let res = await fetch(`http://localhost:3000/carts?userId=${user.id}`);
    let items = await res.json();

    let total = 0;
    items.forEach(item => total += item.quantity || 0);

    cartCountElements.forEach(el => el.textContent = total);
  } catch (err) {
    console.error(err);
    cartCountElements.forEach(el => el.textContent = "0");
  }
}

function updateNavbar() {
  if (!navLinks) return;
  let user = getCurrentUser();
  let dynamicLinks = navLinks.querySelectorAll(".dynamic");
  dynamicLinks.forEach(link => link.remove());

  if (user) {
    let logoutLi = document.createElement("li");
    logoutLi.classList.add("nav-item", "dynamic");

    let logoutLink = document.createElement("a");
    logoutLink.classList.add("nav-link", "text-danger", "fw-semibold");
    logoutLink.href = "#";
    logoutLink.textContent = "Logout";

    logoutLink.addEventListener("click", e => {
      e.preventDefault();
      localStorage.removeItem("user");
      updateCartCount();
      updateNavbar();
      window.location.href = basePath + "html/login.html";
    });

    logoutLi.appendChild(logoutLink);
    navLinks.appendChild(logoutLi);

  } else {
    let loginLi = document.createElement("li");
    loginLi.classList.add("nav-item", "dynamic");

    let loginLink = document.createElement("a");
    loginLink.classList.add("nav-link");
    loginLink.href = basePath + "html/login.html";
    loginLink.textContent = "Login";

    loginLi.appendChild(loginLink);

    let signupLi = document.createElement("li");
    signupLi.classList.add("nav-item", "dynamic");

    let signupLink = document.createElement("a");
    signupLink.classList.add("nav-link");
    signupLink.href = basePath + "html/signup_new.html";
    signupLink.textContent = "Sign Up";

    signupLi.appendChild(signupLink);

    navLinks.appendChild(loginLi);
    navLinks.appendChild(signupLi);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  updateNavbar();
  updateCartCount();

  let cartLink = document.querySelector(".cart-link");
  if (cartLink) cartLink.addEventListener("click", protectRoute);

  let ordersLink = document.querySelector(".orders-link");
  if (ordersLink) ordersLink.addEventListener("click", protectRoute);
});
