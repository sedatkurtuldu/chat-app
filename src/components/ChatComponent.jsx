import { StyleSheet, Text, View } from "react-native";
import React from "react";

const ChatComponent = () => {
  return (
    <>
      <View className="bg-violet-300 p-2 m-3 rounded-xl w-3/4">
        <Text className="text-base text-left">
          This is a sample text that is intentionally long to demonstrate how
          the View expands and wraps text inside it. If the text is too long, it
          should automatically wrap to the next line and expand the View
          accordingly.
        </Text>
        <Text className="text-sm text-gray-500 self-end absolute bottom-2 right-2">
          {new Date().toLocaleTimeString()}
        </Text>
      </View>
      <View className="bg-white p-2 m-3 rounded-xl w-3/4 self-end">
        <Text className="text-base text-left">
          This is a sample text that is intentionally long to demonstrate how
          the View expands and wraps text inside it. If the text is too long, it
          should automatically wrap to the next line and expand the View
          accordingly.
        </Text>
        <Text className="text-sm text-gray-500 self-end absolute bottom-2 right-2">
          {new Date().toLocaleTimeString()}
        </Text>
      </View>
    </>
  );
};

export default ChatComponent;

const styles = StyleSheet.create({});
