/*
  Food Store - App
  Simple data-driven rendering and interactions.
*/

const restaurants = [
  {
    id: "r1",
    name: "Tasty Biryani House",
    cuisines: ["Biryani", "Indian"],
    rating: 4.3,
    deliveryTimeMins: 28,
    costForTwo: 350,
    isVeg: false,
    hasOffer: true,
    image: "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "r2",
    name: "Green Bowl",
    cuisines: ["Salads", "Healthy", "Continental"],
    rating: 4.6,
    deliveryTimeMins: 22,
    costForTwo: 400,
    isVeg: true,
    hasOffer: false,
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "r3",
    name: "Pizza Plaza",
    cuisines: ["Pizza", "Italian"],
    rating: 4.1,
    deliveryTimeMins: 35,
    costForTwo: 500,
    isVeg: false,
    hasOffer: true,
    image: "https://images.unsplash.com/photo-1548365328-9f547fb0953d?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "r4",
    name: "Sichuan Express",
    cuisines: ["Chinese", "Asian"],
    rating: 4.4,
    deliveryTimeMins: 32,
    costForTwo: 300,
    isVeg: false,
    hasOffer: false,
    image: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "r5",
    name: "Bombay Sandwich Co",
    cuisines: ["Snacks", "Street Food"],
    rating: 3.9,
    deliveryTimeMins: 18,
    costForTwo: 200,
    isVeg: true,
    hasOffer: true,
    image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "r6",
    name: "The Curry Pot",
    cuisines: ["North Indian", "Curry"],
    rating: 4.5,
    deliveryTimeMins: 40,
    costForTwo: 600,
    isVeg: false,
    hasOffer: true,
    image: "https://images.unsplash.com/photo-1604909052743-88ea3d88b08b?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "r7",
    name: "Fresh Dosas",
    cuisines: ["South Indian"],
    rating: 4.2,
    deliveryTimeMins: 24,
    costForTwo: 250,
    isVeg: true,
    hasOffer: false,
    image: "https://images.unsplash.com/photo-1617692855027-2e4657db3d6d?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "r8",
    name: "Bento & Bowl",
    cuisines: ["Japanese", "Asian"],
    rating: 4.7,
    deliveryTimeMins: 36,
    costForTwo: 700,
    isVeg: false,
    hasOffer: false,
    image: "https://images.unsplash.com/photo-1526318472351-c75fcf070305?q=80&w=1200&auto=format&fit=crop",
  },
];

const allCuisines = Array.from(new Set(restaurants.flatMap(r => r.cuisines))).sort();
const state = {
  query: "",
  selectedCuisine: null,
  sort: "relevance",
  filterFast: false,
  filterRating: false,
  filterVeg: false,
  filterOffers: false,
};

const el = {
  grid: document.getElementById("cardGrid"),
  search: document.getElementById("searchInput"),
  sort: document.getElementById("sortSelect"),
  chips: document.getElementById("categoryChips"),
  results: document.getElementById("resultsCount"),
  filterFast: document.getElementById("filterFast"),
  filterRating: document.getElementById("filterRating"),
  filterVeg: document.getElementById("filterVeg"),
  filterOffers: document.getElementById("filterOffers"),
};

function renderChips() {
  el.chips.innerHTML = "";
  const fragment = document.createDocumentFragment();

  const allChip = document.createElement("button");
  allChip.className = `chip ${state.selectedCuisine ? "" : "active"}`;
  allChip.textContent = "All";
  allChip.addEventListener("click", () => {
    state.selectedCuisine = null;
    update();
  });
  fragment.appendChild(allChip);

  for (const cuisine of allCuisines) {
    const chip = document.createElement("button");
    chip.className = `chip ${state.selectedCuisine === cuisine ? "active" : ""}`;
    chip.textContent = cuisine;
    chip.addEventListener("click", () => {
      state.selectedCuisine = cuisine;
      update();
    });
    fragment.appendChild(chip);
  }

  el.chips.appendChild(fragment);
}

