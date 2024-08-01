import { StyleSheet, Text, TextInput, View } from 'react-native'
import React from 'react'
import AntDesign from '@expo/vector-icons/AntDesign';

const TextInputComponent = ({ placeholder, iconName }) => {
  return (
    <View className="flex-row bg-gray-100 w-11/12 my-2 rounded-xl">
        <View className="p-3.5">
            <AntDesign name={iconName} size={24} color="#6b7280" />
        </View>
      <TextInput placeholderTextColor="#6b7280"  placeholder={placeholder} />
    </View>
  )
}

export default TextInputComponent

const styles = StyleSheet.create({})