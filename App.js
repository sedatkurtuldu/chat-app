import React, { useEffect, useState, useRef } from 'react';
import { SafeAreaView, Text, StyleSheet, TextInput, Button, View } from 'react-native';

const App = () => {
  const [message, setMessage] = useState("");
  const [receivedMessage, setReceivedMessage] = useState("");
  const ws = useRef(null);

  useEffect(() => {
    ws.current = new WebSocket('ws://192.168.0.113:3000');

    ws.current.onopen = () => {
      console.log('Bağlantı açıldı');
    };

    ws.current.onmessage = e => {ı
      console.log('Alınan mesaj:', e.data);
      setReceivedMessage(e.data);
    };

    ws.current.onerror = e => {
      console.log('Hata:', e.message);
    };

    ws.current.onclose = e => {
      console.log('Bağlantı kapandı:', e.code, e.reason);
    };

    return () => {
      ws.current.close();
    };
  }, []);

  const sendMessage = () => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(message);
    } else {
      console.log('WebSocket bağlantısı açık değil');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.text}>WebSocket Bağlantısı</Text>
      <TextInput
        style={styles.input}
        onChangeText={setMessage}
        value={message}
        placeholder="Mesajınızı yazın"
      />
      <Button title="Mesaj Gönder" onPress={sendMessage} />
      <View style={styles.messageContainer}>
        <Text style={styles.receivedText}>Alınan mesaj:</Text>
        <Text style={styles.receivedMessage}>{receivedMessage}</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  text: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    width: '80%',
    paddingHorizontal: 10,
    marginVertical: 20,
  },
  messageContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  receivedText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  receivedMessage: {
    fontSize: 16,
    marginTop: 10,
  },
});

export default App;
