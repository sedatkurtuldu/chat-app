import {
  Image,
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import ChatComponent from "../components/ChatComponent";
import { auth, db } from "../../server/firebase";
import {
  addDoc,
  collection,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";

const ChatRoomScreen = ({ route, navigation }) => {
  const { id, displayName, profileImage } = route.params;
  const scrollViewRef = useRef(null);
  const ws = useRef(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    startWebSocket();

    const messagesRef = collection(db, "Messages");
    const q = query(messagesRef, orderBy("SendTime"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages = snapshot.docs.map((doc) => doc.data());
      setMessages(fetchedMessages);
    });

    return () => {
      ws.current?.close();
      unsubscribe();
    };
  }, []);

  const startWebSocket = () => {
    console.log("WebSocket started.");
    ws.current = new WebSocket(`ws://yourdomain:8080`);
    ws.current.onmessage = (e) => {
      console.log(`Received: ${e.data}`);
      const msg = JSON.parse(e.data);
      handleReceive(msg);
    };
    ws.current.onclose = (e) => {
      console.log("Reconnecting: ", e.message);
      setTimeout(startWebSocket, 5000);
    };
    ws.current.onerror = (e) => {
      console.log(`Error: ${e.message}`);
    };
  };

  const handleReceive = (receivedMsg) => {
    addDoc(collection(db, "Messages"), receivedMsg)
      .then(() => {
        setMessages((prevMessages) => {
          if (
            !prevMessages.find(
              (msg) =>
                msg.SendTime === receivedMsg.SendTime &&
                msg.Message === receivedMsg.Message
            )
          ) {
            return [...prevMessages, receivedMsg].sort(
              (a, b) => new Date(a.SendTime) - new Date(b.SendTime)
            );
          }
          return prevMessages;
        });
      })
      .catch((error) => {
        console.error("Error adding document: ", error);
      });
  };

  const handleSend = async () => {
    if (message.trim() === "") return;

    const currentUser = auth.currentUser.uid;
    const newMessage = {
      ReceiverUserId: id,
      SenderUserId: currentUser,
      Message: message,
      SendTime: new Date().toISOString(),
      Status: 1,
    };

    try {
      await addDoc(collection(db, "Messages"), newMessage);
      ws.current.send(JSON.stringify(newMessage));
      setMessage("");
    } catch (error) {
      console.error("Mesaj gönderme hatası: ", error);
    }
  };

  const handlePickAndSendImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const imgMsg = {
        ReceiverUserId: id,
        SenderUserId: auth.currentUser.uid,
        ImageUri: result.uri,
        SendTime: new Date().toISOString(),
        Status: 1,
      };

      try {
        await addDoc(collection(db, "Messages"), imgMsg);
        ws.current.send(JSON.stringify(imgMsg));
        setMessages((prevMessages) =>
          [...prevMessages, imgMsg].sort(
            (a, b) => new Date(a.SendTime) - new Date(b.SendTime)
          )
        );
      } catch (error) {
        console.error("Resim gönderme hatası: ", error);
      }
    }
  };

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }
    );

    return () => {
      keyboardDidShowListener.remove();
    };
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: displayName,
      headerLeft: () => (
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mr-4"
          >
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Image
            style={{ height: 38, width: 38, borderRadius: 19, marginRight: 12 }}
            source={{ uri: profileImage }}
          />
        </View>
      ),
    });
  }, [navigation, displayName, profileImage]);

  return (
    <View className="flex-1">
      <ScrollView
        className="flex-1"
        ref={scrollViewRef}
        contentContainerStyle={{
          paddingBottom: Platform.OS === "ios" ? 60 : 80,
        }}
      >
        {messages.map((item, index) => (
          <ChatComponent
            key={index}
            item={item}
            currentUser={auth.currentUser.uid}
          />
        ))}
      </ScrollView>
      <View className="bg-white absolute bottom-0 left-0 right-0 border border-gray-300 rounded-full flex-row justify-between items-center m-3">
        <TextInput
          placeholder="Mesaj Yaz"
          className="p-3 ml-2 w-10/12"
          multiline={true}
          value={message}
          onChangeText={setMessage}
        />
        <TouchableOpacity activeOpacity={0.8} onPress={handleSend}>
          <MaterialCommunityIcons
            style={{ marginRight: 10 }}
            name="send-circle"
            size={36}
            color="#6b21a8"
          />
        </TouchableOpacity>
        {/* <TouchableOpacity onPress={handlePickAndSendImage}>
          <MaterialCommunityIcons
            style={{ marginRight: 10 }}
            name="image"
            size={36}
            color="#6b21a8"
          />
        </TouchableOpacity> */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({});

export default ChatRoomScreen;
