import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import TextInputComponent from "../components/TextInputComponent";
import * as ImagePicker from "expo-image-picker";
import * as SecureStore from "expo-secure-store";
import ImagePickerComponent from "../components/ImagePickerComponent";
import "firebase/auth";
import "firebase/firestore";
import axios from "axios";
import { auth, db } from "../../server/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { addDoc, collection } from "firebase/firestore";

const RegisterScreen = ({ navigation }) => {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [image, setImage] = useState(null);

  const handleLoginPage = () => {
    navigation.navigate("LoginScreen");
  };

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
      setImage(result.assets[0].uri);
    } else {
      Alert.alert(
        "Resim Seçimi İptal Edildi",
        "Resim seçimi iptal edildi veya herhangi bir resim seçilmedi."
      );
    }
  };

  const registerUser = async () => {
    if (!userName || !email || !password || !image) {
      Alert.alert("Hata", "Lütfen tüm alanları doldurun.");
      return;
    }
  
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      await addDoc(collection(db, "Users"), {
        userId: user.uid,
        email: user.email,
        displayName: userName,
        profileImage: image,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      //BURADA PC'NİN IP'Sİ GEREK!!!
      const response = await axios.get(`http://192.168.1.207:3000/api/createToken?userId=${user.uid}&email=${user.email}`);
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const data = await response.json();
      const { token } = data;
      console.log("Received JWT:", token);
  
      await SecureStore.setItemAsync("userToken", token);
  
      await signInWithEmailAndPassword(auth, email, password);
  
      navigation.navigate("HomeScreen");
    } catch (error) {
      console.error("Error registering user: ", error);
      Alert.alert("Kayıt Hatası", "Kullanıcı kaydı sırasında bir hata oluştu.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView>
        <View className="justify-center items-center">
          <Image
            source={
              image == null
                ? require("../../assets/register.png")
                : { uri: image }
            }
            className="w-48 h-48 mt-10 rounded-xl"
          />
        </View>
        <View className="my-3 items-center">
          <Text className="text-2xl font-medium">Kaydol</Text>
        </View>
        <View className="items-center">
          <TextInputComponent
            placeholder="Kullanıcı Adı"
            iconName="user"
            setRegisterUserName={setUserName}
          />
          <TextInputComponent
            placeholder="E-Posta"
            iconName="mail"
            setRegisterEmail={setEmail}
          />
          <TextInputComponent
            placeholder="Parola"
            iconName="lock"
            setRegisterPassword={setPassword}
          />
          <ImagePickerComponent onPress={pickImage} />
        </View>
        <View className="items-center justify-center my-2 ">
          <TouchableOpacity
            className="p-3 bg-violet-600 rounded-md w-11/12 items-center"
            activeOpacity={0.9}
            onPress={registerUser}
          >
            <Text className="font-medium text-white text-lg">Kaydol</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center justify-center gap-1.5 my-1">
          <Text className="text-gray-700">Bir hesabın var mı?</Text>
          <Text
            className="text-violet-800 font-medium"
            onPress={handleLoginPage}
          >
            Giriş Yap
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({});
