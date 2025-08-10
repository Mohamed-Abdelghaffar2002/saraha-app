import CryptoJS from "crypto-js";
export const generateEncryption =async ({plaintext="",secretKey="secretKey"}= {}) => {
    return CryptoJS.AES.encrypt(plaintext, secretKey).toString();
}
export const generateDecryption =async ({cipherText="",secretKey="secretKey"}= {}) => {
    return CryptoJS.AES.decrypt(cipherText, secretKey).toString(CryptoJS.enc.Utf8);
}