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

// 全角数字マッピング
const zenkaku = ["０", "１", "２", "３", "４", "５", "６", "７", "８", "９"];

// コストトグル管理
const selectedCosts = new Set();
const costButtons = [];

// 検索処理
function performSearch({ keyword = "" }) {
  characterList.innerHTML = "";
  characterList.style.paddingLeft = "0";

  let filtered = characters;

  if (selectedCosts.size > 0) {
    filtered = filtered.filter(c => selectedCosts.has(c.cost));
  }

  if (keyword) {
    filtered = filtered.filter(c => c.name.includes(keyword));
  }

  if (filtered.length === 0) {
    const msg = document.createElement("div");
    msg.textContent = "検索結果がありません";
    msg.style.color = "red";
    msg.style.fontWeight = "bold";
    characterList.appendChild(msg);
    return;
  }

  const table = document.createElement("table");
  table.style.borderCollapse = "collapse";
  table.style.width = "100%";
  table.style.tableLayout = "fixed";

  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  ["名前", "コスト", "組織", "役職", "能力"].forEach(header => {
    const th = document.createElement("th");
    th.textContent = header;
    th.style.border = "1px solid #ccc";
    th.style.padding = "4px";
    th.style.background = "#eee";
    th.style.wordBreak = "break-word";
    th.style.whiteSpace = "normal";
    if (header === "コスト") {
      th.style.width = "60px";
    }
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  filtered.forEach(char => {
    const row = document.createElement("tr");

    const nameTd = document.createElement("td");
    nameTd.style.border = "1px solid #ccc";
    nameTd.style.padding = "4px";
    nameTd.style.wordBreak = "break-word";
    nameTd.style.whiteSpace = "normal";

    const link = document.createElement("a");
    link.textContent = char.name;
    link.href = "#";
    link.style.cursor = "pointer";
    link.addEventListener("click", () => {
      const slot = inputForm.slot.value;
      socket.emit("new-entry", {
        player: playerId,
        slot: slot,
        text: char.name
      });
      dialog.close();
    });
    nameTd.appendChild(link);
    row.appendChild(nameTd);

    ["cost", "organization", "position", "ability"].forEach(key => {
      const td = document.createElement("td");
      td.textContent = char[key];
      td.style.border = "1px solid #ccc";
      td.style.padding = "4px";
      td.style.wordBreak = "break-word";
      td.style.whiteSpace = "normal";
      if (key === "cost") {
        td.style.textAlign = "center";
      }
      row.appendChild(td);
    });

    tbody.appendChild(row);
  });

  table.appendChild(tbody);
  characterList.appendChild(table);
}

// プレイヤー欄作成
players.forEach((player) => {
  const box = document.createElement("div");
  box.className = "player-box";
  box.id = `box-${player}`;
  const title = document.createElement("h3");
  title.textContent = `プレイヤー ${player}`;

  if (player === playerId) {
    const costTotalSpan = document.createElement("span");
    costTotalSpan.className = "cost-total";
    costTotalSpan.textContent = "（コスト合計：0）";
    costTotalSpan.style.fontSize = "14px";
    costTotalSpan.style.marginLeft = "8px";
    title.appendChild(costTotalSpan);
  }

  box.appendChild(title);

  for (let i = 1; i <= 5; i++) {
    const wrapper = document.createElement("div");
    wrapper.style.display = "flex";
    wrapper.style.alignItems = "center";
    wrapper.style.marginBottom = "4px";

    const label = document.createElement("div");
    label.textContent = `${zenkaku[i]}．`;
    label.style.width = "2em";
    label.style.textAlign = "right";
    label.style.marginRight = "4px";

    const entry = document.createElement("div");
    entry.className = "entry unset";
    entry.id = `entry-${player}-${i}`;

    const nameLine = document.createElement("div");
    nameLine.textContent = "未設定";
    nameLine.className = "name-line";
    entry.appendChild(nameLine);

    if (player === playerId) {
      entry.style.display = "flex";
      entry.style.flexDirection = "column";
      entry.style.alignItems = "flex-start";

      const infoLine = document.createElement("div");
      infoLine.style.fontSize = "12px";
      infoLine.style.color = "#555";

      const costSpan = document.createElement("span");
      costSpan.textContent = "コスト：-";
      costSpan.className = "cost-span";

      const roleSpan = document.createElement("span");
      roleSpan.textContent = " / 役職：";

      const roleValue = document.createElement("span");
      roleValue.textContent = "入力する";
      roleValue.style.textDecoration = "underline";
      roleValue.style.cursor = "pointer";
      roleValue.contentEditable = true;

      roleValue.addEventListener("focus", () => {
        const range = document.createRange();
        range.selectNodeContents(roleValue);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      });

      roleValue.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          roleValue.blur();
        }
      });

      roleValue.addEventListener("blur", () => {
        if (roleValue.textContent.trim() === "") {
          roleValue.textContent = "入力する";
        }
      });

      roleSpan.appendChild(roleValue);
      infoLine.appendChild(costSpan);
      infoLine.appendChild(roleSpan);
      entry.appendChild(infoLine);
    }

    wrapper.appendChild(label);
    wrapper.appendChild(entry);
    box.appendChild(wrapper);
  }

  container.appendChild(box);
});

