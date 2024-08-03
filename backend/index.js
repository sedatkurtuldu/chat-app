const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const cors = require("cors");
const admin = require("firebase-admin");

const app = express();
const server = http.createServer(app);
const tokenRouter = express.Router();

app.use(express.json());
app.use(cors());

const serviceAccount = require("./chat-app-95ba0-firebase-adminsdk-ljugr-60a4dd23b9.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// tokenRouter.get('/auth', async (req, res) => {
//   const token = req.query.token;
//   try {
//     const decodedToken = await admin.auth().verifyIdToken(token);
//     res.status(200).send("Kullanıcı kimliği doğrulandı");
//   } catch (error) {
//     res.status(401).send("Kullanıcı kimliği doğrulanamadı");
//   }
// });

tokenRouter.post("/auth", async (req, res) => {
  const token = req.body.token;
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    res.status(200).send("Kullanıcı kimliği doğrulandı");
  } catch (error) {
    res.status(401).send("Kullanıcı kimliği doğrulanamadı");
  }
});

app.use("/api", tokenRouter);

const wss = new WebSocket.Server({ server: server }, () => {
  console.log("Server started...");
});
const delay = 1000;
let clients = {};

wss.on("connection", (ws, req) => {
  const client = req.headers["sec-websocket-key"];
  clients[client] = ws;
  send("Uygulamaya Hoşgeldiniz", client);
  ws.on("message", (msg) => receive(msg, client));
  ws.on("close", (code, reason) =>
    console.log("Closed: ", client, code, reason)
  );
});

const send = (msg, client) => {
  const socket = clients[client];
  if (socket) {
    socket.send(msg, (error) => {
      if (error) {
        delete clients[client];
      } else {
        console.log(`Sent: ${msg}, to ${client}`);
      }
    });
  }
};

const receive = (msg, sender) => {
  console.log(`Received: ${msg}, from ${sender}`);
  setTimeout(() => broadcast(msg, sender), delay);
};

const broadcast = (msg, sender) => {
  Object.keys(clients).forEach((client) => {
    if (client !== sender) {
      send(msg, client);
    }
  });
};

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
