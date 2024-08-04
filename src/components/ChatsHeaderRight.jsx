import {
  Image,
  StyleSheet,
  View,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import { getUser } from "../../server/api";

const ChatsHeaderRight = ({ userId, navigation }) => {
  const [imageUrl, setImageUrl] = useState(
    "https://www.mountsinai.on.ca/wellbeing/our-team/team-images/person-placeholder/image"
  );
  const [loading, setLoading] = useState(false);

  const getUserImage = async () => {
    try {
      const user = await getUser(userId);
      setImageUrl(user?.profileImage);
    } catch (error) {
      console.error("Error fetching user image:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUserImage();
  }, [userId]);

  const navigateToProfile = () => {
    navigation.navigate("ProfileScreen", { imageUrl: imageUrl, userId: userId });
  };

  return (
    <View className="justify-center items-center">
      {loading ? (
        <ActivityIndicator size="small" color="#0000ff" />
      ) : (
        <TouchableOpacity activeOpacity={0.8} onPress={navigateToProfile}>
          <Image className="w-10 h-10 rounded-3xl" source={{ uri: imageUrl }} />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default ChatsHeaderRight;
