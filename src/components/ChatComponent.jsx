import { StyleSheet, Text, View, Image, Platform } from "react-native";
import React from "react";
import moment from "moment";

const ChatComponent = ({ item, currentUser, isGroup }) => {
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
        height: item.ImageUrl ? 240 : 'auto',
      }}
    >
      {isGroup && !isSender && (
        <Text style={{ fontWeight: "bold", marginBottom: 5 }}>
          {item.SenderDisplayName || "Unknown"}
        </Text>
      )}
      
      {item.ImageUrl ? (
        <Image
          source={{ uri: item.ImageUrl }}
          style={{ width: Platform.OS == "android" ? 290 : 273, height: 200, borderRadius: 10 }}
        />
      ) : (
        <Text style={{ fontSize: 16, textAlign: "left" }}>{item.Message}</Text>
      )}

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
        {item.SendTime ? moment(item.SendTime).format("HH:mm") : ""}
      </Text>
    </View>
  );
};

export default ChatComponent;
