const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const fs = require("fs");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const sessionDataPath = path.join(__dirname, "public/sessionData.js");
let sessionData = {};

// 起動時にファイルから読み込む
if (fs.existsSync(sessionDataPath)) {
  const code = fs.readFileSync(sessionDataPath, "utf8");
  const match = code.match(/module\.exports\s*=\s*(\{[\s\S]*\});/);
  if (match) {
    sessionData = eval("(" + match[1] + ")");
  }
}

app.use(express.static("public"));

io.on("connection", (socket) => {
  socket.on("new-entry", (data) => {
    const { player, slot, name, cost, role } = data;
    const key = `${player}-${slot}`;
    if (sessionData[key]) {
      sessionData[key].name = name;
      sessionData[key].cost = cost ?? null;
      if (role !== undefined) {
        sessionData[key].role = role;
      }
    }

    io.emit("update-entry", data);

    const fileContent = "module.exports = " + JSON.stringify(sessionData, null, 2) + ";\n";
    fs.writeFileSync(sessionDataPath, fileContent, "utf8");
  });

  socket.on("draft-started", () => {
    io.emit("draft-started");
  });
});

app.post("/reset-session", (req, res) => {
  const players = ["A", "B", "C"];
  const empty = {};
  for (const p of players) {
    for (let i = 1; i <= 5; i++) {
      empty[`${p}-${i}`] = { name: "", cost: null, role: "" };
    }
  }

  sessionData = empty; // ← メモリ上でも初期化

  const content = "module.exports = " + JSON.stringify(empty, null, 2) + ";\n";
  fs.writeFileSync(sessionDataPath, content, "utf8");
  res.sendStatus(200);
});

app.get("/get-session", (req, res) => {
  res.json(sessionData);
});

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
