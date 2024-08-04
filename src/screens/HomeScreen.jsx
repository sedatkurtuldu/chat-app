import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { auth } from '../../server/firebase';
import { getMessagesQuery, getUsersQuery } from '../../server/api';
import MessageListComponent from '../components/MessageListComponent';
import { onSnapshot } from 'firebase/firestore';

const HomeScreen = ({ navigation }) => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const unsubscribers = new Map();
  
    const fetchUsers = async () => {
      const q = getUsersQuery(auth.currentUser.uid);
  
      const unsubscribeFromUsers = onSnapshot(q, (snapshot) => {
        const usersList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          lastMessage: null
        }));
  
        setUsers(usersList);
  
        unsubscribers.forEach(unsub => unsub());
  
        usersList.forEach(user => {
          const q2 = getMessagesQuery(auth.currentUser.uid, user.userId);
  
          const unsubscribeFromMessages = onSnapshot(q2, (snapshot) => {
            const messages = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
            }));
  
            const sortedMessages = messages.sort((a, b) => a.SendTime - b.SendTime);
            const latestMessage = sortedMessages[sortedMessages.length - 1];
  
            setUsers(prevUsers => {
              return prevUsers.map(u => 
                u.id === user.id ? { ...u, lastMessage: latestMessage } : u
              );
            });
          });
  
          unsubscribers.set(user.userId, unsubscribeFromMessages);
        });
      });
  
      return () => {
        unsubscribeFromUsers();
        unsubscribers.forEach(unsub => unsub());
      };
    };
  
    fetchUsers();
  }, []);

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
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({});
