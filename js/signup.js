var FIREBASE_URL = "https://e-commerce-2d795-default-rtdb.firebaseio.com";

const registerForm = document.getElementById("registerForm");
const nameError = document.getElementById("nameError");
const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");
const confirmPasswordError = document.getElementById("confirmPasswordError");

function clearErrors() {
  nameError.textContent = "";
  emailError.textContent = "";
  passwordError.textContent = "";
  confirmPasswordError.textContent = "";
}

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearErrors();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim().toLowerCase();
  const password = document.getElementById("password").value.trim();
  const confirmPassword = document.getElementById("confirmPassword").value.trim();

  let hasError = false;

  if (!name) {
    nameError.textContent = "Name is required";
    hasError = true;
  } else {
    const nameRegex = /^[A-Za-z\u0600-\u06FF\s]{3,}$/;
    if (!nameRegex.test(name)) {
      nameError.textContent = "Name must be at least 3 letters and contain only letters";
      hasError = true;
    }
  }

  if (!email) {
    emailError.textContent = "Email is required";
    hasError = true;
  }

  if (!password) {
    passwordError.textContent = "Password is required";
    hasError = true;
  } else {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    if (!passwordRegex.test(password)) {
      passwordError.textContent = "Password must be at least 8 chars, include uppercase, lowercase, number, and special char";
      hasError = true;
    }
  }

  if (!confirmPassword) {
    confirmPasswordError.textContent = "Confirm Password is required";
    hasError = true;
  } else if (password !== confirmPassword) {
    confirmPasswordError.textContent = "Passwords do not match";
    hasError = true;
  }

  if (hasError) return;

  try {
    const checkEmailResponse = await fetch(`${FIREBASE_URL}/users.json`);
    const allUsers = await checkEmailResponse.json();

    if (allUsers) {
      const emailExists = Object.values(allUsers).some(u => u.email === email);
      if (emailExists) {
        emailError.textContent = "Email already exists";
        return;
      }
    }

    const userId = Date.now();

    const response = await fetch(`${FIREBASE_URL}/users.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        id: userId, 
        name, 
        email, 
        password, 
        role: "customer" 
      }),
    });

    if (!response.ok) throw new Error("Error registering user");

    window.location.href = "./login.html";

  } catch (error) {
    console.error(error);
    alert("Something went wrong. Try again later");
  }
});