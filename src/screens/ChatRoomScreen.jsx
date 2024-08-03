import {
  Image,
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useLayoutEffect, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import ChatComponent from "../components/ChatComponent";

const ChatRoomScreen = ({ route, navigation }) => {
  const { displayName, profileImage } = route.params;
  
  const scrollViewRef = useRef(null);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }
    );

    return () => {
      keyboardDidShowListener.remove();
    };
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: displayName,
      headerLeft: () => (
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mr-4"
          >
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Image
            height={38}
            width={38}
            source={{ uri: profileImage }}
            className="rounded-full mr-3 items-center"
          />
        </View>
      ),
    });
  }, [navigation, displayName, profileImage]);

  return (
    <View className="flex-1">
      <ScrollView
        className="flex-1"
        ref={scrollViewRef}
        contentContainerStyle={{
          paddingBottom: Platform.OS === "ios" ? 60 : 80,
        }}
      >
        <ChatComponent />
      </ScrollView>
      <View className="bg-white absolute bottom-0 left-0 right-0 border border-gray-300 rounded-full flex-row justify-between items-center m-3">
        <TextInput
          placeholder="Mesaj Yaz"
          className="p-3 ml-2 w-10/12"
          multiline={true}
        />
        <TouchableOpacity activeOpacity={0.8}>
          <MaterialCommunityIcons
            style={{ marginRight: 10 }}
            name="send-circle"
            size={36}
            color="#6b21a8"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ChatRoomScreen;

const styles = StyleSheet.create({});
