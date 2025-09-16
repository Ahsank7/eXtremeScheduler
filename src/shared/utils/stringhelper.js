const removeSpaceFromString = (value) => {
  if (!value) return "";

  return value.replace(/\s/g, "");
};

// const getCharactersFromString = (value, charCount) => {
//   if (!value) return "";
// };

export { removeSpaceFromString };