function applyFiltersSort(items) {
  let filtered = items.filter(r => {
    const matchesQuery = !state.query ||
      r.name.toLowerCase().includes(state.query) ||
      r.cuisines.join(", ").toLowerCase().includes(state.query);

    const matchesCuisine = !state.selectedCuisine || r.cuisines.includes(state.selectedCuisine);
    const matchesFast = !state.filterFast || r.deliveryTimeMins <= 30;
    const matchesRating = !state.filterRating || r.rating >= 4.0;
    const matchesVeg = !state.filterVeg || r.isVeg;
    const matchesOffers = !state.filterOffers || r.hasOffer;

    return matchesQuery && matchesCuisine && matchesFast && matchesRating && matchesVeg && matchesOffers;
  });

  switch (state.sort) {
    case "delivery_time_asc":
      filtered.sort((a, b) => a.deliveryTimeMins - b.deliveryTimeMins);
      break;
    case "rating_desc":
      filtered.sort((a, b) => b.rating - a.rating);
      break;
    case "cost_low_high":
      filtered.sort((a, b) => a.costForTwo - b.costForTwo);
      break;
    case "cost_high_low":
      filtered.sort((a, b) => b.costForTwo - a.costForTwo);
      break;
    default:
      // relevance: keep original order
      break;
  }

  return filtered;
}

function formatCost(cost) {
  return `₹${cost} for two`;
}

function renderGrid(items) {
  el.grid.innerHTML = "";
  const fragment = document.createDocumentFragment();

  for (const r of items) {
    const card = document.createElement("article");
    card.className = "card";

    const media = document.createElement("div");
    media.className = "card-media";
    const img = document.createElement("img");
    img.loading = "lazy";
    img.src = r.image;
    img.alt = `${r.name} banner`;
    media.appendChild(img);

    const badge = document.createElement("div");
    badge.className = "badge";
    badge.textContent = r.hasOffer ? "OFFER" : (r.isVeg ? "VEG" : "NON-VEG");
    media.appendChild(badge);

    const body = document.createElement("div");
    body.className = "card-body";

    const title = document.createElement("h3");
    title.className = "card-title";
    title.textContent = r.name;

    const sub = document.createElement("p");
    sub.className = "card-sub";
    sub.textContent = r.cuisines.join(", ");

    const meta = document.createElement("div");
    meta.className = "card-meta";
    const rating = document.createElement("span");
    rating.className = "rating";
    rating.textContent = `★ ${r.rating.toFixed(1)}`;
    const dot = document.createElement("span");
    dot.className = "dot";
    const time = document.createElement("span");
    time.textContent = `${r.deliveryTimeMins} mins`;
    const cost = document.createElement("span");
    cost.textContent = formatCost(r.costForTwo);

    meta.appendChild(rating);
    meta.appendChild(dot);
    meta.appendChild(time);
    meta.appendChild(dot.cloneNode(true));
    meta.appendChild(cost);

    body.appendChild(title);
    body.appendChild(sub);
    body.appendChild(meta);

    card.appendChild(media);
    card.appendChild(body);
    fragment.appendChild(card);
  }

  el.grid.appendChild(fragment);
  el.results.textContent = `${items.length} place${items.length === 1 ? "" : "s"}`;
}

function update() {
  const filtered = applyFiltersSort(restaurants);
  renderGrid(filtered);
  renderChips();
}

function bindEvents() {
  el.search.addEventListener("input", (e) => {
    state.query = e.target.value.trim().toLowerCase();
    update();
  });
  el.sort.addEventListener("change", (e) => {
    state.sort = e.target.value;
    update();
  });
  el.filterFast.addEventListener("change", (e) => { state.filterFast = e.target.checked; update(); });
  el.filterRating.addEventListener("change", (e) => { state.filterRating = e.target.checked; update(); });
  el.filterVeg.addEventListener("change", (e) => { state.filterVeg = e.target.checked; update(); });
  el.filterOffers.addEventListener("change", (e) => { state.filterOffers = e.target.checked; update(); });
}

// init
bindEvents();
renderChips();
renderGrid(restaurants);