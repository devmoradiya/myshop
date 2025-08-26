(function() {
	const STORAGE_KEY = 'shopkart_cart';
	const state = {
		query: '',
		category: 'all',
		sort: 'popular',
		cart: new Map(), // id -> quantity
	};

	const els = {
		year: document.getElementById('year'),
		navCategories: document.getElementById('nav-categories'),
		productGrid: document.getElementById('product-grid'),
		sortSelect: document.getElementById('sort-select'),
		searchForm: document.getElementById('search-form'),
		searchInput: document.getElementById('search-input'),
		cartButton: document.getElementById('cart-button'),
		cartCount: document.getElementById('cart-count'),
	};

	function setYear() {
		if (els.year) els.year.textContent = String(new Date().getFullYear());
	}

	function loadCartFromStorage() {
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			if (!raw) return;
			const obj = JSON.parse(raw);
			state.cart = new Map(Object.entries(obj).map(([id, qty]) => [id, Number(qty) || 0]));
		} catch {}
	}

	function saveCartToStorage() {
		const obj = {};
		for (const [id, qty] of state.cart.entries()) obj[id] = qty;
		localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
	}

	function formatPrice(n) {
		return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(n);
	}

	function renderCategories() {
		const all = [{ id: 'all', name: 'All' }, ...SHOP.categories];
		els.navCategories.innerHTML = all.map(c => {
			const active = c.id === state.category ? 'active' : '';
			return `<a href="#" data-category="${c.id}" class="${active}">${c.name}</a>`;
		}).join('');
		els.navCategories.querySelectorAll('a').forEach(a => {
			a.addEventListener('click', e => {
				e.preventDefault();
				state.category = a.getAttribute('data-category');
				renderCategories();
				renderProducts();
			});
		});
	}

	function productMatchesQuery(product, query) {
		if (!query) return true;
		const q = query.toLowerCase();
		return product.title.toLowerCase().includes(q);
	}

	function getFilteredProducts() {
		let items = SHOP.products.slice();
		if (state.category !== 'all') {
			items = items.filter(p => p.category === state.category);
		}
		if (state.query) {
			items = items.filter(p => productMatchesQuery(p, state.query));
		}
		if (state.sort === 'price-asc') items.sort((a, b) => a.price - b.price);
		else if (state.sort === 'price-desc') items.sort((a, b) => b.price - a.price);
		else if (state.sort === 'popular') items.sort((a, b) => b.reviews - a.reviews);
		return items;
	}

	function renderProducts() {
		const items = getFilteredProducts();
		els.productGrid.innerHTML = items.map(p => {
			return `
				<article class="product-card" data-id="${p.id}">
					<img src="${p.image}" alt="${p.title}" class="product-thumb" />
					<div class="product-body">
						<h3 class="product-title">${p.title}</h3>
						<div class="product-meta">⭐ ${p.rating} • ${p.reviews.toLocaleString()} reviews</div>
						<div class="product-price">${formatPrice(p.price)}</div>
						<div class="card-actions">
							<button class="button secondary" data-action="details">Details</button>
							<button class="button" data-action="add">Add to Cart</button>
						</div>
					</div>
				</article>
			`;
		}).join('');

		// Wire actions
		els.productGrid.querySelectorAll('.button').forEach(btn => {
			btn.addEventListener('click', e => {
				const action = btn.getAttribute('data-action');
				const card = btn.closest('.product-card');
				const id = card.getAttribute('data-id');
				if (action === 'add') addToCart(id);
				if (action === 'details') window.location.href = `/product.html?id=${id}`;
			});
		});
	}

	function addToCart(id) {
		const prev = state.cart.get(id) || 0;
		state.cart.set(id, prev + 1);
		saveCartToStorage();
		updateCartCount();
	}

	function updateCartCount() {
		let count = 0;
		for (const qty of state.cart.values()) count += qty;
		els.cartCount.textContent = String(count);
	}

	function openDetails(id) {
		const p = SHOP.products.find(x => x.id === id);
		if (!p) return;
		const html = `
			<div class="modal-backdrop" id="modal">
				<div class="modal">
					<img src="${p.image}" alt="${p.title}" class="product-thumb" />
					<div class="product-body">
						<h3 class="product-title">${p.title}</h3>
						<div class="product-meta">⭐ ${p.rating} • ${p.reviews.toLocaleString()} reviews</div>
						<div class="product-price">${formatPrice(p.price)}</div>
						<p>High-quality product with great reviews. Ships fast.</p>
						<div class="card-actions">
							<button class="button" data-close>Close</button>
							<button class="button" data-add>Add to Cart</button>
						</div>
					</div>
				</div>
			</div>
		`;
		const wrapper = document.createElement('div');
		wrapper.innerHTML = html;
		document.body.appendChild(wrapper.firstElementChild);
		const modal = document.getElementById('modal');
		modal.addEventListener('click', e => {
			if (e.target === modal || e.target.closest('[data-close]')) modal.remove();
			if (e.target.closest('[data-add]')) { addToCart(id); modal.remove(); }
		});
	}

	function wireEvents() {
		els.sortSelect.addEventListener('change', () => {
			state.sort = els.sortSelect.value;
			renderProducts();
		});
		els.searchForm.addEventListener('submit', e => {
			e.preventDefault();
			state.query = els.searchInput.value.trim();
			renderProducts();
		});
		els.cartButton.addEventListener('click', () => {
			window.location.href = '/cart.html';
		});
	}

	function injectModalStyles() {
		const style = document.createElement('style');
		style.textContent = `
			.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.5); display: grid; place-items: center; padding: 16px; z-index: 100; }
			.modal { max-width: 720px; width: 100%; background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid var(--border); display: grid; grid-template-columns: 1fr 1fr; }
			@media (max-width: 720px) { .modal { grid-template-columns: 1fr; } }
		`;
		document.head.appendChild(style);
	}

	function init() {
		setYear();
		loadCartFromStorage();
		injectModalStyles();
		renderCategories();
		renderProducts();
		updateCartCount();
		wireEvents();
	}

	document.addEventListener('DOMContentLoaded', init);
})();