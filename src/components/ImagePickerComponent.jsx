import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import AntDesign from "@expo/vector-icons/AntDesign";

const ImagePickerComponent = ({ onPress }) => {
  return (
    <TouchableOpacity
      className="flex-row bg-gray-100 w-11/12 my-2 rounded-md"
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View className="p-3.5 flex-row gap-3 items-center">
        <AntDesign name="camerao" size={24} color="#6b7280" />
        <Text style={{ color: "#6b7280" }}>Fotoğraf Seçiniz</Text>
      </View>
    </TouchableOpacity>
  );
};

export default ImagePickerComponent;

const styles = StyleSheet.create({});
