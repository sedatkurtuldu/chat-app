import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Image, ScrollView, Alert } from "react-native";
import { TextInput, Button, Card } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import { getUsersQuery } from "../../server/api";
import { auth, db } from "../../server/firebase";
import { addDoc, collection, onSnapshot } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Feather } from "@expo/vector-icons";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

const AddGroupModalScreen = () => {
  const [groupName, setGroupName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [users, setUsers] = useState([]);
  const [image, setImage] = useState(null);

  useEffect(() => {
    const q = getUsersQuery(auth.currentUser.uid);

    const unsubscribeFromUsers = onSnapshot(q, (snapshot) => {
      const usersList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        lastMessage: null,
      }));
      setUsers(usersList);
    });

    return () => {
      unsubscribeFromUsers();
    };
  }, []);

  const handleSearch = (text) => {
    setSearchQuery(text);
  };

  const handleSelectContact = (contact) => {
    if (!selectedUserIds.includes(contact.userId)) {
      setSelectedUserIds([...selectedUserIds, contact.userId]);
    }
  };

  const handleRemoveContact = (UserId) => {
    setSelectedUserIds(selectedUserIds.filter((userId) => userId !== UserId));
  };

  const filteredUsers = users.filter((user) =>
    user.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.3,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert("Hata", "Grup adı boş olamaz.");
      return;
    }
  
    if (selectedUserIds.length === 0) {
      Alert.alert("Hata", "En az bir kişi seçmelisiniz.");
      return;
    }
  
    if (!image) {
      Alert.alert("Hata", "Bir grup resmi seçmelisiniz.");
      return;
    }
  
    const currentUser = auth.currentUser.uid;
  
    try {
      const storage = getStorage();
      const storageRef = ref(storage, `groupImages/${Date.now()}.jpg`);
  
      const blob = await fetch(image).then((response) => response.blob());
      await uploadBytes(storageRef, blob);
      const imageUrl = await getDownloadURL(storageRef);
  
      const newGroup = {
        Name: groupName,
        ImageUrl: imageUrl,
        Users: selectedUserIds,
        CreatorId: currentUser,
        SendTime: new Date().toISOString(),
        Status: 1,
      };
  
      await addDoc(collection(db, "Groups"), newGroup);
  
      Alert.alert("Başarılı", "Grup başarıyla oluşturuldu!");
    } catch (error) {
      console.error("Grup oluşturma hatası: ", error);
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
    <KeyboardAwareScrollView
      contentContainerStyle={{ flexGrow: 1, backgroundColor: "white" }}
      keyboardShouldPersistTaps="handled"
    >
      <View className="flex-1 bg-white">
        {/* Profile Image Section */}
        <View className="relative items-center mb-4">
          <TouchableOpacity activeOpacity={0.6} onPress={pickImage}>
            <Image
              source={{
                uri:
                  image ||
                  "https://www.mountsinai.on.ca/wellbeing/our-team/team-images/person-placeholder/image",
              }}
              className="w-36 h-36 rounded-full"
            />
            <Feather
              name="edit"
              size={24}
              color="black"
              style={{ position: "absolute", bottom: 4, right: -8 }}
            />
          </TouchableOpacity>
        </View>

        {/* Selected Contacts */}
        <View className="p-4">
          <Text className="text-lg font-bold">Seçilen Kişiler:</Text>
          <ScrollView>
            {selectedUserIds
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
                        item.profileImage || "https://via.placeholder.com/40",
                    }}
                    className="w-10 h-10 rounded-full mr-2"
                  />
                  <View className="flex-row items-center">
                    <Text className="text-base">{item?.displayName}</Text>
                    <Text className="text-red-500 text-xl ml-2">×</Text>
                  </View>
                </TouchableOpacity>
              ))}
          </ScrollView>
        </View>

        {/* Group Name Input */}
        <View className="p-4">
          <TextInput
            activeOutlineColor="#7c3aed"
            label="Grup Adı"
            mode="outlined"
            value={groupName}
            onChangeText={(text) => setGroupName(text)}
          />
        </View>

        {/* Search Input */}
        <View className="p-4">
          <TextInput
            activeOutlineColor="#7c3aed"
            label="Kişi Ara"
            mode="outlined"
            value={searchQuery}
            onChangeText={handleSearch}
            className="mb-4"
          />
        </View>

        {/* User List */}
        <ScrollView>{filteredUsers.map(renderItem)}</ScrollView>

        {/* Create Group Button */}
        <View className="p-4 mb-2">
          <Button
            buttonColor="#7c3aed"
            mode="contained"
            onPress={handleCreateGroup} // Updated handler
          >
            Grup Oluştur
          </Button>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
};

export default AddGroupModalScreen;
