import {
  Alert,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { auth, db } from "../../server/firebase";
import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";
import * as ImagePicker from "expo-image-picker";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../server/firebase";
import { getUser } from "../../server/api";
import {
  updatePassword,
  verifyBeforeUpdateEmail,
} from "@firebase/auth";
import { doc, updateDoc } from "firebase/firestore";

const ProfileScreen = ({ route, navigation }) => {
  const { userId, imageUrl } = route.params;
  
  const [docId, setDocId] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [image, setImage] = useState(imageUrl);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = await getUser(userId);
        setEmail(user.email);
        setUsername(user.displayName);
        setDocId(user.id);
      } catch (error) {
        console.error("Error fetching user data: ", error);
      }
    };

    fetchUserData();
  }, [userId, imageUrl]);

  const askForPermissions = async () => {
    const { status: cameraStatus } =
      await ImagePicker.requestCameraPermissionsAsync();
    const { status: galleryStatus } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus !== "granted" || galleryStatus !== "granted") {
      Alert.alert(
        "İzin Gerekli",
        "Üzgünüz, bu işlemi gerçekleştirebilmek için kamera ve galeri izinlerine ihtiyacımız var!"
      );
    }
  };

  const pickImage = async () => {
    await askForPermissions();

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const imageUri = result.assets[0].uri;
      setImage(imageUri);
    }
  };

  const uploadImage = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const fileName = `${Date.now()}.jpg`;
    const storageRef = ref(storage, `userImages/${fileName}`);
    await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  };

  const handleSave = async () => {
    if (!username || !email) {
      Alert.alert("Hata", "Lütfen tüm alanları doldurun.");
      return;
    }
  
    try {
      const currentUser = auth.currentUser;
      
      if (password) {
        await updatePassword(currentUser, password);
      }
  
      const userRef = doc(db, "Users", docId);
      const profileImageUrl = await uploadImage(image);
      await updateDoc(userRef, {
        displayName: username,
        profileImage: profileImageUrl,
        updatedAt: new Date(),
      });
  
      Alert.alert("Başarılı!", "Profiliniz başarıyla güncellenmiştir.", [
        {
          text: "TAMAM",
          onPress: () => {
            navigation.navigate("HomeScreen");
          },
        },
      ]);
    } catch (error) {
      console.error("Kullanıcı güncelleme hatası: ", error);
      Alert.alert(
        "Güncelleme Hatası",
        "Kullanıcı güncellenmesi sırasında bir hata oluştu."
      );
    }
  };  

  const updateEmail = async () => {
    const currentUser = auth.currentUser;

    try {
      await verifyBeforeUpdateEmail(currentUser, currentUser.email);
      Alert.alert(
        "Başarılı!",
        "Eski mailinize e-posta güncelleme için doğrulama maili gönderilmiştir. Doğrulamanızı sağladıktan sonra mailiniz güncellenecektir.",
        [
          {
            text: "TAMAM",
            onPress: async () => {
              const userRef = doc(db, "Users", docId);
              await updateDoc(userRef, {
                email: email,
                updatedAt: new Date(),
              });
              auth.signOut();
            },
          },
        ]
      );
    } catch (error) {
      if (error.code === "auth/requires-recent-login") {
        Alert.alert(
          "Giriş Yenileme Gerekiyor",
          "E-posta adresinizi güncelleyebilmek için yeniden giriş yapmanız gerekiyor.",
          [
            {
              text: "Yeniden Giriş Yap",
              onPress: () => {
                auth.signOut();
              },
            },
            {
              text: "İptal",
              style: "cancel",
            },
          ]
        );
      } else {
        console.error("E-posta güncelleme hatası: ", error.message);
      }
    }
  };

  return (
    <KeyboardAwareScrollView
      style={{ flex: 1, backgroundColor: "white" }}
      contentContainerStyle={{ flexGrow: 1, padding: 16 }}
      keyboardShouldPersistTaps="handled"
    >
      <View className="flex-1 justify-between">
        <View>
          <View className="relative items-center mb-4">
            <TouchableOpacity activeOpacity={0.6} onPress={pickImage}>
              <Image
                source={{ uri: image }}
                className="w-36 h-36 rounded-full"
              />
              <Feather
                name="edit"
                size={24}
                color="black"
                style={{ position: "absolute", bottom: 4, right: -8 }}
              />
            </TouchableOpacity>
            <Text className="text-lg font-bold mt-2">Profili Düzenle</Text>
          </View>
          <View className="flex-row items-center">
            <View className="flex-1 bg-gray-100 my-2 rounded-xl flex-row items-center mr-2">
              <View className="p-3.5">
                <AntDesign name="mail" size={24} color="#6b7280" />
              </View>
              <View className="flex-1">
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholderTextColor="#6b7280"
                  placeholder="E-Posta"
                  className="py-2 px-3"
                />
              </View>
            </View>

            <View className="flex-shrink-0">
              <TouchableOpacity
                onPress={updateEmail}
                activeOpacity={0.8}
                className="bg-violet-600 py-2 px-4 rounded-lg items-center py-3.5"
              >
                <Text className="text-white text-center text-sm">
                  E-Posta Güncelle
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View className="flex-row bg-gray-100 my-2 rounded-xl">
            <View className="p-3.5">
              <AntDesign name="user" size={24} color="#6b7280" />
            </View>
            <TextInput
              className="w-10/12"
              value={username}
              onChangeText={setUsername}
              placeholderTextColor="#6b7280"
              placeholder="Kullanıcı Adı"
            />
          </View>

          <View className="flex-row bg-gray-100 my-2 rounded-xl">
            <View className="p-3.5">
              <AntDesign name="lock" size={24} color="#6b7280" />
            </View>
            <TextInput
              className="w-10/12"
              secureTextEntry={true}
              value={password}
              onChangeText={setPassword}
              placeholderTextColor="#6b7280"
              placeholder="Parola"
            />
          </View>
        </View>

        <View className="mb-5">
          <TouchableOpacity
            activeOpacity={0.8}
            className="bg-violet-600 py-4 rounded-lg mt-5 items-center"
            onPress={handleSave}
          >
            <Text className="text-center text-white font-semibold">
              Kullanıcı Bilgilerini Güncelle
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
};

export default ProfileScreen;
