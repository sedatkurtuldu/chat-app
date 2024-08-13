import {
  collection,
  getDocs,
  where,
  query,
  doc,
  getDoc,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "./firebase";

const USERS = "Users";

export const getUser = async (userId) => {
  const userCollectionRef = collection(db, USERS);
  const userQuery = query(userCollectionRef, where("userId", "==", userId));
  const querySnapshot = await getDocs(userQuery);

  if (!querySnapshot.empty) {
    const docSnapshot = querySnapshot.docs[0];
    const user = {
      id: docSnapshot.id,
      userId: docSnapshot.data().userId,
      email: docSnapshot.data().email,
      password: docSnapshot.data().password,
      displayName: docSnapshot.data().displayName,
      profileImage: docSnapshot.data().profileImage,
      createdAt: docSnapshot.data().createdAt,
      updatedAt: docSnapshot.data().updatedAt,
    };
    return user;
  } else {
    return null;
  }
};

export const getAllUsersForChat = async (id) => {
  const userCollectionRef = collection(db, USERS);
  const q = query(
    userCollectionRef,where("userId", "!=", id)
  );
  const snapshot = await getDocs(q);

  const getAllUsersForChat = snapshot.docs.map((doc) => {
    const id = doc.id;
    const user = doc.data();
    return {
      id: id,
      userId: user.userId,
      email: user.email,
      password: user.password,
      displayName: user.displayName,
      profileImage: user.profileImage,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  });
  return getAllUsersForChat;
};

export const getUserDisplayNames = async () => {
  try {
    const userCollection = collection(db, USERS);
    const userSnapshot = await getDocs(userCollection);

    if (userSnapshot.empty) {
      console.log("No matching documents.");
      return {};
    }

    const userNames = {};

    userSnapshot.forEach((doc) => {
      const userData = doc.data();
      const userId = userData.userId;
      if (userId && userData.displayName) {
        userNames[userId] = userData.displayName;
      }
    });

    return userNames;
  } catch (error) {
    console.error("Error fetching user display names:", error);
    throw error;
  }
};

export const getUsersQuery = (userId) => {
  const userCollectionRef = collection(db, USERS);
  return query(userCollectionRef, where('userId', '!=', userId));
}

const MESSAGES = "Messages";

export const getMessagesQuery = (currentUserId, chatPartnerId) => {
  const messagesRef = collection(db, MESSAGES);
  return query(
    messagesRef,
    where("ReceiverUserId", "in", [chatPartnerId, currentUserId]),
    where("SenderUserId", "in", [chatPartnerId, currentUserId]),
    orderBy("SendTime")
  );
};

const GROUPS = "Groups";

export const getGroupsQuery = () => {
  const groupsRef = collection(db, GROUPS);
  return query(
    groupsRef,
    where("Status", "==", 1)
  );
};

const GROUPMESSAGES = "GroupMessages";

export const getGroupMessages = (groupId) => {
  const groupMessagesRef = collection(db, GROUPMESSAGES);
  return query(
    groupMessagesRef,
    where("GroupId", "==", groupId)
  );
};

