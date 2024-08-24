import React, { useState } from "react";
import { Text, View, Image, Platform, Modal, TouchableOpacity } from "react-native";
import moment from "moment";

const ChatComponent = ({ item, currentUser, isGroup, usersDisplayNames }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const isSender = item.SenderUserId === currentUser;
  const senderName = isGroup ? usersDisplayNames[item.SenderUserId] : "";

  return (
    <View
      style={{
        padding: 10,
        margin: 10,
        borderRadius: 10,
        width: "75%",
        backgroundColor: isSender ? "white" : "#e6e6fa",
        alignSelf: isSender ? "flex-end" : "flex-start",
        height: item.ImageUrl ? 240 : "auto",
      }}
    >
      {isGroup && senderName && (
        <Text style={{ fontWeight: "bold", marginBottom: 5, color: "#7c3aed" }}>
          {senderName}
        </Text>
      )}

      {item.ImageUrl ? (
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Image
            source={{ uri: item.ImageUrl }}
            style={{
              width: Platform.OS == "android" ? 290 : 273,
              height: isGroup ? 180 : 200,
              borderRadius: 10,
            }}
          />
        </TouchableOpacity>
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

      <Modal visible={modalVisible} transparent={true} animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.9)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <TouchableOpacity
            style={{ position: "absolute", top: 40, right: 20, zIndex: 1 }}
            onPress={() => setModalVisible(false)}
          >
            <Text style={{ color: "white", fontSize: 18 }}>Kapat</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ flex: 1, width: "100%", justifyContent: "center", alignItems: "center" }}
            onPress={() => setModalVisible(false)}
          >
            <Image
              source={{ uri: item.ImageUrl }}
              style={{
                width: "100%",
                height: "100%",
                resizeMode: "contain",
              }}
            />
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

export default ChatComponent;
