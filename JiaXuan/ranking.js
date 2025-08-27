//localStorage.removeItem("msf_votes"); // for testing only, remove in production

/* ==========================
   Top 10 Malaysian Street Foods
   ========================== */
const dishes = [
  {
    id: "nasi-lemak",
    name: "Nasi Lemak",
    region: "Nationwide",
    category: "rice",
    rating: 4.8,
    votes: 1384,
    image: "JiaXuan/images/nasilemak.jpg",
    desc: "Coconut rice with spicy sambal, fried anchovies, peanuts, egg, and cucumber. Often paired with fried chicken or rendang.",
    wiki: "https://en.wikipedia.org/wiki/Nasi_lemak"
  },
  {
    id: "char-kway-teow",
    name: "Char Kway Teow",
    region: "Penang",
    category: "noodles",
    rating: 4.7,
    votes: 1210,
    image: "JiaXuan/images/char-kway-teow.jpg",
    desc: "Flat rice noodles stir-fried over high heat with prawns, cockles, Chinese sausage, egg, and chives, famous for its smoky wok flavor.",
    wiki: "https://en.wikipedia.org/wiki/Char_kway_teow"
  },
  {
    id: "roti-canai",
    name: "Roti Canai",
    region: "Nationwide",
    category: "bread",
    rating: 4.7,
    votes: 1540,
    image: "JiaXuan/images/roticanai.jpg",
    desc: "A crispy yet soft layered flatbread, usually eaten with dhal curry or other rich gravies, and loved as a breakfast or supper meal.",
    wiki: "https://en.wikipedia.org/wiki/Roti_canai"
  },
  {
    id: "asam-laksa",
    name: "Asam Laksa",
    region: "Penang",
    category: "noodles",
    rating: 4.6,
    votes: 1033,
    image: "JiaXuan/images/asamlaksa.jpg",
    desc: "Sour and spicy noodle soup with a tamarind fish broth, thick rice noodles, and fresh toppings like mint, cucumber, and shrimp paste.",
    wiki: "https://en.wikipedia.org/wiki/Asam_laksa"
  },
  {
    id: "satay",
    name: "Satay",
    region: "Kajang & Nationwide",
    category: "meat",
    rating: 4.6,
    votes: 1297,
    image: "JiaXuan/images/satay2.jpg",
    desc: "Skewers of grilled meat served with a rich peanut sauce, cucumber, onions, and rice cakes, perfect for sharing.",
    wiki: "https://en.wikipedia.org/wiki/Satay"
  },
  {
    id: "kl-hokkien-mee",
    name: "KL Hokkien Mee",
    region: "Kuala Lumpur",
    category: "noodles",
    rating: 4.5,
    votes: 922,
    image: "JiaXuan/images/klhokkienmee.jpg",
    desc: "Thick yellow noodles cooked in dark soy sauce with prawns, pork lard, and cabbage, giving it a rich and smoky flavor.",
    wiki: "https://en.wikipedia.org/wiki/Hokkien_mee"
  },
  {
    id: "cendol",
    name: "Cendol",
    region: "Nationwide",
    category: "dessert",
    rating: 4.5,
    votes: 1108,
    image: "JiaXuan/images/cendol2.jpg",
    desc: "Shaved ice dessert topped with pandan green jelly, red bean, coconut milk, and sweet palm sugar syrup, a cooling treat on hot days.",
    wiki: "https://en.wikipedia.org/wiki/Cendol"
  },
  {
    id: "nasi-kandar",
    name: "Nasi Kandar",
    region: "Penang",
    category: "mixed",
    rating: 4.5,
    votes: 1015,
    image: "JiaXuan/images/nasikandar.jpg",
    desc: "Steamed rice served with different curries and side dishes, where the sauces are mixed together to create bold flavors.",
    wiki: "https://en.wikipedia.org/wiki/Nasi_kandar"
  },
  {
    id: "mee-goreng-mamak",
    name: "Mee Goreng Mamak",
    region: "Nationwide",
    category: "noodles",
    rating: 4.4,
    votes: 980,
    image: "JiaXuan/images/meegorengmamak.jpg",
    desc: "Stir-fried yellow noodles with a spicy and tangy taste, mixed with tofu, potato, egg, and lime for a signature mamak flavor.",
    wiki: "https://en.wikipedia.org/wiki/Mee_goreng"
  },
  {
    id: "apam-balik",
    name: "Apam Balik",
    region: "Nationwide",
    category: "dessert",
    rating: 4.3,
    votes: 760,
    image: "JiaXuan/images/apambalik.jpg",
    desc: "A crispy folded pancake filled with peanuts, sugar, and butter, sometimes with extra fillings like corn or chocolate.",
    wiki: "https://en.wikipedia.org/wiki/Apam_balik"
  }
];

// ------- Helpers -------
const qs = (sel, el = document) => el.querySelector(sel);
const qsa = (sel, el = document) => [...el.querySelectorAll(sel)];

