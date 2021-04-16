const getUserByEmail = function(email, database) {
  const userKeys = Object.keys(database);
  for (const key of userKeys) {
    if (database[key].email === email) {
      const user = database[key];
      return user;
    }
  }
  return undefined;
};

module.exports = { getUserByEmail };