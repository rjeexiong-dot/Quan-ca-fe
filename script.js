const CART_KEY = "cart";
const FREE_SHIP_FROM = 150000; // miễn phí giao từ mức này
const SHIP_FEE = 15000;

let cart = [];

function loadCart() {
  try {
    cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch (e) {
    cart = [];
  }
}

function saveCart() {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch (e) {
    // trình duyệt chặn localStorage: giỏ hàng chỉ giữ trong trang này
  }
}

function formatVND(n) {
  return n.toLocaleString("vi-VN") + "đ";
}

function showToast(text) {
  const el = document.getElementById("toast");
  if (!el) return;
  el.textContent = text;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 1800);
}

function subtotal() {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function updateCount() {
  const badge = document.getElementById("count");
  if (badge) {
    badge.textContent = cart.reduce((sum, item) => sum + item.qty, 0);
  }
}

function addToCart(button) {
  const id = button.dataset.id;
  const found = cart.find(item => item.id === id);

  if (found) {
    found.qty++;
  } else {
    cart.push({
      id: id,
      name: button.dataset.name,
      price: Number(button.dataset.price),
      qty: 1
    });
  }

  saveCart();
  updateCount();
  showToast("Đã thêm " + button.dataset.name + " vào giỏ hàng");
}

function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;

  item.qty += delta;
  cart = cart.filter(i => i.qty > 0);

  saveCart();
  updateCount();
  renderCart();
}

function clearCart() {
  cart = [];
  saveCart();
  updateCount();
  renderCart();
}

function renderCart() {
  const box = document.getElementById("cart");
  const total = document.getElementById("total");
  if (!box) return;

  if (cart.length === 0) {
    box.innerHTML = '<p>Giỏ hàng đang trống. <a href="menu.html">Xem thực đơn</a></p>';
    total.innerHTML = "";
    return;
  }

  box.innerHTML = cart.map(item => `
    <div class="item">
      <span>${item.name}</span>
      <span>
        <button data-d="-1" data-id="${item.id}" aria-label="Giảm">−</button>
        ${item.qty}
        <button data-d="1" data-id="${item.id}" aria-label="Tăng">+</button>
      </span>
      <b>${formatVND(item.price * item.qty)}</b>
    </div>
  `).join("");

  const sub = subtotal();
  const ship = sub >= FREE_SHIP_FROM ? 0 : SHIP_FEE;

  total.innerHTML = `
    <div class="sum"><span>Tạm tính</span><span>${formatVND(sub)}</span></div>
    <div class="sum"><span>Phí giao hàng</span><span>${ship === 0 ? "Miễn phí" : formatVND(ship)}</span></div>
    <div class="sum big"><span>Tổng cộng</span><span>${formatVND(sub + ship)}</span></div>
  `;
}

function submitOrder(form) {
  if (cart.length === 0) {
    showToast("Giỏ hàng đang trống");
    return;
  }

  const name = form.elements["name"].value.trim();
  cart = [];
  saveCart();
  updateCount();
  renderCart();
  form.reset();

  document.getElementById("cart").innerHTML =
    "<p>Cảm ơn " + name + ", đơn hàng đã được ghi nhận.</p>";
  showToast("Đặt hàng thành công. Cảm ơn bạn!");
}

function applyFilter(type) {
  document.querySelectorAll(".filter").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.f === type);
  });

  document.querySelectorAll(".card[data-cat]").forEach(card => {
    card.hidden = type !== "all" && card.dataset.cat !== type;
  });
}
document.addEventListener("click", event => {
  const buy = event.target.closest(".buy");
  if (buy) {
    addToCart(buy);
    return;
  }

  const qty = event.target.closest("[data-d]");
  if (qty) {
    changeQty(qty.dataset.id, Number(qty.dataset.d));
    return;
  }

  const filter = event.target.closest(".filter");
  if (filter) {
    applyFilter(filter.dataset.f);
    return;
  }

  if (event.target.id === "clear") {
    clearCart();
  }
});

document.addEventListener("submit", event => {
  const form = event.target;

  if (form.id === "orderForm") {
    event.preventDefault();
    submitOrder(form);
  }

  if (form.id === "contactForm") {
    event.preventDefault();
    form.reset();
    showToast("Đã gửi tin nhắn");
  }
});
loadCart();
updateCount();
renderCart();