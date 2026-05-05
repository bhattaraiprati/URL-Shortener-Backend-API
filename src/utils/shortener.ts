const CHARACTERS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const LENGTH = 6;

export function generateShortCode(): string {
  let result = '';
  for (let i = 0; i < LENGTH; i++) {
    result += CHARACTERS.charAt(Math.floor(Math.random() * CHARACTERS.length));
  }
  return result;
}


// const crypto = require("crypto");

// const BASE62_CHARS =
//   "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

// export function generateShortCode(url:string): string {
//   const hashBuffer = crypto
//     .createHash("sha256")
//     .update(url, "utf8")
//     .digest(); 
//     let value = BigInt(0);
//     for (let i = 0; i < 6; i++) {
//       value = (value << BigInt(8)) | BigInt(hashBuffer[i]);
//     }

//   let alias = "";
//   const base = BigInt(62);
//   for (let i = 0; i < 6; i++) {
//     alias = BASE62_CHARS[Number(value % base)] + alias;
//     value = value / base;
//   }
//   return alias;
// }