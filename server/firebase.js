// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore, initializeFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
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
  persistence: getReactNativePersistence(AsyncStorage)
});

const storage = getStorage(app);

export { db, storage, auth };
