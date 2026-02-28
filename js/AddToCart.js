//  Add To Cart 
async function addToCart(product){
    const user = JSON.parse(localStorage.getItem("user"));
    if(!user){
        alert("Please login first!");
        return;
    }

    // تحقق لو المنتج موجود لنفس user
    const res = await fetch(`http://localhost:3000/carts?userId=${user.id}&productId=${product.id}`);
    const existing = await res.json();

    if(existing.length > 0){
        // زيادة الكمية
        await fetch(`http://localhost:3000/carts/${existing[0].id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ quantity: existing[0].quantity + 1 })
        });
    } else {
        // إضافة منتج جديد
        await fetch("http://localhost:3000/carts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: user.id,
                productId: product.id,
                title: product.title,
                price: product.price,
                image: product.thumbnail,
                quantity: 1
            })
        });
    }

    updateCartCount();
    alert(`${product.title} added to cart!`);
}