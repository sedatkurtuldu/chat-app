import {
  collection,
  getDocs,
  where,
  query,
  doc,
  getDoc,
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
