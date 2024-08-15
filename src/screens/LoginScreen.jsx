import { Image, Text, TouchableOpacity, View, Alert } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import TextInputComponent from "../components/TextInputComponent";
import { signInWithEmailAndPassword } from "@firebase/auth";
import { auth } from "../../server/firebase";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      if (email === "" || password === "") {
        Alert.alert("Başarısız!", "E-Posta ve Şifre alanı boş geçilemez.", [
          { text: "TAMAM" },
        ]);
        return;
      }
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const token = await userCredential.user.getIdToken();
    } catch (error) {
      console.error("Giriş yaparken bir hata oluştu: ", error.message);
      Alert.alert(
        "Başarısız!",
        "Giriş yaparken bir hata oluştu, lütfen tekrar deneyin.",
        [{ text: "TAMAM" }]
      );
    }
  };

  const handleRegisterPage = () => {
    navigation.navigate("RegisterScreen");
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAwareScrollView>
        <View className="justify-center items-center">
          <Image
            source={require("../../assets/login.png")}
            className="w-48 h-48 mt-10"
          />
        </View>
        <View className="my-3 items-center">
          <Text className="text-2xl font-medium">Giriş Yap</Text>
        </View>
        <View className="items-center">
          <TextInputComponent
            placeholder="E-Posta"
            iconName="mail"
            setLoginEmail={setEmail}
          />
          <TextInputComponent
            placeholder="Parola"
            iconName="lock"
            setLoginPassword={setPassword}
          />
        </View>
        <TouchableOpacity className="w-11/12 my-2 items-end" activeOpacity={0.8}>
          <Text className="text-gray-700">Şifreni mi unuttun?</Text>
        </TouchableOpacity>
        <View className="items-center justify-center my-2 ">
          <TouchableOpacity
            onPress={handleLogin}
            className="p-3 bg-violet-600 rounded-md w-11/12 items-center"
            activeOpacity={0.9}
          >
            <Text className="font-medium text-white text-lg">Giriş Yap</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center justify-center gap-1.5 my-1">
          <Text className="text-gray-700">Hesabın mı yok?</Text>
          <Text
            className="text-violet-800 font-medium"
            onPress={handleRegisterPage}
          >
            Kaydol!
          </Text>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default LoginScreen;