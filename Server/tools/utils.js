const fs = require("fs");
function MongoObjID() {
  const timestamp = ((new Date().getTime() / 1000) | 0).toString(16);
  const suffix = "xxxxxxxxxxxxxxxx".replace(/[x]/g, () => ((Math.random() * 16) | 0).toString(16)).toLowerCase();
  return `${timestamp}${suffix}`;
}
function RandomAlphabet(length, isNumber, isSymbol, isUpper) {
  let result = "";
  let Upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let Lower = "abcdefghijklmnopqrstuvwxyz";
  let Number = "0123456789";
  let symbol = "@#$%^&*_";
  let Character = Lower;
  if (isNumber) {
    Character += Number;
  }
  if (isSymbol) {
    Character += symbol;
  }
  if (isUpper) {
    Character += Upper;
  }
  for (let i = 0; i < length; i++) {
    if (result.length == 0) {
      result += Upper.charAt(Math.floor(Math.random() * Upper.length));
    }
    result += Character.charAt(Math.floor(Math.random() * Character.length));
  }
  return result;
}
function Logger(params) {
  console.log(params);
  fs.appendFile("../log.txt", params + "\n", (err) => {
    if (err) {
      console.log(err);
    }
  });
}
module.exports = { RandomAlphabet, Logger, MongoObjID };
