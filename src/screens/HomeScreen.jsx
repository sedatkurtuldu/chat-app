import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { auth } from '../../server/firebase';
import { getAllUsersForChat } from '../../server/api';
import MessageListComponent from '../components/MessageListComponent';

const HomeScreen = ({ navigation }) => {
const [users, setUsers] = useState([])

  useEffect(() => {
    
  getAllUsers();
    
  }, [])

  const getAllUsers = async () => {
    const users = await getAllUsersForChat(auth.currentUser.uid);

    setUsers(users);
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

  const renderItem = ({ item }) => (
    <MessageListComponent item={item} />
  );

  return (
    <View className="flex-1 bg-white">
        <FlatList
          data={users}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
        />
      <TouchableOpacity onPress={logOut}>
        <Text>Çıkış Yap</Text>
      </TouchableOpacity>
    </View>
  )
}

export default HomeScreen

const styles = StyleSheet.create({})