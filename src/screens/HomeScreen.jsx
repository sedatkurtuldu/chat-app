import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { auth, db } from '../../server/firebase';
import { getAllUsersForChat } from '../../server/api';
import MessageListComponent from '../components/MessageListComponent';
import { collection, onSnapshot, query, where } from 'firebase/firestore';

const HomeScreen = ({ navigation }) => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const userCollectionRef = collection(db, 'Users');
    const q = query(userCollectionRef, where('userId', '!=', auth.currentUser.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersList);
    });

    return () => unsubscribe();
  }, []);

  const getAllUsers = async () => {
    const users = await getAllUsersForChat(auth.currentUser.uid);
    setUsers(users);
  };

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
    <MessageListComponent item={item} navigation={navigation} />
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
  );
};

export default HomeScreen;

const styles = StyleSheet.create({});
