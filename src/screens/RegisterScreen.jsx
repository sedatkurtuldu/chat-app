import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import TextInputComponent from "../components/TextInputComponent";
import * as ImagePicker from "expo-image-picker";
import ImagePickerComponent from "../components/ImagePickerComponent";
import { auth, db, storage } from "../../server/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { addDoc, collection } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { hashPassword } from "../../helpers/Helpers";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { signInWithEmailAndPassword } from "@firebase/auth";

const RegisterScreen = ({ navigation }) => {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [image, setImage] = useState(null);

  const handleLoginPage = () => {
    navigation.navigate("LoginScreen");
  };

  const pickImage = async () => {
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    const galleryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (
      cameraPermission.status !== "granted" ||
      galleryPermission.status !== "granted"
    ) {
      Alert.alert(
        "İzin Gerekli",
        "Üzgünüz, bu işlemi gerçekleştirebilmek için kamera ve galeri izinlerine ihtiyacımız var!"
      );
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri);
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

  const registerUser = async () => {
    if (!userName || !email || !password || !image) {
      Alert.alert("Hata", "Lütfen tüm alanları doldurun.");
      return;
    }

    try {
      const hashedPassword = await hashPassword(password);
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      const profileImageUrl = await uploadImage(image);

      await addDoc(collection(db, "Users"), {
        userId: user.uid,
        email: user.email,
        password: hashedPassword,
        displayName: userName,
        profileImage: profileImageUrl,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await signInWithEmailAndPassword(auth, email, password);

      Alert.alert(
        "Başarılı",
        "Kayıt başarıyla tamamlandı!",
        [
          {
            text: "Tamam",
            onPress: () => navigation.navigate("HomeScreen"),
          },
        ],
        { cancelable: false }
      );

    } catch (error) {
      console.error("Kullanıcı kaydı hatası: ", error);
      Alert.alert("Kayıt Hatası", "Kullanıcı kaydı sırasında bir hata oluştu.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAwareScrollView>
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
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default RegisterScreen;
