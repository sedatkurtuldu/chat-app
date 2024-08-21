import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Platform,
} from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "../screens/LoginScreen";
import HomeScreen from "../screens/HomeScreen";
import { auth } from "../../server/firebase";
import RegisterScreen from "../screens/RegisterScreen";
import ChatsHeaderRight from "../components/ChatsHeaderRight";
import ChatRoomScreen from "../screens/ChatRoomScreen";
import ProfileScreen from "../screens/ProfileScreen";
import AddGroupModalScreen from "../screens/AddGroupModalScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";

const Stack = createStackNavigator();

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

  const logOut = () => {
    auth.signOut();
  };

  return (
    <Stack.Navigator initialRouteName={user ? "HomeScreen" : "LoginScreen"}>
      {user ? (
        <>
          <Stack.Screen
            name="HomeScreen"
            component={HomeScreen}
            options={({ navigation }) => ({
              headerTitle: "Sohbetler",
              headerShadowVisible: false,
              headerTitleAlign: "left",
              headerLeft: () => "",
              headerRight: () => (
                <ChatsHeaderRight userId={user.uid} navigation={navigation} />
              ),
              headerStyle: { backgroundColor: "#8285f1" },
              headerTitleStyle: {
                color: "#fff",
                fontSize: 28,
                fontWeight: "600",
              },
            })}
          />
          <Stack.Screen
            name="ChatRoomScreen"
            component={ChatRoomScreen}
          />
          <Stack.Screen
            name="ProfileScreen"
            component={ProfileScreen}
            options={({ navigation }) => ({
              headerTitle: "",
              headerShadowVisible: false,
              presentation: "modal",
              headerRight: () => (
                <TouchableOpacity
                  style={{
                    backgroundColor: "#6d28d9",
                    padding: 8,
                    borderRadius: 10,
                    marginRight: 10
                  }}
                  activeOpacity={0.8}
                  onPress={logOut}
                >
                  <Text style={{ color: "white" }}>Çıkış Yap</Text>
                </TouchableOpacity>
              ),
            })}
          />
          <Stack.Screen
            name="AddGroupModalScreen"
            component={AddGroupModalScreen}
            options={{
              headerTitle: "Yeni Grup",
              headerTitleAlign: "center",
              headerShadowVisible: false,
              presentation: "modal",
            }}
          />
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
          <Stack.Screen
            name="ForgotPasswordScreen"
            component={ForgotPasswordScreen}
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
