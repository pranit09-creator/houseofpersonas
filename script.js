const STORAGE_KEY = "characterArchive";

const FIELDS = [
  { key: "name", label: "Name", required: true },
  { key: "universe", label: "Universe / world" },
  { key: "tagline", label: "Tagline" },
  { key: "titles", label: "Titles", multiline: true },
  { key: "age", label: "Age" },
  { key: "height", label: "Height" },
  { key: "weight", label: "Weight" },
  { key: "hairColour", label: "Hair colour" },
  { key: "eyeColour", label: "Eye colour" },
  { key: "voice", label: "Voice", multiline: true },
  { key: "hobbies", label: "Hobbies", multiline: true },
  { key: "abilities", label: "Abilities", multiline: true },
  { key: "weaknesses", label: "Weaknesses", multiline: true },
  { key: "relationships", label: "Relationships", multiline: true }
];

let characters = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
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
    const input = f.multiline
      ? `<textarea name="${f.key}" rows="2"></textarea>`
      : `<input name="${f.key}"${f.required ? " required" : ""}>`;
    return `<label>${f.label}${input}</label>`;
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
      <p class="universe">${escapeHtml(c.universe || "Unassigned")}</p>
      <p>${escapeHtml(c.tagline || "No tagline yet.")}</p>
    </article>
  `).join("");

  empty.hidden = matches.length > 0;
}

function openForm(character = null) {
  editingId = character ? character.id : null;
  formTitle.textContent = character ? "Edit dossier" : "New dossier";
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
  detailTitle.textContent = c.name;
  detailBody.innerHTML = FIELDS.filter(f => f.key !== "name").map(f => `
    <div class="detail-row">
      <span class="detail-label">${f.label}</span>
      <p>${escapeHtml(c[f.key]) || "—"}</p>
    </div>
  `).join("");
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
