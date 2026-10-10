const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
app.use(express.json({ limit: "1mb" }));

const server = http.createServer(app);

const wss = new WebSocket.Server({
  server,
  path: "/ws"
});

let sharedState = {
  products: [],
  orders: [],
  updatedAt: Date.now()
};

app.get("/", (req, res) => {
  res.send("Flying Stars multiplayer server is running!");
});

app.get("/health", (req, res) => {
  res.json({
    ok: true,
    connectedPlayers: wss.clients.size
  });
});

app.get("/state", (req, res) => {
  res.json({ state: sharedState });
});

function broadcast(data) {
  const message = JSON.stringify(data);

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

wss.on("connection", (socket) => {
  socket.send(JSON.stringify({
    type: "state",
    state: sharedState
  }));

  socket.on("message", (raw) => {
    try {
      const message = JSON.parse(raw.toString());

      // Принимаем только разрешённые типы сообщений.
      if (message.type === "ping") {
        socket 
