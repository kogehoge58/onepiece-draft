import { characters } from "./characters.js";
const socket = io();
const playerId = prompt("プレイヤー名を入力してください (例: A, B, C)").toUpperCase();

const players = ['A', 'B', 'C'];
const container = document.getElementById("players-container");
const radioButtons = document.getElementById("radioButtons");
const inputForm = document.getElementById("inputForm");
const dialog = document.getElementById("characterDialog");
const searchInput = document.getElementById("searchInput");
const characterList = document.getElementById("characterList");

// 全角数字（0〜9）マッピング
const zenkaku = ["０", "１", "２", "３", "４", "５", "６", "７", "８", "９"];

players.forEach((player) => {
  const box = document.createElement("div");
  box.className = "player-box";
  box.id = `box-${player}`;
  const title = document.createElement("h3");
  title.textContent = `プレイヤー ${player}`;
  box.appendChild(title);

  for (let i = 1; i <= 5; i++) {
    const wrapper = document.createElement("div");
    wrapper.style.display = "flex";
    wrapper.style.alignItems = "center";
    wrapper.style.marginBottom = "4px";

    const label = document.createElement("div");
    label.textContent = `${zenkaku[i]}．`; // 全角数字＋ドット
    label.style.width = "2em";
    label.style.textAlign = "right";
    label.style.marginRight = "4px";

    const entry = document.createElement("div");
    entry.className = "entry unset";
    entry.id = `entry-${player}-${i}`;
    entry.textContent = `未設定`;

    wrapper.appendChild(label);
    wrapper.appendChild(entry);
    box.appendChild(wrapper);
  }

  container.appendChild(box);
});

for (let i = 1; i <= 5; i++) {
  const label = document.createElement("label");
  label.innerHTML = `<input type="radio" name="slot" value="${i}" ${i === 1 ? "checked" : ""}> ${i}番 `;
  radioButtons.appendChild(label);
}

inputForm.addEventListener("submit", (e) => {
  e.preventDefault();
  searchInput.value = "";
  characterList.innerHTML = "";
  dialog.showModal();
});

searchInput.addEventListener("input", () => {
  const keyword = searchInput.value.trim();
  characterList.innerHTML = "";

  const filtered = characters.filter(c => c.name.includes(keyword));
  filtered.forEach(char => {
    const li = document.createElement("li");
    li.textContent = char.name;
    li.style.cursor = "pointer";
    li.addEventListener("click", () => {
      const slot = inputForm.slot.value;
      socket.emit("new-entry", {
        player: playerId,
        slot: slot,
        text: char.name
      });
      dialog.close();
    });
    characterList.appendChild(li);
  });
});

socket.on("update-entry", ({ player, slot, text }) => {
  const targetId = `entry-${player}-${slot}`;
  const el = document.getElementById(targetId);
  if (!el) return;

  el.classList.remove("unset");
  el.classList.add("set");

  el.textContent = (player === playerId) ? `${text}` : `設定済み`;
});
