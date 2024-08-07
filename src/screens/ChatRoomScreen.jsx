import {
  Image,
  Keyboard,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import React, { useEffect, useLayoutEffect, useRef, useState, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import ChatComponent from "../components/ChatComponent";
import { auth, db } from "../../server/firebase";
import { addDoc, collection, onSnapshot, updateDoc } from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";
import { apiConstant } from "../../constants/apiConstant";
import { getMessagesQuery } from "../../server/api";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { debounce } from "lodash";

const ChatRoomScreen = ({ route, navigation }) => {
  const { id, displayName, profileImage } = route.params;
  const scrollViewRef = useRef(null);
  const ws = useRef(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

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

  //STATUS 1 OKUNMADI STATUS 2 OKUNDU
  useEffect(() => {
    const q = getMessagesQuery(auth.currentUser.uid, id);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages = snapshot.docs.map((doc) => ({
        ...doc.data(),
        ref: doc.ref,
      }));

      fetchedMessages.forEach(async (item) => {
        if (item.ReceiverUserId === auth.currentUser.uid) {
          await updateDoc(item.ref, { Status: 2 });
        }
      });

      setMessages(fetchedMessages);
    });

    return () => unsubscribe();
  }, [id]);

  useEffect(() => {
    startWebSocket();

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  const startWebSocket = () => {
    console.log("WebSocket started.");
    ws.current = new WebSocket(`ws://${apiConstant.ip}`);
    ws.current.onmessage = (e) => {
      console.log(`Received: ${e.data}`);
      const msg = JSON.parse(e.data);
      // handleReceive(msg);
    };
    ws.current.onclose = (e) => {
      console.log("Reconnecting: ", e.message);
      setTimeout(startWebSocket, 5000);
    };
    ws.current.onerror = (e) => {
      console.log(`Error: ${e.message}`);
    };
  };

  // const handleReceive = async (receivedMsg) => {
  //   console.log("ReceivedMessage: ", receivedMsg)
  //   await addDoc(collection(db, "Messages"), receivedMsg)
  //     .then(() => {
  //       setMessages((prevMessages) => {
  //         if (
  //           !prevMessages.find(
  //             (msg) =>
  //               msg.SendTime === receivedMsg.SendTime &&
  //               msg.Message === receivedMsg.Message
  //           )
  //         ) {
  //           return [...prevMessages, receivedMsg].sort(
  //             (a, b) => new Date(a.SendTime) - new Date(b.SendTime)
  //           );
  //         }
  //         return prevMessages;
  //       });
  //     })
  //     .catch((error) => {
  //       console.error("Error adding document: ", error);
  //     });
  // };

  const debouncedHandleSend = useCallback(debounce(async () => {
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

      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify(newMessage));
      } else {
        console.log("WebSocket is not open. Cannot send message.");
      }

      setMessage("");
    } catch (error) {
      console.error("Mesaj gönderme hatası: ", error);
    }
  }, 300), [message, id]);

  const handleSend = () => {
    debouncedHandleSend();
  };

  // Debounce handlePickAndSendImage function
  const debouncedHandlePickAndSendImage = useCallback(debounce(async () => {
    try {
      console.log("Requesting image picker...");
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.3,
      });
      console.log("Image picker result:", result);
  
      if (!result.canceled) {
        const imageUri = result.assets[0].uri;
        console.log("Image selected, uploading to Firebase Storage...");
  
        const response = await fetch(imageUri);
        const blob = await response.blob();
        const uniqueName = `uploadImages/${Date.now()}.jpg`;
  
        const storage = getStorage();
        const storageRef = ref(storage, uniqueName);
  
        await uploadBytes(storageRef, blob).then(async (snapshot) => {
          console.log("Image uploaded to Firebase Storage:", snapshot);
  
          const downloadURL = await getDownloadURL(storageRef);
          console.log("Download URL:", downloadURL);
  
          const imgMsg = {
            ReceiverUserId: id,
            SenderUserId: auth.currentUser.uid,
            Message: "",
            ImageUrl: downloadURL,
            SendTime: new Date().toISOString(),
            Status: 1,
          };
  
          console.log("Adding document to Firestore...");
          await addDoc(collection(db, "Messages"), imgMsg).then(() => {
            console.log("Document added to Firestore");
            setMessages((prevMessages) => [...prevMessages, imgMsg]);
          });
        });
      }
    } catch (error) {
      console.error("Error handling image picker:", error);
    }
  }, 300), [id]);

  const handlePickAndSendImage = () => {
    debouncedHandlePickAndSendImage();
  };

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
          className="p-3 ml-2 w-9/12"
          multiline={true}
          value={message}
          onChangeText={setMessage}
        />
        <View className="flex-row">
          <TouchableOpacity onPress={handlePickAndSendImage}>
            <MaterialCommunityIcons
              style={{ marginRight: 10 }}
              name="image"
              size={36}
              color="#6b21a8"
            />
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.8} onPress={handleSend}>
            <MaterialCommunityIcons
              style={{ marginRight: 10 }}
              name="send-circle"
              size={36}
              color="#6b21a8"
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default ChatRoomScreen;
