const loginForm = document.getElementById("loginForm");
const errorMsg = document.getElementById("error");

var FIREBASE_URL = "https://e-commerce-2d795-default-rtdb.firebaseio.com";

async function fetchUser(email, password) {
  const response = await fetch(`${FIREBASE_URL}/users.json`, {
    cache: "no-store"
  });

  if (!response.ok) throw new Error("Server Error");
  const data = await response.json();

  if (!data) return [];

  const usersArray = Object.keys(data).map(key => ({ id: key, ...data[key] }));
  const user = usersArray.find(u => u.email === email && u.password === password);
  
  return user ? [user] : [];
}

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  errorMsg.textContent = "";

  if (!email || !password) {
    errorMsg.textContent = "All fields are required";
    return;
  }

  try {
    const data = await fetchUser(email, password);

    if (data.length === 0) {
      errorMsg.textContent = "Invalid email or password";
      return;
    }

    const user = data[0];
    localStorage.setItem("user", JSON.stringify(user));

    if (user.role === "admin") {
      window.location.href = "../Admin/dashboard.html";
    } else {
      window.location.href = "../index.html";
    }
  } catch (err) {
    console.error(err);
    errorMsg.textContent = "Something went wrong. Try again later";
  }
});