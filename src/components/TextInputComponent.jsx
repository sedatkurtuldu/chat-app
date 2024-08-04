import { StyleSheet, TextInput, View } from "react-native";
import React from "react";
import AntDesign from "@expo/vector-icons/AntDesign";

const TextInputComponent = ({
  placeholder,
  iconName,
  setLoginEmail,
  setLoginPassword,
  setRegisterUserName,
  setRegisterEmail,
  setRegisterPassword,
  value,
}) => {
  const onChangeText = (text) => {
    if (setLoginEmail && placeholder === "E-Posta") {
      setLoginEmail(text);
    } else if (setLoginPassword && placeholder === "Parola") {
      setLoginPassword(text);
    } else if (setRegisterEmail && placeholder === "E-Posta") {
      setRegisterEmail(text);
    } else if (setRegisterPassword && placeholder === "Parola") {
      setRegisterPassword(text);
    } else if (setRegisterUserName && placeholder === "Kullanıcı Adı") {
      setRegisterUserName(text);
    }
  };

  return (
    <View className="flex-row bg-gray-100 w-11/12 my-2 rounded-xl">
      <View className="p-3.5">
        <AntDesign name={iconName} size={24} color="#6b7280" />
      </View>
      <TextInput
        className="w-10/12"
        multiline={placeholder !== "Parola" ? true : false}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor="#6b7280"
        placeholder={placeholder}
        secureTextEntry={placeholder === "Parola"}
      />
    </View>
  );
};

export default TextInputComponent;

const styles = StyleSheet.create({});
