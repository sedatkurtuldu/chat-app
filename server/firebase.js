// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { initializeAuth, getReactNativePersistence } from '@firebase/auth';
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC6iSibqIy_Snl_Vn6UKOQ1nNzL2zntdrQ",
  authDomain: "chat-app-95ba0.firebaseapp.com",
  projectId: "chat-app-95ba0",
  storageBucket: "chat-app-95ba0.appspot.com",
  messagingSenderId: "587442359402",
  appId: "1:587442359402:web:c66b584bbae091d2bece13",
  measurementId: "G-V82EZQM59J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

const storage = getStorage(app);

export { db, storage, auth };