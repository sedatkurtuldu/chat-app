import { Image, Text, TouchableOpacity, View } from "react-native";
import React from "react";

const MessageListComponent = ({ item, navigation }) => {
    const navigateToChatRoom = () => {
        navigation.navigate("ChatRoomScreen", { displayName: item.displayName, profileImage: item.profileImage, id: item.userId })
    }
  return (
    <TouchableOpacity onPress={navigateToChatRoom} activeOpacity={0.8} className="flex-row justify-between items-center p-3 border-b border-gray-200">
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
          <Text className="text-gray-600">Mesaj</Text>
        </View>
      </View>
      <View className="items-end justify-center">
        <Text className="text-gray-400">Saat</Text>
      </View>
    </TouchableOpacity>
  );
};

export default MessageListComponent;
