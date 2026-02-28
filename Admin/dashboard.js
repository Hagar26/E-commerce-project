function getCount(url, elementId) {
  let request = new XMLHttpRequest();
  request.open("GET", "http://localhost:3000" + url);
  request.send();
  request.addEventListener("readystatechange", function () {
    if (request.readyState === 4 && request.status === 200) {
      let data = JSON.parse(request.responseText);
      document.getElementById(elementId).innerText = data.length;
    }
  });
}

function loadCounts() {
  getCount("/products", "productsCount");
  getCount("/orders", "ordersCount");
  getCount("/users", "usersCount");
  getCount("/categories", "categoriesCount");
}

loadCounts();
