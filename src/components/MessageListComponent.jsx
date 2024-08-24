import { Alert, Image, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import moment from "moment";
import { auth, db } from "../../server/firebase";
import AntDesign from "@expo/vector-icons/AntDesign";
import { getGroupByGroupIdQuery } from "../../server/api";
import { arrayRemove, doc, updateDoc } from "firebase/firestore";

const MessageListComponent = ({ item, navigation }) => {
  const navigateToChatRoom = () => {
    if (item.type === "group") {
      navigation.navigate("ChatRoomScreen", {
        displayName: item.Name,
        profileImage: item.ImageUrl,
        id: item.id,
        isGroup: true,
        Users: item.Users,
      });
    } else {
      navigation.navigate("ChatRoomScreen", {
        displayName: item.displayName,
        profileImage: item.profileImage,
        id: item.userId,
        isGroup: false,
        Users: [],
      });
    }
  };

  const handleLongPress = async () => {
    if (item.type === "group") {
      Alert.alert(
        "Gruptan Çık",
        "Gruptan çıkmak istiyor musunuz?",
        [
          {
            text: "Hayır",
            onPress: () => console.log("Gruptan çıkılmadı"),
            style: "cancel",
          },
          { 
            text: "Evet", 
            onPress: async () => {
              const groupId = item.id; 
              const groupData = await getGroupByGroupIdQuery(groupId);
  
              if (groupData) {
                const groupRef = doc(db, "Groups", groupId);
                await updateDoc(groupRef, {
                  Users: arrayRemove(auth.currentUser.uid)
                });
  
                console.log("Gruptan çıkıldı");
              }
            }
          },
        ],
        { cancelable: true }
      );
    }
  };


  return (
    <TouchableOpacity
      onPress={navigateToChatRoom}
      onLongPress={handleLongPress}
      activeOpacity={0.8}
      className="flex-row justify-between items-center p-3 border-b border-gray-200"
    >
      <View className="flex-row">
        <View className="items-center">
          <Image
            height={60}
            width={60}
            className="w-15 h-15 rounded-full"
            source={{
              uri: item.type === "group" ? item.ImageUrl : item.profileImage,
            }}
          />
        </View>
        <View className="justify-center ml-4">
          <Text className="text-lg font-bold">
            {item.type === "group" ? item.Name : item.displayName}
          </Text>
          {item.lastMessage ? (
            item.lastMessage.ImageUrl ? (
              <View className="flex-row items-center gap-1.5">
                <AntDesign name="camera" size={18} color="darkgrey" />
                <Text>Fotoğraf</Text>
              </View>
            ) : (
              <View className="flex-row items-start">
                {item.type === "group" ? (
                  item.lastMessage.SenderDisplayName ? (
                    <>
                      <Text className="text-violet-600 font-bold">
                        {item.lastMessage.SenderDisplayName}:
                      </Text>
                      <Text className="text-gray-600 ml-0.5">
                        {item.lastMessage.Message}
                      </Text>
                    </>
                  ) : (
                    <Text className="text-gray-600">
                      Hi👋 This group is using Akko!
                    </Text>
                  )
                ) : null}
                {item.type !== "group" && (
                  <Text className="text-gray-600">
                    {item.lastMessage.Message}
                  </Text>
                )}
              </View>
            )
          ) : (
            <Text className="text-gray-600">Hi👋 I'm using Akko!</Text>
          )}
        </View>
      </View>
      <View className="items-end justify-center">
        {item.lastMessage && (
          <Text className="text-gray-400">
            {moment(item.lastMessage.SendTime).format("HH:mm")}
          </Text>
        )}
        {item.type === "group"
          ? item.read > 0 && (
              <View className="bg-violet-600 rounded-full w-7 h-7 justify-center items-center mt-1.5">
                <Text className="text-white font-bold">{item.read}</Text>
              </View>
            )
          : item.read > 0 &&
            item.receiverUserId === auth.currentUser.uid && (
              <View className="bg-violet-600 rounded-full w-7 h-7 justify-center items-center mt-1.5">
                <Text className="text-white font-bold">{item.read}</Text>
              </View>
            )}
      </View>
    </TouchableOpacity>
  );
};

export default MessageListComponent;
