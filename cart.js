(function() {
	const STORAGE_KEY = 'shopkart_cart';
	const els = {
		root: document.getElementById('cart-root'),
		cartCount: document.getElementById('cart-count'),
		year: document.getElementById('year'),
	};

	function setYear() {
		if (els.year) els.year.textContent = String(new Date().getFullYear());
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
		const obj = {};
		for (const [id, qty] of cart.entries()) obj[id] = qty;
		localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
	}

	function getCartItems(cart) {
		return Array.from(cart.entries()).map(([id, qty]) => {
			const p = SHOP.products.find(x => x.id === id);
			return { product: p, quantity: qty };
		}).filter(x => x.product);
	}

	function updateCartCount(cart) {
		let count = 0; for (const q of cart.values()) count += q;
		els.cartCount.textContent = String(count);
	}

	function render() {
		setYear();
		const cart = loadCart();
		updateCartCount(cart);
		const items = getCartItems(cart);
		if (items.length === 0) {
			els.root.innerHTML = `
				<div class="card">
					<p>Your cart is empty.</p>
					<p><a class="button" href="/">Continue shopping</a></p>
				</div>
			`;
			return;
		}
		let subtotal = 0;
		items.forEach(({ product, quantity }) => subtotal += product.price * quantity);
		const shipping = subtotal > 100 ? 0 : 6.99;
		const tax = subtotal * 0.07;
		const total = subtotal + shipping + tax;
		els.root.innerHTML = `
			<table class="cart-table">
				<thead>
					<tr>
						<th>Product</th>
						<th>Price</th>
						<th>Qty</th>
						<th>Total</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					${items.map(({ product, quantity }) => `
						<tr data-id="${product.id}">
							<td>
								<div style="display:flex; gap:12px; align-items:center;">
									<img class="cart-thumb" src="${product.image}" alt="${product.title}" />
									<div>
										<div>${product.title}</div>
										<div class="product-meta">⭐ ${product.rating} • ${product.reviews.toLocaleString()} reviews</div>
									</div>
								</div>
							</td>
							<td>${formatPrice(product.price)}</td>
							<td><input class="qty-input" type="number" min="1" value="${quantity}" /></td>
							<td>${formatPrice(product.price * quantity)}</td>
							<td class="row-actions"><button data-remove>Remove</button></td>
						</tr>
					`).join('')}
				</tbody>
			</table>
			<div class="cart-summary">
				<div>Subtotal: <strong>${formatPrice(subtotal)}</strong></div>
				<div>Shipping: <strong>${shipping === 0 ? 'Free' : formatPrice(shipping)}</strong></div>
				<div>Tax: <strong>${formatPrice(tax)}</strong></div>
				<div>Total: <strong>${formatPrice(total)}</strong></div>
				<a class="button" href="/checkout.html">Proceed to Checkout</a>
			</div>
		`;

		// Wire qty update and remove
		els.root.querySelectorAll('tr[data-id]').forEach(row => {
			const id = row.getAttribute('data-id');
			const qtyInput = row.querySelector('.qty-input');
			qtyInput.addEventListener('change', () => {
				let next = Math.max(1, Number(qtyInput.value) || 1);
				cart.set(id, next);
				saveCart(cart);
				render();
			});
			row.querySelector('[data-remove]').addEventListener('click', () => {
				cart.delete(id);
				saveCart(cart);
				render();
			});
		});
	}

	document.addEventListener('DOMContentLoaded', render);
})();