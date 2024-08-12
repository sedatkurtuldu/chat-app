const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

const tokenRouter = require("./routes/token");
const messagesRouter = require("./routes/messages");

app.use(express.json());
app.use(cors());

app.use("/api", tokenRouter);
app.use("/api", messagesRouter);

const wss = new WebSocket.Server({ server: server }, () => {
  console.log("WebSocket server started...");
});

let clients = {};

wss.on("connection", (ws, req) => {
  const clientId = req.headers["sec-websocket-key"];
  clients[clientId] = ws;

  ws.on("message", (msg) => handleMessage(msg, clientId));

  ws.on("close", (code, reason) => {
    console.log("Connection closed: ", clientId, code, reason);
    delete clients[clientId];
  });

  ws.on("error", (error) => {
    console.error("WebSocket error: ", error);
  });
});

const handleMessage = (msg, clientId) => {
  console.log(`Received message: ${msg}, from client ${clientId}`);
  setTimeout(() => broadcast(msg, clientId), 1000);
};

const broadcast = (msg, senderId) => {
  Object.keys(clients).forEach((clientId) => {
    if (clientId !== senderId) {
      sendMessage(msg, clientId);
    }
  });
};

const sendMessage = (msg, clientId) => {
  const clientSocket = clients[clientId];
  if (clientSocket) {
    try {
      const message = typeof msg === 'string' ? msg : JSON.stringify(msg);
      clientSocket.send(message, (error) => {
        if (error) {
          console.error(`Failed to send message to client ${clientId}: ${error}`);
          delete clients[clientId];
        } else {
          console.log(`Sent message to client ${clientId}: ${message}`);
        }
      });
    } catch (error) {
      console.error("Error sending message: ", error);
    }
  }
};

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
