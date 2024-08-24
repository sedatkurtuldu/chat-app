import {
  Alert,
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState, useEffect } from "react";
import moment from "moment";
import { auth, db } from "../../server/firebase";
import AntDesign from "@expo/vector-icons/AntDesign";
import { getAllUsersForChat, getGroupByGroupIdQuery } from "../../server/api";
import { arrayRemove, doc, updateDoc } from "firebase/firestore";
import { Button, Card, TextInput } from "react-native-paper";

const MessageListComponent = ({ item, navigation }) => {
  const [users, setUsers] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      let allUsers = await getAllUsersForChat(auth.currentUser.uid);

      if (item.type === "group") {
        const groupData = await getGroupByGroupIdQuery(item.id);
        if (groupData && groupData.Users) {
          allUsers = allUsers.filter(
            (user) => !groupData.Users.includes(user.userId)
          );
        }
      }

      setUsers(allUsers);
    };

    fetchUsers();
  }, [users]);

  useEffect(() => {
    if (searchQuery === "") {
      setFilteredUsers(users);
    } else {
      setFilteredUsers(
        users.filter((user) =>
          user.displayName.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
  }, [searchQuery, users]);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleSelectContact = (contact) => {
    if (!selectedUserIds.includes(contact.userId)) {
      setSelectedUserIds([...selectedUserIds, contact.userId]);
    }
  };

  const handleRemoveContact = (userId) => {
    setSelectedUserIds(selectedUserIds.filter((id) => id !== userId));
  };

  const handleAddUsers = async () => {
    if (selectedUserIds.length === 0) {
      Alert.alert(
        "Hata",
        "Lütfen eklemek için en az bir kullanıcı seçin.",
        [{ text: "Tamam" }],
        { cancelable: true }
      );
      return;
    }

    if (item.type === "group") {
      const groupRef = doc(db, "Groups", item.id);
      await updateDoc(groupRef, {
        Users: [...item.Users, ...selectedUserIds],
      });

      Alert.alert(
        "Başarılı",
        "Kullanıcılar başarıyla eklendi.",
        [{ text: "Tamam" }],
        { cancelable: true }
      );
      setModalVisible(false);
    }
  };

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
        "Seçim Yapın",
        "Ne yapmak istiyorsunuz?",
        [
          {
            text: "Gruba Ekle",
            onPress: () => {
              setModalVisible(true);
            },
          },
          {
            text: "Gruptan Çık",
            onPress: async () => {
              const groupId = item.id;
              const groupData = await getGroupByGroupIdQuery(groupId);

              if (groupData) {
                const groupRef = doc(db, "Groups", groupId);
                await updateDoc(groupRef, {
                  Users: arrayRemove(auth.currentUser.uid),
                });
              }
            },
          },
          {
            text: "İptal",
            onPress: () => console.log("İşlem iptal edildi"),
            style: "cancel",
          },
        ],
        { cancelable: true }
      );
    }
  };

  const renderItem = (item) => (
    <TouchableOpacity
      key={item.id}
      onPress={() => handleSelectContact(item)}
      activeOpacity={0.9}
      className="mx-4 mb-2"
    >
      <Card>
        <Card.Content>
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center">
              <Image
                source={{
                  uri: item.profileImage || "https://via.placeholder.com/40",
                }}
                className="w-10 h-10 rounded-full mr-2"
              />
              <View>
                <Text className="text-base">{item.displayName}</Text>
                <Text className="text-gray-500 text-sm">{item.email}</Text>
              </View>
            </View>
            <Text className="text-blue-500 text-xl">+</Text>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View>
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
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-white bg-opacity-80">
          <View className="bg-white rounded-lg p-5 w-full h-full max-w-md max-h-full">
            <Text className="text-lg text-center font-bold mb-4">
              Gruba Kullanıcı Ekle
            </Text>

            <View className="p-4">
              <Text className="text-base font-medium mb-2">Kişi Ara:</Text>
              <TextInput
                activeOutlineColor="#7c3aed"
                label="Kişi Ara"
                placeholder="Kişi aramak için yazın..."
                mode="outlined"
                value={searchQuery}
                onChangeText={handleSearch}
                className="mb-4"
              />
            </View>

            <ScrollView className="flex-1">
              {filteredUsers.map(renderItem)}
            </ScrollView>

            <View className="p-4">
              <Text className="text-lg font-bold mb-2">Seçilen Kişiler:</Text>
              <ScrollView>
                {selectedUserIds
                  .filter((userId) => userId !== auth.currentUser.uid)
                  .map((userId) => users.find((user) => user.userId === userId))
                  .filter((user) => user)
                  .map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      onPress={() => handleRemoveContact(item.userId)}
                      className="flex-row items-center mb-2"
                      activeOpacity={0.7}
                    >
                      <Image
                        source={{
                          uri:
                            item.profileImage ||
                            "https://www.mountsinai.on.ca/wellbeing/our-team/team-images/person-placeholder/image",
                        }}
                        className="w-10 h-10 rounded-full"
                      />
                      <View className="ml-2 flex-1">
                        <Text className="text-lg font-bold">
                          {item.displayName}
                        </Text>
                      </View>
                      <Text className="text-red-500 text-xl ml-2">×</Text>
                    </TouchableOpacity>
                  ))}
              </ScrollView>
            </View>

            <View className="p-4 flex-row justify-between">
              <Button
                mode="outlined"
                onPress={() => setModalVisible(false)}
                className="mr-2"
                style={{ borderColor: '#7c3aed', borderWidth: 1, flex: 1, marginRight: 8 }}
              >
                İptal
              </Button>
              <Button
                mode="contained"
                buttonColor="#7c3aed"
                onPress={handleAddUsers}
                style={{ flex: 1 }}
              >
                Kişi Ekle
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default MessageListComponent;
