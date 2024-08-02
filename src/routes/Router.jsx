import React, { useState, useEffect } from "react";
import { StyleSheet } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/LoginScreen";
import HomeScreen from "../screens/HomeScreen";
import { auth } from "../../server/firebase";
import RegisterScreen from "../screens/RegisterScreen";

const Stack = createNativeStackNavigator();

const Router = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user) setUser(user);
      else setUser(null);
    });
  }, []);

  return (
    <Stack.Navigator>
      {user ? (
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
      ) : (
        <>
          <Stack.Screen
            name="LoginScreen"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="RegisterScreen"
            component={RegisterScreen}
            options={{ headerShown: false }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

export default Router;

const styles = StyleSheet.create({});
