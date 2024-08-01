import * as CryptoJS from "crypto-js";

export const hashPassword = async (password) => {
  const hashedPassword = CryptoJS.SHA256(password).toString();
  return hashedPassword;
};

export const verifyPassword = async (password, hashedPassword) => {
  const hashedInputPassword = CryptoJS.SHA256(password).toString();
  return hashedInputPassword === hashedPassword;
};
