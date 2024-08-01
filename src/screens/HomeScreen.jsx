import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { auth } from '../../server/firebase';

const HomeScreen = ({ navigation }) => {
  
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