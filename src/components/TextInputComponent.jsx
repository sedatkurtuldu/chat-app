import { View, TextInput } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";

const TextInputComponent = ({
  placeholder,
  iconName,
  setLoginEmail,
  setLoginPassword,
  setRegisterUserName,
  setRegisterEmail,
  setRegisterPassword,
  value,
}) => {
  const onChangeText = (text) => {
    if (setLoginEmail && placeholder === "E-Posta") {
      setLoginEmail(text);
    } else if (setLoginPassword && placeholder === "Parola") {
      setLoginPassword(text);
    } else if (setRegisterEmail && placeholder === "E-Posta") {
      setRegisterEmail(text);
    } else if (setRegisterPassword && placeholder === "Parola") {
      setRegisterPassword(text);
    } else if (setRegisterUserName && placeholder === "Kullanıcı Adı") {
      setRegisterUserName(text);
    }
  };

  return (
    <View className="flex flex-row items-center justify-center bg-gray-100 rounded-md p-2 w-11/12 my-2.5">
      <AntDesign name={iconName} size={24} color="#6b7280" className="mr-2" />
      <TextInput
        className="flex-1 text-sm p-2"
        multiline={placeholder !== "Parola" ? true : false}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor="#6b7280"
        placeholder={placeholder}
        secureTextEntry={placeholder === "Parola"}
      />
    </View>
  );
};

export default TextInputComponent;