const SITE = "https://www.whatnewstoday.com";
const API = `${SITE}/api/today`;

const listEl = document.getElementById("list");
const updatedEl = document.getElementById("updated");

function render(data) {
  updatedEl.textContent = data.updated_at
    ? `${data.updated_at} 기준`
    : data.date ?? "";

  const keywords = data.keywords ?? [];
  if (keywords.length === 0) {
    listEl.innerHTML = '<li class="state">표시할 이슈가 없어요</li>';
    return;
  }

  listEl.innerHTML = "";
  for (const k of keywords) {
    const a = document.createElement("a");
    a.className = "item" + (k.rank === 1 ? " top" : "");
    a.href = `${SITE}/keyword/${encodeURIComponent(k.word)}`;
    a.target = "_blank";
    a.rel = "noopener";

    const rank = document.createElement("span");
    rank.className = "rank";
    rank.textContent = String(k.rank);

    const body = document.createElement("div");
    body.className = "body";
    const word = document.createElement("div");
    word.className = "word";
    word.textContent = k.word;
    body.appendChild(word);
    if (k.description) {
      const desc = document.createElement("div");
      desc.className = "desc";
      desc.textContent = k.description;
      body.appendChild(desc);
    }

    a.appendChild(rank);
    a.appendChild(body);
    listEl.appendChild(a);
  }
}

async function load() {
  try {
    const res = await fetch(API, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    render(await res.json());
  } catch {
    listEl.innerHTML =
      '<li class="state">불러오지 못했어요. 잠시 후 다시 시도해주세요.</li>';
  }
}

load();
