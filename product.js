(function() {
	const STORAGE_KEY = 'shopkart_cart';
	const els = {
		root: document.getElementById('product-root'),
		cartCount: document.getElementById('cart-count'),
	};

	function getParam(name) {
		const url = new URL(window.location.href);
		return url.searchParams.get(name);
	}
	function formatPrice(n) {
		return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(n);
	}
	function loadCart() {
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			if (!raw) return new Map();
			const obj = JSON.parse(raw);
			return new Map(Object.entries(obj).map(([id, qty]) => [id, Number(qty) || 0]));
		} catch { return new Map(); }
	}
	function saveCart(cart) {
		const obj = {}; for (const [id, qty] of cart.entries()) obj[id] = qty;
		localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
	}
	function updateCartCount(cart) { let c = 0; for (const q of cart.values()) c += q; els.cartCount.textContent = String(c); }

	function render() {
		const id = getParam('id');
		const p = SHOP.products.find(x => x.id === id);
		const cart = loadCart();
		updateCartCount(cart);
		if (!p) {
			els.root.innerHTML = `<div class="card"><p>Product not found.</p><p><a class="button" href="/">Back to Home</a></p></div>`;
			return;
		}
		els.root.innerHTML = `
			<div class="detail-grid">
				<div class="gallery">
					<img src="${p.image}" alt="${p.title}" />
				</div>
				<div class="info">
					<h1>${p.title}</h1>
					<div class="product-meta">⭐ ${p.rating} • ${p.reviews.toLocaleString()} reviews</div>
					<div class="price">${formatPrice(p.price)}</div>
					<ul class="bullets">
						<li>Free returns within 30 days</li>
						<li>Fast, secure shipping</li>
						<li>Warranty included</li>
					</ul>
					<div class="actions">
						<button class="button" id="add">Add to Cart</button>
						<a class="button secondary" href="/cart.html">Go to Cart</a>
					</div>
				</div>
			</div>
		`;
		const add = document.getElementById('add');
		add.addEventListener('click', () => {
			const prev = cart.get(p.id) || 0;
			cart.set(p.id, prev + 1);
			saveCart(cart);
			updateCartCount(cart);
			add.textContent = 'Added!';
			setTimeout(() => add.textContent = 'Add to Cart', 800);
		});
	}

	document.addEventListener('DOMContentLoaded', render);
})();