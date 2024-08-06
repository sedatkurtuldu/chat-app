import { Image, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import moment from "moment";
import { auth } from "../../server/firebase";
import AntDesign from '@expo/vector-icons/AntDesign';

const MessageListComponent = ({ item, navigation }) => {
  const navigateToChatRoom = () => {
    navigation.navigate("ChatRoomScreen", {
      displayName: item.displayName,
      profileImage: item.profileImage,
      id: item.userId,
    });
  };

  return (
    <TouchableOpacity
      onPress={navigateToChatRoom}
      activeOpacity={0.8}
      className="flex-row justify-between items-center p-3 border-b border-gray-200"
    >
      <View className="flex-row">
        <View className="items-center">
          <Image
            height={60}
            width={60}
            className="w-15 h-15 rounded-full"
            source={{ uri: item.profileImage }}
          />
        </View>
        <View className="justify-center ml-4">
          <Text className="text-lg font-bold">{item.displayName}</Text>
          {item.lastMessage ? (
            item.lastMessage.ImageUrl ? (
              <View className="flex-row items-center gap-1.5">
                <AntDesign name="camera" size={18} color="darkgrey" />
                <Text>Fotoğraf</Text>
              </View>
              
            ) : (
              <Text className="text-gray-600">{item.lastMessage.Message}</Text>
            )
          ) : (
            <Text className="text-gray-600"> Hi👋 I'm using Akko!</Text>
          )}
        </View>
      </View>
      <View className="items-end justify-center">
        {item.lastMessage && (
          <Text className="text-gray-400">
            {moment(item.lastMessage.SendTime).format("HH:mm")}
          </Text>
        )}
        {item.read > 0 && item.receiverUserId === auth.currentUser.uid && (
          <View className="bg-violet-600 rounded-full w-7 h-7 justify-center items-center mt-1.5">
            <Text className="text-white font-bold">{item.read}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default MessageListComponent;
