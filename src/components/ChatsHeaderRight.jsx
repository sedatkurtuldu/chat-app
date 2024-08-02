import { Image, StyleSheet, View, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import { getUser } from "../../server/api";

const ChatsHeaderRight = ({ userId }) => {
  const [imageUrl, setImageUrl] = useState("https://www.mountsinai.on.ca/wellbeing/our-team/team-images/person-placeholder/image");
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

  return (
    <View className="justify-center items-center">
      {loading ? (
        <ActivityIndicator size="small" color="#0000ff" />
      ) : (
        <Image
          className="w-10 h-10 rounded-3xl"
          source={{ uri: imageUrl }}
        />
      )}
    </View>
  );
};

export default ChatsHeaderRight;