// ラジオボタン生成
for (let i = 1; i <= 5; i++) {
  const label = document.createElement("label");
  label.innerHTML = `<input type="radio" name="slot" value="${i}" ${i === 1 ? "checked" : ""}> ${i}番 `;
  radioButtons.appendChild(label);
}

// 削除ボタン生成
const deleteButton = document.getElementById("deleteButton");
deleteButton.addEventListener("click", () => {
  const slot = inputForm.slot.value;
  if (!slot) return;

  // ソケットで他プレイヤーにも通知
  socket.emit("new-entry", {
    player: playerId,
    slot,
    text: "未設定"
  });

  // 表示をクリア（自分用）
  const target = document.getElementById(`entry-${playerId}-${slot}`);
  if (!target) return;

  const nameLine = target.querySelector(".name-line");
  if (nameLine) nameLine.textContent = "未設定";

  const costEl = target.querySelector(".cost-span");
  if (costEl) costEl.textContent = "コスト：-";

  const roleSpan = target.querySelector('span[contenteditable]');
  if (roleSpan) roleSpan.textContent = "入力する";

  target.classList.remove("set");
  target.classList.add("unset");

  // コスト再計算
  let total = 0;
  for (let i = 1; i <= 5; i++) {
    const entryEl = document.getElementById(`entry-${playerId}-${i}`);
    if (!entryEl) continue;
    const name = entryEl.querySelector(".name-line")?.textContent;
    const c = characters.find((c) => c.name === name);
    if (c) total += c.cost;
  }

  const span = document.querySelector(`#box-${playerId} .cost-total`);
  if (span) {
    span.textContent = `（コスト合計：${total}）`;
  }
});

// ダイアログ開く時：検索欄＆トグル初期化
inputForm.addEventListener("submit", (e) => {
  e.preventDefault();
  searchInput.value = "";
  selectedCosts.clear();
  costButtons.forEach(btn => (btn.style.backgroundColor = ""));
  characterList.innerHTML = "";
  dialog.showModal();
  performSearch({});
});

// バツボタン
const closeBtn = document.createElement("button");
closeBtn.textContent = "×";
closeBtn.style.position = "absolute";
closeBtn.style.top = "6px";
closeBtn.style.right = "10px";
closeBtn.style.fontSize = "24px";
closeBtn.style.fontWeight = "bold";
closeBtn.style.border = "none";
closeBtn.style.background = "transparent";
closeBtn.style.cursor = "pointer";
closeBtn.style.lineHeight = "1";
closeBtn.style.padding = "4px 8px";
closeBtn.addEventListener("click", () => dialog.close());
dialog.appendChild(closeBtn);

// 名前検索
searchInput.addEventListener("input", () => {
  const keyword = searchInput.value.trim();
  performSearch({ keyword });
});

// ▼ 条件ゾーン生成
const conditionZone = document.createElement("div");
conditionZone.style.marginTop = "8px";
conditionZone.style.display = "inline-block";
searchInput.insertAdjacentElement("afterend", conditionZone);

// ▼ コストラベル
const costLabel = document.createElement("span");
costLabel.textContent = "コスト：";
costLabel.style.fontWeight = "bold";
costLabel.style.marginLeft = "12px";
conditionZone.appendChild(costLabel);

// ▼ コストボタン10個
for (let i = 1; i <= 10; i++) {
  const btn = document.createElement("button");
  btn.textContent = i.toString();
  btn.style.marginLeft = "4px";
  btn.type = "button";
  btn.dataset.cost = i;

  btn.addEventListener("click", () => {
    const costNum = Number(btn.dataset.cost);
    if (selectedCosts.has(costNum)) {
      selectedCosts.delete(costNum);
      btn.style.backgroundColor = "";
    } else {
      selectedCosts.add(costNum);
      btn.style.backgroundColor = "#aaf";
    }
    performSearch({ keyword: searchInput.value.trim() });
  });

  costButtons.push(btn);
  conditionZone.appendChild(btn);
}

// ▼ 条件クリアリンク（右端）
const clearLink = document.createElement("a");
clearLink.textContent = "条件クリア";
clearLink.href = "#";
clearLink.style.marginLeft = "12px";
clearLink.style.textDecoration = "underline";
clearLink.style.color = "#00f";
clearLink.style.cursor = "pointer";
clearLink.style.fontSize = "14px";
clearLink.addEventListener("click", (e) => {
  e.preventDefault();
  searchInput.value = "";
  selectedCosts.clear();
  costButtons.forEach(btn => (btn.style.backgroundColor = ""));
  performSearch({});
});
conditionZone.appendChild(clearLink);

