import React, { useState, useEffect } from "react";
import { StyleSheet, View, ActivityIndicator, Text } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/LoginScreen";
import HomeScreen from "../screens/HomeScreen";
import { auth } from "../../server/firebase";
import RegisterScreen from "../screens/RegisterScreen";
import ChatsHeaderRight from "../components/ChatsHeaderRight";
import ChatRoomScreen from "../screens/ChatRoomScreen";

const Stack = createNativeStackNavigator();

const Router = () => {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (initializing) setInitializing(false);
    });

    return unsubscribe;
  }, [initializing]);

  if (initializing) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <Stack.Navigator initialRouteName={user ? "HomeScreen" : "LoginScreen"}>
      {user ? (
        <>
          <Stack.Screen
            name="HomeScreen"
            component={HomeScreen}
            options={{
              headerTitle: "Sohbetler",
              headerShadowVisible: false,
              headerLeft: () => "",
              headerRight: () => <ChatsHeaderRight userId={user.uid} />,
              headerStyle: { backgroundColor: "#8285f1" },
              headerTitleStyle: {
                color: "#fff",
                fontSize: 28,
                fontWeight: "600",
              },
            }}
          />
          <Stack.Screen name="ChatRoomScreen" component={ChatRoomScreen} />
        </>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