const KEY_VOTES = "msf_votes";
function loadVoteState() {
  try {
    return JSON.parse(localStorage.getItem(KEY_VOTES)) || {};
  } catch (e) { return {}; }
}
function saveVoteState(state) {
  localStorage.setItem(KEY_VOTES, JSON.stringify(state));
}

function formatVotes(n) {
  return n.toLocaleString("en-US");
}

function createCard(d, index) {
  const card = document.createElement("article");
  card.className = "card";
  card.dataset.id = d.id;

  const rank = index + 1;
  card.innerHTML = `
    <div class="rank">#${rank}</div>
    <img class="thumb" src="${d.image}" alt="${d.name}">
    <div class="card-main">
      <div class="card-title">
        <h3>${d.name}</h3>
        <div class="tags">
          <span class="tag">${d.region}</span>
          <span class="tag">${prettyCategory(d.category)}</span>
        </div>
      </div>
      <p class="card-desc">${d.desc}</p>
    </div>
    <div class="card-right">
      <span class="rating-badge">${d.rating.toFixed(1)}</span>
      <span class="votes-badge" title="Total votes">${formatVotes(d.votes)} votes</span>
      <button class="btn primary vote-btn">Vote</button>
      <a href="${d.wiki}" target="_blank" class="btn ghost details-btn">Details</a>
    </div>
  `;
  return card;
}

function prettyCategory(c) {
  const map = {
    rice: "Rice",
    noodles: "Noodles",
    bread: "Bread / Roti",
    meat: "Meat / Skewers",
    dessert: "Dessert",
    mixed: "Mixed / Combo"
  };
  return map[c] || c;
}

// ------- State -------
let currentList = [...dishes];

// ------- Rendering -------
function renderList() {
  const list = qs("#list");
  list.innerHTML = "";
  currentList.forEach((d, i) => {
    list.appendChild(createCard(d, i));
  });
  hydrateVoteButtons();
}

// ------- Voting -------
function hydrateVoteButtons() {
  const votesState = loadVoteState();
  qsa(".vote-btn").forEach(btn => {
    const card = btn.closest(".card");
    const id = card.dataset.id;
    if (votesState[id]) {
      btn.textContent = "Voted";
      btn.disabled = true;
    }
    btn.addEventListener("click", () => {
      handleVote(id, card, btn);
    }, { once: true });
  });
}

function handleVote(id, card, btn) {
  const item = currentList.find(d => d.id === id);
  if (!item) return;

  const votesState = loadVoteState();
  if (votesState[id]) return;

  item.votes += 1;
  votesState[id] = true;
  saveVoteState(votesState);

  const votesEl = card.querySelector(".votes-badge");
  votesEl.textContent = `${formatVotes(item.votes)} votes`;

  btn.textContent = "Voted";
  btn.disabled = true;

  const sortValue = qs("#sortSelect").value;
  if (sortValue === "votes") {
    applySort(sortValue);
  }
}

// ------- Search / Filter / Sort -------
const searchInput = qs("#searchInput");
const clearSearch = qs("#clearSearch");
const categoryFilter = qs("#categoryFilter");
const sortSelect = qs("#sortSelect");

searchInput.addEventListener("input", applyFilters);
clearSearch.addEventListener("click", () => { searchInput.value = ""; applyFilters(); });
categoryFilter.addEventListener("change", applyFilters);
sortSelect.addEventListener("change", () => applySort(sortSelect.value));

function applyFilters() {
  const term = searchInput.value.trim().toLowerCase();
  const cat = categoryFilter.value;

  currentList = dishes.filter(d => {
    const matchesTerm = !term
      || d.name.toLowerCase().includes(term)
      || d.region.toLowerCase().includes(term)
      || d.desc.toLowerCase().includes(term)
      || prettyCategory(d.category).toLowerCase().includes(term);
    const matchesCat = (cat === "all") || d.category === cat;
    return matchesTerm && matchesCat;
  });

  applySort(sortSelect.value, false);
  renderList();
}

function applySort(mode, rerender = true) {
  if (mode === "rating") {
    currentList.sort((a, b) => b.rating - a.rating || b.votes - a.votes);
  } else if (mode === "votes") {
    currentList.sort((a, b) => b.votes - a.votes || b.rating - a.rating);
  } else if (mode === "name") {
    currentList.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    currentList = currentList
      .map(d => ({ d, idx: dishes.findIndex(x => x.id === d.id) }))
      .sort((a, b) => a.idx - b.idx)
      .map(x => x.d);
  }
  if (rerender) renderList();
}

// ------- To Top button -------
const toTop = qs("#toTop");
window.addEventListener("scroll", () => {
  const y = window.scrollY || document.documentElement.scrollTop;
  toTop.style.display = y > 300 ? "block" : "none";
});
toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

// ------- Init -------
(function init() {
  renderList();
})();