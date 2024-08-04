import {
  collection,
  getDocs,
  where,
  query,
  doc,
  getDoc,
  orderBy,
} from "firebase/firestore";
import { db } from "./firebase";

const USER = "Users";

export const getUser = async (userId) => {
  const userCollectionRef = collection(db, USER);
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
  const userCollectionRef = collection(db, USER);
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

export const getMessagesQuery = (currentUserId, chatPartnerId) => {
  const messagesRef = collection(db, "Messages");
  return query(
    messagesRef,
    where("ReceiverUserId", "in", [chatPartnerId, currentUserId]),
    where("SenderUserId", "in", [chatPartnerId, currentUserId]),
    orderBy("SendTime")
  );
};