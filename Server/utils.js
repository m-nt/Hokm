module.exports = {};

function RandomAlphabet(length, isNumber, isSymbol, isUpper) {
  let result = "";
  let Upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let Lower = "abcdefghijklmnopqrstuvwxyz";
  let Number = "0123456789";
  let symbol = "@#$%^&*";
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
    result += Character.charAt(Math.floor(Math.random() * Character.length));
  }
  return result;
}
