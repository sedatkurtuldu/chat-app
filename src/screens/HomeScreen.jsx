import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { auth } from '../../server/firebase';
import * as SecureStore from "expo-secure-store";

const HomeScreen = ({ navigation }) => {
  const [token, setToken] = useState("");

  console.log("Token: ", token)
  useEffect(() => {
    const token = getUserToken();

    setToken(token);
  }, [])
  

  async function getUserToken() {
    try {
      const userToken = await SecureStore.getItemAsync("userToken");
      if (userToken) {
        console.log("User token:", userToken);
        return userToken;
      } else {
        console.log("No user token found");
      }
    } catch (error) {
      console.error("Failed to retrieve user token:", error);
    }
  }
  
  const logOut = () => {
    auth.signOut()
      .then(() => {
        navigation.navigate("LoginScreen");
      })
      .catch((error) => {
        console.error("Çıkış yaparken hata oluştu: ", error);
      });
  };
  return (
    <View className="flex-1 bg-white">
      <Text>HomeScreen</Text>
      <TouchableOpacity onPress={logOut}>
        <Text>Çıkış Yap</Text>
      </TouchableOpacity>
    </View>
  )
}

export default HomeScreen

const styles = StyleSheet.create({})