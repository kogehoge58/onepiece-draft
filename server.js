const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const sessionData = require("./public/sessionData");

app.use(express.static("public"));

io.on("connection", (socket) => {

  socket.on("new-entry", (data) => {
    const { player, slot, text } = data;
    const key = `${player}-${slot}`;
    if (sessionData[key]) {
      // name を更新（cost, role は未更新のまま）
      sessionData[key].name = text;
    }
    io.emit("update-entry", data);

    // sessionData.js を上書き保存
    const fs = require("fs");
    const path = require("path");
    const filePath = path.join(__dirname, "public/sessionData.js");
    const fileContent = "module.exports = " + JSON.stringify(sessionData, null, 2) + ";\n";
    fs.writeFileSync(filePath, fileContent, "utf8");
  });

  socket.on("draft-started", () => {
    io.emit("draft-started");
  });
});

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});

const fs = require("fs");
const path = require("path");
const sessionDataPath = path.join(__dirname, "public/sessionData.js");

app.post("/reset-session", (req, res) => {
  const players = ["A", "B", "C"];
  const empty = {};
  for (const p of players) {
    for (let i = 1; i <= 5; i++) {
      empty[`${p}-${i}`] = { name: "", cost: null, role: "" };
    }
  }
  const content = "module.exports = " + JSON.stringify(empty, null, 2) + ";\n";
  fs.writeFileSync(sessionDataPath, content, "utf8");
  res.sendStatus(200);
});

app.get("/get-session", (req, res) => {
  const data = require("./public/sessionData");
  res.json(data);
});
