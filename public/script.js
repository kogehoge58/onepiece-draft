const socket = io();
const playerId = prompt("プレイヤー名を入力してください (例: A, B, C)").toUpperCase();

const players = ['A', 'B', 'C'];
const container = document.getElementById("players-container");
const radioButtons = document.getElementById("radioButtons");
const inputForm = document.getElementById("inputForm");
const inputText = document.getElementById("inputText");

players.forEach((player) => {
  const box = document.createElement("div");
  box.className = "player-box";
  box.id = `box-${player}`;
  const title = document.createElement("h3");
  title.textContent = `プレイヤー ${player}`;
  box.appendChild(title);

  for (let i = 1; i <= 5; i++) {
    const entry = document.createElement("div");
    entry.className = "entry unset";
    entry.id = `entry-${player}-${i}`;
    entry.textContent = `[${i}] 未設定`;
    box.appendChild(entry);
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
  const slot = inputForm.slot.value;
  const text = inputText.value.trim();
  if (!text) return;
  socket.emit("new-entry", { player: playerId, slot, text });
  inputText.value = "";
});

socket.on("update-entry", ({ player, slot, text }) => {
  const targetId = `entry-${player}-${slot}`;
  const el = document.getElementById(targetId);
  if (!el) return;

  el.classList.remove("unset");
  el.classList.add("set");

  if (player === playerId) {
    el.textContent = `[${slot}] ${text}`;
  } else {
    el.textContent = `[${slot}] 設定済み`;
  }
});

