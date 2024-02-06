const getUserByEmail = function(emailToFind, database) { // find user in the database that matches the given email
  for (const user in database) {
    const userEmail = database[user].email;
    if (userEmail === emailToFind) {
      return user;
    }
  }
  return undefined;
};

module.exports = { getUserByEmail };