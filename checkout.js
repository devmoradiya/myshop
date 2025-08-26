(function() {
	const STORAGE_KEY = 'shopkart_cart';
	const els = {
		summary: document.getElementById('summary'),
		form: document.getElementById('checkout-form'),
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
		const obj = {}; for (const [id, qty] of cart.entries()) obj[id] = qty;
		localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
	}
	function clearCart() { localStorage.removeItem(STORAGE_KEY); }
	function updateCartCount(cart) { let c = 0; for (const q of cart.values()) c += q; els.cartCount.textContent = String(c); }

	function computeSummary(cart) {
		const items = Array.from(cart.entries()).map(([id, qty]) => ({ product: SHOP.products.find(p => p.id === id), qty }));
		const valid = items.filter(i => i.product);
		let subtotal = 0;
		valid.forEach(i => subtotal += i.product.price * i.qty);
		const shipping = subtotal > 100 ? 0 : 6.99;
		const tax = subtotal * 0.07;
		const total = subtotal + shipping + tax;
		return { items: valid, subtotal, shipping, tax, total };
	}

	function renderSummary() {
		setYear();
		const cart = loadCart();
		updateCartCount(cart);
		const s = computeSummary(cart);
		if (s.items.length === 0) {
			els.summary.innerHTML = `<p>Your cart is empty. <a href="/">Continue shopping</a>.</p>`;
			els.form.querySelector('.place-order').setAttribute('disabled', 'true');
			return;
		}
		els.form.querySelector('.place-order').removeAttribute('disabled');
		els.summary.innerHTML = `
			${s.items.map(i => `
				<div style="display:flex; align-items:center; gap:8px;">
					<img src="${i.product.image}" alt="${i.product.title}" class="cart-thumb" />
					<div style="flex:1;">
						<div>${i.product.title}</div>
						<div class="product-meta">Qty ${i.qty}</div>
					</div>
					<div>${formatPrice(i.product.price * i.qty)}</div>
				</div>
			`).join('')}
			<hr />
			<div>Subtotal: <strong>${formatPrice(s.subtotal)}</strong></div>
			<div>Shipping: <strong>${s.shipping === 0 ? 'Free' : formatPrice(s.shipping)}</strong></div>
			<div>Tax: <strong>${formatPrice(s.tax)}</strong></div>
			<div>Total: <strong>${formatPrice(s.total)}</strong></div>
		`;
	}

	function wireSubmit() {
		els.form.addEventListener('submit', e => {
			e.preventDefault();
			const btn = els.form.querySelector('.place-order');
			btn.setAttribute('disabled', 'true');
			btn.textContent = 'Placing order...';
			setTimeout(() => {
				clearCart();
				els.summary.innerHTML = `
					<div class="card">
						<h3>🎉 Order confirmed!</h3>
						<p>Thank you for your purchase. Your items will ship soon.</p>
						<p><a class="button" href="/">Back to Home</a></p>
					</div>
				`;
			}, 1000);
		});
	}

	document.addEventListener('DOMContentLoaded', () => {
		renderSummary();
		wireSubmit();
	});
})();