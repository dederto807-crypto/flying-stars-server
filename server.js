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

let sharedState = null;

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
  res.json({
    state: sharedState
  });
});

wss.on("connection", (socket) => {
  socket.send(JSON.stringify({
    type: "state",
    state: sharedState
  }));

  socket.on("message", (raw) => {
    let message;

    try {
      message = JSON.parse(raw.toString());
    } catch (error) {
      socket.send(JSON.stringify({
        type: "error",
        message: "Invalid JSON"
