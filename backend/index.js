const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const tokenRouter = require('./routes/token');
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.json());
app.use(cors());

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
