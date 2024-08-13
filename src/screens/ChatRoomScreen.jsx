import {
  Image,
  Keyboard,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useLayoutEffect, useRef, useState, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import ChatComponent from "../components/ChatComponent";
import { auth, db } from "../../server/firebase";
import * as ImagePicker from "expo-image-picker";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { addDoc, collection, onSnapshot, updateDoc } from "firebase/firestore";
import { getMessagesQuery } from "../../server/api";
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
      headerTitleAlign: "left",
      headerLeft: () => (
        <View className="flex-row items-center ml-3.5">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mr-3"
          >
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Image
            style={{ height: 38, width: 38, borderRadius: 19}}
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

      setMessage("");
    } catch (error) {
      console.error("Mesaj gönderme hatası: ", error);
    }
  }, 300), [message, id]);

  const handleSend = () => {
    debouncedHandleSend();
  };

  const debouncedHandlePickAndSendImage = useCallback(debounce(async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.3,
      });
  
      if (!result.canceled) {
        const imageUri = result.assets[0].uri;
        console.log("Image selected, uploading to Firebase Storage...");
  
        const response = await fetch(imageUri);
        const blob = await response.blob();
        const uniqueName = `uploadImages/${Date.now()}.jpg`;
  
        const storage = getStorage();
        const storageRef = ref(storage, uniqueName);
  
        await uploadBytes(storageRef, blob).then(async (snapshot) => {

          const downloadURL = await getDownloadURL(storageRef);
  
          const imgMsg = {
            ReceiverUserId: id,
            SenderUserId: auth.currentUser.uid,
            Message: "",
            ImageUrl: downloadURL,
            SendTime: new Date().toISOString(),
            Status: 1,
          };
          
          await addDoc(collection(db, "Messages"), imgMsg);
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
