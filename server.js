const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
app.use(express.json({ limit: "1mb" }));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: "/ws" });

// Prototype only: state is kept in memory and resets when the server restarts.
// Do not use this prototype for real accounts, passwords, or purchases.
let sharedState = null;

app.get("/", (_req, res) => {
  res.type("text").send("Flying Stars multiplayer server is running.");
});

app.get("/health", (_req, res) => {
  res.json({ ok: true, connectedPlayers: wss.clients.size });
});

app.get("/state", (_req, res) => {
  res.json({ state: sharedState });
});

function broadcast(payload, except = null) {
  const message = JSON.stringify(payload);
  for (const client of wss.clients) {
    if (client !== except && client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}

wss.on("connection", (socket) => {
  socket.send(JSON.stringify({ type: "hello", state: sharedState }));

  socket.on("message", (raw) => {
    let message;
    try {
      message = JSON.parse(raw.toString());
    } catch {
      socket.send(JSON.stringify({ type: "error", message: "Invalid JSON" }));
      return;
    }

    // This is a basic sync prototype, not secure authoritative game logic.
    if (message.type === "set_state" && message.state && typeof message.state === "object") {
      sharedState = message.state;
      broadcast({ type: "state", state: sharedState }, socket);
    } else if (message.type === "get_state") {
      socket.send(JSON.stringify({ type: "state", state: sharedState }));
    }
  });
});

const port = process.env.PORT || 3000;
server.listen(port, "0.0.0.0", () => {
  console.log(`Flying Stars server listening on ${port}`);
});
