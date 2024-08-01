import { NavigationContainer } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import Router from './src/routes/Router';

const App = () => {
  const [message, setMessage] = useState("");
  const [receivedMessage, setReceivedMessage] = useState("");
  const ws = useRef(null);

  useEffect(() => {
    ws.current = new WebSocket("ws://192.168.1.207:3000");

    ws.current.onopen = () => {
      console.log("Bağlantı açıldı");
    };

    ws.current.onmessage = (e) => {
      ı;
      console.log("Alınan mesaj:", e.data);
      setReceivedMessage(e.data);
    };

    ws.current.onerror = (e) => {
      console.log("Hata:", e.message);
    };

    ws.current.onclose = (e) => {
      console.log("Bağlantı kapandı:", e.code, e.reason);
    };

    return () => {
      ws.current.close();
    };
  }, []);

  const sendMessage = () => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(message);
    } else {
      console.log("WebSocket bağlantısı açık değil");
    }
  };
  return (
    <NavigationContainer>
      <Router />
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
});

export default App;
