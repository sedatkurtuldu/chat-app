import { StyleSheet, Text, View } from "react-native";
import React from "react";
import moment from "moment";

const ChatComponent = ({ item, currentUser }) => {
  const isSender = item.SenderUserId === currentUser;
  return (
    <View
      style={{
        padding: 10,
        margin: 10,
        borderRadius: 10,
        width: "75%",
        backgroundColor: isSender ? "white" : "#e6e6fa",
        alignSelf: isSender ? "flex-end" : "flex-start",
      }}
    >
      <Text style={{ fontSize: 16, textAlign: "left" }}>{item.Message}</Text>
      <Text
        style={{
          fontSize: 12,
          color: "gray",
          textAlign: "right",
          position: "absolute",
          bottom: 5,
          right: 5,
        }}
      >
        {item.SendTime
          ? moment(item.SendTime).format("HH:mm")
          : ""}
      </Text>
    </View>
  );
};

export default ChatComponent;
