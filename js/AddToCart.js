async function updateCartQuantity(product, action = "inc") {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) { alert("Please login first!"); return; }

    var BASE_URL = "https://e-commerce-2d795-default-rtdb.firebaseio.com";

    try {
        const res = await fetch(`${BASE_URL}/carts.json`);
        const allCarts = await res.json();

        let existingKey = null;
        let existingData = null;

        if (allCarts) {
            for (let key in allCarts) {
                if (allCarts[key].userId === user.id && allCarts[key].productId === product.id) {
                    existingKey = key;
                    existingData = allCarts[key];
                    break;
                }
            }
        }

        if (existingKey) {
            let newQuantity = action === "inc" ? existingData.quantity + 1 : existingData.quantity - 1;

            if (newQuantity < 1) {
                await fetch(`${BASE_URL}/carts/${existingKey}.json`, { method: "DELETE" });
            } else {
                await fetch(`${BASE_URL}/carts/${existingKey}.json`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ quantity: newQuantity })
                });
            }
        } else if (action === "inc") {
            await fetch(`${BASE_URL}/carts.json`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: user.id,
                    productId: product.id,
                    title: product.title,
                    price: product.price,
                    image: product.thumbnail || product.image,
                    quantity: 1
                })
            });
        }

        await updateCartCount(); // تحديث رقم الكارت في الهيدر
        
        if (typeof displayCart === "function") {
            displayCart(); // لو إنتِ في صفحة الكارت، الكود هيعيد رسم المنتجات بالكميات الجديدة
        }

    } catch (error) {
        console.error("Error:", error);
    }
}