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
  const userDocRef = doc(db, USER, userId);

  const docSnapshot = await getDoc(userDocRef);

  if (docSnapshot.exists()) {
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
