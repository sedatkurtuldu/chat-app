import { Image, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import moment from "moment";

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
          {item.lastMessage && (
            <Text className="text-gray-600">{item.lastMessage.Message}</Text>
          )}
        </View>
      </View>
      <View className="items-end justify-center">
        {item.lastMessage && (
          <Text className="text-gray-400">
            {moment(item.lastMessage.SendTime).format("HH:mm")}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default MessageListComponent;
