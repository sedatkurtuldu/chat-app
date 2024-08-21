import { Image, Text, TouchableOpacity, View, Alert } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import TextInputComponent from "../components/TextInputComponent";
import { sendPasswordResetEmail } from "@firebase/auth";
import { auth } from "../../server/firebase";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");

  const handlePasswordReset = async () => {
    try {
      if (email === "") {
        Alert.alert("Başarısız!", "E-Posta alanı boş geçilemez.", [
          { text: "TAMAM" },
        ]);
        return;
      }
      await sendPasswordResetEmail(auth, email);
      Alert.alert(
        "Başarılı!",
        "Şifre sıfırlama talimatları e-posta adresinize gönderildi.",
        [{ text: "TAMAM", onPress: () => navigation.navigate("LoginScreen") }]
      );
    } catch (error) {
      console.error("Şifre sıfırlanırken bir hata oluştu: ", error.message);
      Alert.alert(
        "Başarısız!",
        "Şifre sıfırlanırken bir hata oluştu, lütfen tekrar deneyin.",
        [{ text: "TAMAM" }]
      );
    }
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
          <Text className="text-2xl font-medium">Şifremi Unuttum</Text>
        </View>
        <View className="items-center">
          <TextInputComponent
            placeholder="E-Posta"
            iconName="mail"
            setLoginEmail={setEmail}
          />
        </View>
        <View className="items-center justify-center my-2">
          <TouchableOpacity
            onPress={handlePasswordReset}
            className="p-3 bg-violet-600 rounded-md w-11/12 items-center"
            activeOpacity={0.9}
          >
            <Text className="font-medium text-white text-lg">Şifremi Sıfırla</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center justify-center gap-1.5 my-1">
          <Text className="text-gray-700">Geri dönmek ister misin?</Text>
          <Text
            className="text-violet-800 font-medium"
            onPress={() => navigation.navigate("LoginScreen")}
          >
            Giriş Yap!
          </Text>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default ForgotPasswordScreen;
