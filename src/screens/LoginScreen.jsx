import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import TextInputComponent from "../components/TextInputComponent";

const LoginScreen = () => {
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
    <SafeAreaView className="flex-1 bg-white">
      <View className="justify-center items-center">
        <Image
          source={require("../../assets/login.png")}
          className="w-48 h-48 mt-10"
        />
      </View>
      <View className="my-3 items-center">
        <Text className="text-2xl font-medium">Giriş Yap</Text>
      </View>
      <View className="items-center">
        <TextInputComponent placeholder="E-Posta" iconName="mail" />
        <TextInputComponent placeholder="Parola" iconName="lock" />
      </View>
      <TouchableOpacity className="w-11/12 my-2 items-end" activeOpacity={0.8}>
        <Text className="text-gray-700">Şifreni mi unuttun?</Text>
      </TouchableOpacity>
      <View className="items-center justify-center my-2 ">
        <TouchableOpacity
          className="p-3 bg-violet-600 rounded-md w-11/12 items-center"
          activeOpacity={0.9}
        >
          <Text className="font-medium text-white text-lg">Giriş Yap</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row items-center justify-center gap-1.5 my-1">
        <Text className="text-gray-700">Hesabın mı yok?</Text>
        <Text className="text-violet-800 font-medium">Kaydol!</Text>
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;
