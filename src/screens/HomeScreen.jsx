import { FlatList, StyleSheet, View } from "react-native";
import React, { useEffect, useState } from "react";
import { auth } from "../../server/firebase";
import {
  getGroupsQuery,
  getMessagesQuery,
  getUsersQuery,
} from "../../server/api";
import MessageListComponent from "../components/MessageListComponent";
import { onSnapshot } from "firebase/firestore";
import { FAB } from "react-native-paper";
import { getGroupMessages, getUserDisplayNames } from "../../server/api";

const HomeScreen = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const usersAndGroups = [...groups, ...users];

  useEffect(() => {
    const unsubscribers = new Map();
  
    const fetchUsers = async () => {
      const q = getUsersQuery(auth.currentUser.uid);
  
      const unsubscribeFromUsers = onSnapshot(q, (snapshot) => {
        const usersList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          lastMessage: null,
          type: "user",
        }));
  
        setUsers(usersList);
  
        unsubscribers.forEach((unsub) => unsub());
  
        usersList.forEach((user) => {
          const q2 = getMessagesQuery(auth.currentUser.uid, user.userId);
  
          const unsubscribeFromMessages = onSnapshot(q2, (snapshot) => {
            const messages = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
  
            const sortedMessages = messages.sort(
              (a, b) => a.SendTime - b.SendTime
            );
            const latestMessage = sortedMessages[sortedMessages.length - 1];
            const statusOneCount = messages.filter(
              (message) => message.Status === 1
            ).length;
            const receiverUserId = latestMessage?.ReceiverUserId;
  
            setUsers((prevUsers) => {
              return prevUsers.map((u) =>
                u.id === user.id
                  ? {
                      ...u,
                      lastMessage: latestMessage,
                      read: statusOneCount,
                      ...(receiverUserId && { receiverUserId: receiverUserId }),
                    }
                  : u
              );
            });
          });
  
          unsubscribers.set(user.userId, unsubscribeFromMessages);
        });
      });
  
      return () => {
        unsubscribeFromUsers();
        unsubscribers.forEach((unsub) => unsub());
      };
    };
  
    const fetchGroups = async () => {
      const q = getGroupsQuery(auth.currentUser.uid);
      const unsubscribeFromGroups = onSnapshot(q, async (snapshot) => {
        const groupList = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
            type: "group",
            lastMessage: null,
          }))
          .filter((group) => group.Users.includes(auth.currentUser.uid));
    
        setGroups(groupList);
    
        const userDisplayNames = await getUserDisplayNames();
    
        groupList.forEach((group) => {
          const q2 = getGroupMessages(group.id);
    
          const unsubscribeFromMessages = onSnapshot(q2, (snapshot) => {
            const messages = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
    
            const sortedMessages = messages.sort((a, b) => {
              const aSendTime = new Date(a.SendTime).getTime();
              const bSendTime = new Date(b.SendTime).getTime();
              return aSendTime - bSendTime;
            });
    
            const latestMessage = sortedMessages[sortedMessages.length - 1] || {};
            const userId = auth.currentUser.uid;
            const statusOneCount = sortedMessages.filter((message) => message[userId] === 1).length;
    
            const latestMessageWithDisplayName = {
              ...latestMessage,
              SenderDisplayName: userDisplayNames[latestMessage.SenderUserId],
            };
    
            setGroups((prevGroups) => {
              return prevGroups.map((g) =>
                g.id === group.id
                  ? {
                      ...g,
                      lastMessage: latestMessageWithDisplayName,
                      read: statusOneCount,
                    }
                  : g
              );
            });
          });
    
          unsubscribers.set(group.id, unsubscribeFromMessages);
        });
      });
    
      return () => {
        unsubscribeFromGroups();
        unsubscribers.forEach((unsub) => unsub());
      };
    };

    fetchUsers();
    fetchGroups();
  }, []);
  

  const renderItem = ({ item }) => (
    <MessageListComponent item={item} navigation={navigation} />
  );

  return (
    <View className="flex-1 bg-white">
      <FlatList
        data={usersAndGroups}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
      <FAB
        icon="plus"
        className="absolute m-4 right-3 bottom-8"
        onPress={() => navigation.navigate("AddGroupModalScreen")}
      />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({});
