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
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import ChatComponent from "../components/ChatComponent";
import { auth, db } from "../../server/firebase";
import { addDoc, collection, onSnapshot, updateDoc } from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";
import { apiConstant } from "../../constants/apiConstant";
import { getMessagesQuery } from "../../server/api";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const ChatRoomScreen = ({ route, navigation }) => {
  const { id, displayName, profileImage } = route.params;
  const scrollViewRef = useRef(null);
  const ws = useRef(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [image, setImage] = useState(null);

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

  const handleReceive = async (receivedMsg) => {
    await addDoc(collection(db, "Messages"), receivedMsg)
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

      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify(newMessage));
      } else {
        console.log("WebSocket is not open. Cannot send message.");
      }

      setMessage("");
    } catch (error) {
      console.error("Mesaj gönderme hatası: ", error);
    }
  };

  const askForPermissions = async () => {
    const { status: cameraStatus } =
      await ImagePicker.requestCameraPermissionsAsync();
    const { status: galleryStatus } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus !== "granted" || galleryStatus !== "granted") {
      Alert.alert(
        "İzin Gerekli",
        "Üzgünüz, bu işlemi gerçekleştirebilmek için kamera ve galeri izinlerine ihtiyacımız var!"
      );
    }
  };

  const pickImage = async () => {
    await askForPermissions();
  
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
  
    if (!result.canceled && result.assets && result.assets.length > 0) {
      return result.assets[0].uri;
    }
    return null;
  };
  
  const uploadImage = async (uri) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const fileName = `${Date.now()}.jpg`;
      const storage = getStorage();
      const storageRef = ref(storage, `uploadImages/${fileName}`);
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };
  
  const handlePickAndSendImage = async () => {
    const uri = await pickImage();
    if (uri) {
      setImage(uri);
      try {
        const downloadURL = await uploadImage(uri);
        const imgMsg = {
          ReceiverUserId: id,
          SenderUserId: auth.currentUser.uid,
          ImageUrl: downloadURL,
          SendTime: new Date().toISOString(),
          Status: 1,
        };
  
        await addDoc(collection(db, "Messages"), imgMsg);
  
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
          ws.current.send(JSON.stringify(imgMsg));
        } else {
          console.log("WebSocket is not open. Cannot send image.");
        }
  
        setMessages((prevMessages) => [...prevMessages, imgMsg].sort((a, b) => new Date(a.SendTime) - new Date(b.SendTime)));
        setImage(null);
      } catch (error) {
        console.error("Error uploading and sending image:", error);
      }
    }
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
