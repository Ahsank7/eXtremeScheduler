const getRowNumber = (pageSize, pageNumber, index) => {
  return (pageNumber - 1) * pageSize + (index + 1);
};

const isValidGUID = (guid) => {
  const guidRegex =
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[4|5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
  return guidRegex.test(guid);
};

const formatCurrency = (amount, currencySign = '$') => {
  if (amount === null || amount === undefined) return `${currencySign}0.00`;
  return `${currencySign}${parseFloat(amount).toFixed(2)}`;
};

export { getRowNumber, isValidGUID, formatCurrency };