// ▼ エントリー反映
socket.on("update-entry", ({ player, slot, text }) => {
  const targetId = `entry-${player}-${slot}`;
  const el = document.getElementById(targetId);
  if (!el) return;

  const nameEl = el.querySelector(".name-line");
  if (nameEl) nameEl.textContent = text;

  // ↓ ここで「未設定」かどうか判定を追加する
  if (text === "未設定") {
    el.classList.remove("set");
    el.classList.add("unset");
  } else {
    el.classList.remove("unset");
    el.classList.add("set");
  }

  // 自分の欄だけコスト反映や合計処理を続ける
  if (player === playerId) {
    const character = characters.find(c => c.name === text);
    const costEl = el.querySelector(".cost-span");
    if (character && costEl) {
      costEl.textContent = `コスト：${character.cost}`;
    } else if (costEl) {
      costEl.textContent = "コスト：-";
    }

    // 合計コスト再計算
    let total = 0;
    for (let i = 1; i <= 5; i++) {
      const entryEl = document.getElementById(`entry-${playerId}-${i}`);
      if (!entryEl) continue;
      const name = entryEl.querySelector(".name-line")?.textContent;
      const c = characters.find(c => c.name === name);
      if (c) total += c.cost;
    }

    const span = document.querySelector(`#box-${playerId} .cost-total`);
    if (span) {
      span.textContent = `（コスト合計：${total}）`;
    }
  } else {
    // 他人の欄も text に応じて表示
    if (text === "未設定") {
      if (nameEl) nameEl.textContent = "未設定";
    } else {
      if (nameEl) nameEl.textContent = "設定済み";
    }
  }
});

// ドラフトボタン処理
const draftButton = document.getElementById("draftButton");
draftButton.addEventListener("click", () => {
  const confirmDialog = document.createElement("dialog");
  confirmDialog.innerHTML = `
    <p style="margin-bottom: 20px;">
      ドラフトを開始します。各プレイヤーの選出が完了していることを確認し、<br>
      よろしければ「開始」を押してください。
    </p>
    <div style="text-align: right;">
      <button id="startDraftBtn">開始</button>
      <button id="cancelDraftBtn">戻る</button>
    </div>
  `;
  document.body.appendChild(confirmDialog);
  confirmDialog.showModal();

  document.getElementById("startDraftBtn").addEventListener("click", () => {
    confirmDialog.close();
    document.body.removeChild(confirmDialog);
    socket.emit("draft-started");
  });

  document.getElementById("cancelDraftBtn").addEventListener("click", () => {
    confirmDialog.close();
    document.body.removeChild(confirmDialog);
  });
});

socket.on("draft-started", () => {
  if (document.hasFocus()) return; // 押した本人には出さない（任意）
  alert("ドラフトが実行されました。");
});

// 確認用
const showBtn = document.getElementById("showSessionDataBtn");

showBtn.addEventListener("click", async () => {
  try {
    const response = await fetch("/sessionData.js");
    const text = await response.text();

    // モジュール形式ではなく単なるJSとして取得されるのでeval回避のため加工
    const jsonText = text.replace("module.exports =", "").trim().replace(/;$/, "");
    const data = JSON.parse(jsonText);
    console.log("▼ sessionData.js の中身");
    console.log(data);
  } catch (error) {
    console.error("sessionData.js の取得に失敗:", error);
  }
});

const resetBtn = document.getElementById("resetSessionDataBtn");

resetBtn.addEventListener("click", async () => {
  if (!confirm("sessionData.js を本当に初期化しますか？")) return;
  try {
    const res = await fetch("/reset-session", { method: "POST" });
    if (res.ok) {
      console.log("✅ sessionData.js を初期化しました");
      location.reload(); // ページをリロードして反映（任意）
    } else {
      console.error("❌ 初期化失敗:", await res.text());
    }
  } catch (err) {
    console.error("❌ 通信エラー:", err);
  }
});

socket.on("draft-started", async () => {
  try {
    const res = await fetch("/get-session");
    const session = await res.json();

    Object.entries(session).forEach(([key, { name }]) => {
      const el = document.getElementById(`entry-${key}`);
      if (!el) return;
      const nameLine = el.querySelector(".name-line");
      if (nameLine) nameLine.textContent = name || "未設定";
      if (name && name !== "未設定") {
        el.classList.remove("unset");
        el.classList.add("set");
      } else {
        el.classList.remove("set");
        el.classList.add("unset");
      }
    });
  } catch (err) {
    console.error("セッションデータの取得に失敗：", err);
  }
});
