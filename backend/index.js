const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const admin = require('firebase-admin');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const tokenRouter = express.Router();

app.use(express.json());
app.use(cors());

const serviceAccount = require('./chat-app-95ba0-firebase-adminsdk-ljugr-60a4dd23b9.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

tokenRouter.get('/auth', async (req, res) => {
  const token = req.query.token;
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    res.status(200).send("Kullanıcı kimliği doğrulandı");
  } catch (error) {
    res.status(401).send("Kullanıcı kimliği doğrulanamadı");
  }
});

app.use('/api', tokenRouter);

app.get('/', (req, res) => {
  res.send('WebSocket server is running');
});

wss.on('connection', (ws) => {
  console.log('Yeni bir istemci bağlandı');
  ws.on('message', (message) => {
    console.log('Gelen mesaj:', message);
    ws.send(`Sunucu mesajı: ${message}`);
  });
  ws.on('close', () => {
    console.log('Bir istemci bağlantısı kapandı');
  });
  ws.on('error', (error) => {
    console.log('WebSocket hatası:', error);
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor`);
});
