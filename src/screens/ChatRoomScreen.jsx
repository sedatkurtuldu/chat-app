import {
  Image,
  Keyboard,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { Ionicons } from "@expo/vector-icons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import ChatComponent from "../components/ChatComponent";
import { auth, db } from "../../server/firebase";
import * as ImagePicker from "expo-image-picker";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { addDoc, collection, onSnapshot, updateDoc } from "firebase/firestore";
import {
  getGroupMessages,
  getMessagesQuery,
  getUserDisplayNames,
} from "../../server/api";
import { debounce } from "lodash";

const ChatRoomScreen = ({ route, navigation }) => {
  const { id, displayName, profileImage, isGroup, Users } = route.params;
  const scrollViewRef = useRef(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [usersDisplayNames, setUsersDisplayNames] = useState({});

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

  useEffect(() => {
    let unsubscribe;
  
    if (isGroup) {
      const q = getGroupMessages(id);
      unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedGroupMessages = snapshot.docs.map((doc) => ({
          ...doc.data(),
          ref: doc.ref,
        }));
  
        fetchedGroupMessages.sort((a, b) => {
          return new Date(a.SendTime) - new Date(b.SendTime);
        });
  
        fetchedGroupMessages.map(async (item) => {
          if (item.GroupId === id) {
            if (item[auth.currentUser.uid] === 1) {
              await updateDoc(item.ref, { [auth.currentUser.uid]: 2 });
            }
          }
          return item;
        });
  
        setMessages((prevMessages) => {
          const uniqueMessages = new Map();
  
          prevMessages.forEach((msg) => {
            uniqueMessages.set(msg.ref.id, msg);
          });
  
          fetchedGroupMessages.forEach((msg) => {
            uniqueMessages.set(msg.ref.id, msg);
          });
  
          return Array.from(uniqueMessages.values());
        });
      });
    } else {
      const q = getMessagesQuery(auth.currentUser.uid, id);
      unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedMessages = snapshot.docs.map((doc) => ({
          ...doc.data(),
          ref: doc.ref,
        }));
  
        fetchedMessages.map(async (item) => {
          if (item.ReceiverUserId === auth.currentUser.uid) {
            await updateDoc(item.ref, { Status: 2 });
          }
          return item;
        });
  
        setMessages((prevMessages) => {
          const uniqueMessages = new Map();
  
          prevMessages.forEach((msg) => {
            uniqueMessages.set(msg.ref.id, msg);
          });
  
          fetchedMessages.forEach((msg) => {
            uniqueMessages.set(msg.ref.id, msg);
          });
  
          return Array.from(uniqueMessages.values());
        });
      });
    }
  
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [id, isGroup]);  

  useEffect(() => {
    const loadUserDisplayNames = async () => {
      try {
        const displayNames = await getUserDisplayNames();
        setUsersDisplayNames(displayNames);
      } catch (error) {
        console.error("Error loading user display names:", error);
      }
    };

    if (isGroup) {
      loadUserDisplayNames();
    }
  }, [isGroup]);

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
            style={{ height: 38, width: 38, borderRadius: 19 }}
            source={{ uri: profileImage }}
          />
        </View>
      ),
    });
  }, [navigation, displayName, profileImage]);

  const debouncedHandleSend = useCallback(
    debounce(async () => {
      if (message.trim() === "") return;
  
      const currentUser = auth.currentUser.uid;
      const newMessage = {
        SenderUserId: currentUser,
        Message: message,
        SendTime: new Date().toISOString(),
        ...(isGroup ? { GroupId: id } : { ReceiverUserId: id, Status: 1 }),
      };
  
      if (isGroup) {
        Users.forEach(async (userId) => {
          newMessage[userId] = 1;
        });
      }
  
      try {
        const collectionName = isGroup ? "GroupMessages" : "Messages";
        await addDoc(collection(db, collectionName), newMessage);
  
        setMessage("");
      } catch (error) {
        console.error("Error sending message: ", error);
      }
    }, 300),
    [message, id, isGroup, Users]
  );
  

  const handleSend = () => {
    debouncedHandleSend();
  };

  const debouncedHandlePickAndSendImage = useCallback(
    debounce(async () => {
      try {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.3,
        });

        if (!result.canceled) {
          const imageUri = result.assets[0].uri;

          const response = await fetch(imageUri);
          const blob = await response.blob();
          const uniqueName = `${isGroup ? "uploadGroupImages" : "uploadImages"}/${Date.now()}.jpg`;

          const storage = getStorage();
          const storageRef = ref(storage, uniqueName);

          await uploadBytes(storageRef, blob).then(async () => {
            const downloadURL = await getDownloadURL(storageRef);

            const imgMsg = {
              SenderUserId: auth.currentUser.uid,
              Message: "",
              ImageUrl: downloadURL,
              SendTime: new Date().toISOString(),
              ...(isGroup ? { GroupId: id } : { ReceiverUserId: id, Status: 1 }),
            };

            if (isGroup) {
              Users.forEach(async (userId) => {
                imgMsg[userId] = 1;
              });
            }

            const collectionName = isGroup ? "GroupMessages" : "Messages";
            await addDoc(collection(db, collectionName), imgMsg);
          });
        }
      } catch (error) {
        console.error("Error handling image picker:", error);
      }
    }, 300),
    [id, isGroup, Users]
  );

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
            usersDisplayNames={usersDisplayNames}
            isGroup={isGroup}
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
