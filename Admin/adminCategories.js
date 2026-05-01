let CategoriesTable = document.getElementById("CategoriesTable");
let searchInput = document.getElementById("searchInput");
let categoriesList = [];
let productsList = [];
let currentEditId = null;
let modal = new bootstrap.Modal(document.getElementById("CategoryModal"));

//displayCategories
function displayCategories(data){
    let container=``;
    for (let i = 0; i < data.length; i++) {
        let count = productsList.filter(p =>
            p.category === data[i].name
        ).length;
        container+=`
            <tr>
                <td>${data[i].id}</td>
                <td> <img src="../${data[i].image}" width="60"> </td>
                <td>${data[i].name}</td>
                <td>${count}</td>
                <td>
                    <button type="button" class="btn btn-warning btn-sm" onclick="editCategory(${data[i].id})"><i class="fa-regular fa-pen-to-square"></i> Edit</button>
                    <button type="button" class="btn btn-danger btn-sm" onclick="deleteCategory(${data[i].id}, '${data[i].name}')"><i class="fa-regular fa-trash-can"></i> Delete</button>
                </td>
            </tr>
            `
    }
    CategoriesTable.innerHTML=container;
}
//search
searchInput.addEventListener("input", function () {
    let value = searchInput.value.toLowerCase();
    let filtered = categoriesList.filter(p =>
        p.name.toLowerCase().includes(value)
    );
    displayCategories(filtered);
});

//fetchProducts
function fetchProducts(){
    let request = new XMLHttpRequest();
    request.open("GET","http://localhost:3000/products");
    request.send();

    request.addEventListener("readystatechange", function(){
        if(request.readyState === 4 && request.status === 200){
            productsList = JSON.parse(request.responseText);
            fetchCategories();
        }
    });
}

// fetchCategories
function fetchCategories(){
    let request = new XMLHttpRequest();
    request.open("GET","http://localhost:3000/categories");
    request.send();
    request.addEventListener("readystatechange", function(){
        if(request.readyState === 4 && request.status === 200){
            categoriesList = JSON.parse(request.responseText);
            displayCategories(categoriesList);
        }
    });
}

//deleteCategory
function deleteCategory(id, name){
    let relatedProducts = productsList.filter(p =>
        p.category === name
    );
    if(relatedProducts.length > 0){
        Swal.fire({
            icon: 'error',
            text: 'Cannot delete category, it has products.'
        });
        return;
    }
    Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,

        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            let request = new XMLHttpRequest();
            request.open("DELETE", `http://localhost:3000/categories/${id}`);
            request.send();
            request.addEventListener("readystatechange", function(){
                if(request.readyState === 4){
                    fetchProducts(); 
                }
            });
        }
    });
    
}

document.getElementById("open-form-btn").addEventListener("click", () => {
    currentEditId = null;
    document.querySelector(".modal-title").innerText = "Add Category";
    document.getElementById("saveBtn").innerText = "Save Category";
    resetCategoryForm();
    modal.show();
});

function editCategory(id) {
    currentEditId = id;
    let Category = categoriesList.find(p => p.id === id);
    document.querySelector(".modal-title").innerText = "Edit Category";
    document.getElementById("saveBtn").innerText = "Update Category";
    document.getElementById("name").value = Category.name;
    document.getElementById("image").value = Category.image;
    modal.show();
}

document.getElementById("saveBtn").addEventListener("click", function (e) {
    e.preventDefault(); 
    let nameInput = document.getElementById("name");
    let imageInput = document.getElementById("image");
    let nameError = document.getElementById("nameError");
    let imageError = document.getElementById("imageError");
    let name = nameInput.value.trim();
    let image = imageInput.value.trim();
    nameError.textContent = "";
    imageError.textContent = "";

    //validation
    if (!name || !image) {
        if (!name) nameError.textContent = "Please enter category name";
        if (!image) imageError.textContent = "Please enter category image";
        return;
    }

    let exists = false;
    for (let i = 0; i < categoriesList.length; i++) {
        if (categoriesList[i].name.toLowerCase() === name.toLowerCase() && categoriesList[i].id !== currentEditId) {
            exists = true;
            break;
        }
    }
    if (exists) {
        nameError.textContent = "Category name already exists";
        return;
    }

    let oldCategory = categoriesList.find(c => c.id === currentEditId);
    let oldName = oldCategory ? oldCategory.name : null;
    let Category = { name, image };
    let request = new XMLHttpRequest();

    if (currentEditId) {
        request.open("PUT", `http://localhost:3000/categories/${currentEditId}`);
    } else {
        request.open("POST", "http://localhost:3000/categories");
    }
    request.setRequestHeader("Content-Type", "application/json");
    request.onload = function () {
        if (oldName && oldName !== name) {
            productsList.forEach(p => {
                if (p.category === oldName) {
                    p.category = name;
                    let r = new XMLHttpRequest();
                    r.open("PUT", `http://localhost:3000/products/${p.id}`);
                    r.setRequestHeader("Content-Type", "application/json");
                    r.send(JSON.stringify(p));
                }
            });
        }
        modal.hide();
        fetchCategories();
        currentEditId = null;
    };

    request.send(JSON.stringify(Category));
});

function resetCategoryForm() {
    document.getElementById("name").value = "";
    document.getElementById("image").value = "";
    document.getElementById("nameError").textContent = "";
    document.getElementById("imageError").textContent = "";
}

fetchProducts();

