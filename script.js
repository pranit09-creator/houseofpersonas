const STORAGE_KEY = "characterArchive";

let characters = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

const list = document.getElementById("list");
const empty = document.getElementById("empty");
const search = document.getElementById("search");
const filter = document.getElementById("universe-filter");
const modal = document.getElementById("modal");
const form = document.getElementById("add-form");

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(characters));
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
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
    const haystack = `${c.name} ${c.universe} ${c.description}`.toLowerCase();
    return haystack.includes(term) && (!universe || c.universe === universe);
  });

  list.innerHTML = matches.map(c => `
    <article class="card">
      <h3>${escapeHtml(c.name)}</h3>
      <p class="universe">${escapeHtml(c.universe || "Unassigned")}</p>
      <p>${escapeHtml(c.description || "No description yet.")}</p>
    </article>
  `).join("");

  empty.hidden = matches.length > 0;
}

document.getElementById("open-add").addEventListener("click", () => {
  modal.hidden = false;
  form.name.focus();
});

document.getElementById("cancel").addEventListener("click", () => {
  modal.hidden = true;
  form.reset();
});

form.addEventListener("submit", event => {
  event.preventDefault();
  characters.push({
    name: form.name.value.trim(),
    universe: form.universe.value.trim(),
    description: form.description.value.trim()
  });
  save();
  form.reset();
  modal.hidden = true;
  updateUniverseFilter();
  render();
});

search.addEventListener("input", render);
filter.addEventListener("change", render);

updateUniverseFilter();
render();
