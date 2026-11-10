const STORAGE_KEY = "characterArchive";

// Every field a character can have
const FIELDS = [
  { key: "name", label: "Character name", required: true },
  { key: "universe", label: "Universe", required: true },
  { key: "role", label: "Role / title" },
  { key: "age", label: "Age" },
  { key: "height", label: "Height" },
  { key: "weight", label: "Weight" },
  { key: "eyeColour", label: "Eye colour" },
  { key: "hairColour", label: "Hair colour" },
  { key: "tagline", label: "Tagline", wide: true },
  { key: "personality", label: "Personality", wide: true, area: true },
  { key: "abilities", label: "Abilities", wide: true, area: true },
  { key: "backstory", label: "Backstory", wide: true, area: true },
  { key: "likes", label: "Likes", wide: true, area: true },
  { key: "dislikes", label: "Dislikes", wide: true, area: true },
  { key: "relationships", label: "Relationships", wide: true, area: true },
  { key: "funFacts", label: "Fun facts", wide: true, area: true },
  { key: "clothes", label: "Favourite clothes", wide: true, area: true },
  { key: "voice", label: "Voice", wide: true, area: true },
  { key: "talents", label: "Miscellaneous talents", wide: true, area: true },
  { key: "weapons", label: "Weapons", wide: true, area: true }
];

// Shown in the stat row at the top of the detail pop-up
const STATS = [
  { key: "age", label: "Age" },
  { key: "height", label: "Height" },
  { key: "weight", label: "Weight" },
  { key: "eyeColour", label: "Eyes" },
  { key: "hairColour", label: "Hair" }
];

// Shown in the two-column grid, excluding the header and stat fields
const SECTION_KEYS = new Set([
  "personality", "abilities", "backstory", "likes", "dislikes",
  "relationships", "funFacts", "clothes", "voice", "talents", "weapons"
]);

// Load saved characters, giving any old entry without an ID a new one
let characters = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")
  .map((c, i) => (c.id ? c : { ...c, id: Date.now() + i }));
localStorage.setItem(STORAGE_KEY, JSON.stringify(characters));

let editingId = null;
let viewingId = null;

const list = document.getElementById("list");
const empty = document.getElementById("empty");
const search = document.getElementById("search");
const filter = document.getElementById("universe-filter");
const formModal = document.getElementById("form-modal");
const form = document.getElementById("add-form");
const formFields = document.getElementById("form-fields");
const formTitle = document.getElementById("form-title");
const detailModal = document.getElementById("detail-modal");
const detailTitle = document.getElementById("detail-title");
const detailUniverse = document.getElementById("detail-universe");
const detailTagline = document.getElementById("detail-tagline");
const detailBody = document.getElementById("detail-body");

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(characters));
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text || "";
  return div.innerHTML;
}

function buildForm() {
  formFields.innerHTML = FIELDS.map(f => {
    const label = f.required ? `${f.label} *` : f.label;
    const input = f.area
      ? `<textarea name="${f.key}" rows="3"></textarea>`
      : `<input name="${f.key}"${f.required ? " required" : ""}>`;
    return `<label class="${f.wide ? "wide" : ""}">${label}${input}</label>`;
  }).join("");
}

function updateUniverseFilter() {
  const current = filter.value;
  const universes = [...new Set(characters.map(c => c.universe).filter(Boolean))].sort();
  filter.innerHTML = '<option value="">All universes</option>' +
    universes.map(u => `<option value="${escapeHtml(u)}">${escapeHtml(u)}</option>`).join("");
  filter.value = universes.includes(current) ? current : "";
}

function render() {
  const term = search.value.toLowerCase();
  const universe = filter.value;

  const matches = characters.filter(c => {
    const text = FIELDS.map(f => c[f.key] || "").join(" ").toLowerCase();
    return text.includes(term) && (!universe || c.universe === universe);
  });

  list.innerHTML = matches.map(c => `
    <article class="card" data-id="${c.id}">
      <h3>${escapeHtml(c.name)}</h3>
      <span class="universe">${escapeHtml(c.universe || "Unassigned")}</span>
      <p>${escapeHtml(c.tagline || "No tagline yet.")}</p>
    </article>
  `).join("");

  empty.hidden = matches.length > 0;
}

function openForm(character = null) {
  editingId = character ? character.id : null;
  formTitle.textContent = character ? "Edit character" : "New character";
  form.reset();
  FIELDS.forEach(f => {
    form.elements[f.key].value = character ? (character[f.key] || "") : "";
  });
  formModal.hidden = false;
  form.elements["name"].focus();
}

function closeForm() {
  formModal.hidden = true;
  editingId = null;
}

function openDetail(id) {
  const c = characters.find(x => x.id === id);
  if (!c) return;
  viewingId = id;

  detailUniverse.textContent = c.universe || "Unassigned";
  detailTitle.textContent = c.name;
  detailTagline.textContent = c.tagline || "";
  detailTagline.hidden = !c.tagline;

  const stats = STATS.map(s => `
    <div class="stat">
      <span class="stat-label">${s.label}</span>
      <span class="stat-value">${escapeHtml(c[s.key]) || "—"}</span>
    </div>
  `).join("");

  const sections = FIELDS.filter(f => SECTION_KEYS.has(f.key)).map(f => {
    const value = c[f.key];
    return `
      <div>
        <span class="section-label">${f.label}</span>
        <p class="section-value ${value ? "" : "empty-value"}">${value ? escapeHtml(value) : "No record entered."}</p>
      </div>
    `;
  }).join("");

  detailBody.innerHTML = `
    <div class="stats">${stats}</div>
    <div class="sections">${sections}</div>
  `;

  detailModal.hidden = false;
}

function closeDetail() {
  detailModal.hidden = true;
  viewingId = null;
}

// Add button
document.getElementById("open-add").addEventListener("click", () => openForm());

// Click a card to open its details
list.addEventListener("click", event => {
  const card = event.target.closest(".card");
  if (card) openDetail(Number(card.dataset.id));
});

// Detail pop-up buttons
document.getElementById("close-detail").addEventListener("click", closeDetail);

document.getElementById("edit-btn").addEventListener("click", () => {
  const c = characters.find(x => x.id === viewingId);
  closeDetail();
  if (c) openForm(c);
});

document.getElementById("delete-btn").addEventListener("click", () => {
  const c = characters.find(x => x.id === viewingId);
  if (!c || !confirm(`Delete ${c.name}? This can't be undone.`)) return;
  characters = characters.filter(x => x.id !== c.id);
  save();
  closeDetail();
  updateUniverseFilter();
  render();
});

// Add / edit form
document.getElementById("cancel").addEventListener("click", closeForm);

form.addEventListener("submit", event => {
  event.preventDefault();

  const data = {};
  FIELDS.forEach(f => {
    data[f.key] = form.elements[f.key].value.trim();
  });

  const savedId = editingId;
  if (savedId !== null) {
    const index = characters.findIndex(c => c.id === savedId);
    characters[index] = { id: savedId, ...data };
  } else {
    characters.push({ id: Date.now(), ...data });
  }

  save();
  closeForm();
  updateUniverseFilter();
  render();
  if (savedId !== null) openDetail(savedId);
});

// Click outside a pop-up, or press Escape, to close it
detailModal.addEventListener("click", event => {
  if (event.target === detailModal) closeDetail();
});

formModal.addEventListener("click", event => {
  if (event.target === formModal) closeForm();
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeDetail();
    closeForm();
  }
});

search.addEventListener("input", render);
filter.addEventListener("change", render);

buildForm();
updateUniverseFilter();
render();
