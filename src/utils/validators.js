const validatePeriod = (period) => {
  const validPeriods = ["day", "week", "month", "year"];
  return validPeriods.includes(period);
};

const validateLimit = (limit) => {
  return Number.isInteger(limit) && limit > 0 && limit <= 100;
};

module.exports = {
  validatePeriod,
  validateLimit,
};
