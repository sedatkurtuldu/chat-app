import { Image, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { getUser } from '../../server/api';

const ChatsHeaderRight = ({ userId }) => {
    const [imageUrl, setimageUrl] = useState("");

    const getUserImage = async () => {
        const user = await getUser(userId);
        setimageUrl(user.profileImage);
    }

    useEffect(() => {
     getUserImage();
    }, [])
    
  return (
    <View className="justify-center items-center">
      <Image className="w-10 h-10 rounded-3xl" source={{ uri: imageUrl }} />
    </View>
  )
}

export default ChatsHeaderRight

const styles = StyleSheet.create({})