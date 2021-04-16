// Takes in an email and database and returns user id
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

// Creates random 6 character string for user id and short URL
const generateRandomString = function() {
  let randomString = [];
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  
  for (let i = 0; i < 6; i++) {
    randomString.push(characters.charAt(Math.floor(Math.random() * charactersLength)));
  }
  return randomString.join('');
};

module.exports = { getUserByEmail, generateRandomString };