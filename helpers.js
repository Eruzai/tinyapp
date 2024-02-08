const bcrypt = require('bcryptjs'); // password hashing

const getUserByEmail = function(emailToFind, database) { // find user in the database that matches the given email
  for (const user in database) {
    const userEmail = database[user].email;
    if (userEmail === emailToFind) {
      return user;
    }
  }
  return undefined;
};

const urlsForUser = function(id, database) { // return the URLs in the database that a user has created
  const urls = {};
  for (const shortURL in database) {
    const userWhoCreatedURL = database[shortURL].userID;
    const longURLForShortURL = database[shortURL].longURL;
    if (userWhoCreatedURL === id) {
      urls[shortURL] = longURLForShortURL;
    }
  }
  return urls;
};

const userOwnsShortURL = function(ID, URL, database) { // return true or false dependant on if the user owns the URL
  if (database[URL].userID === ID) {
    return true;
  }
  return false;
};

const isValidRegistration = function(email, password) { // checks for empty password or email fields and if a user already has the email
  if (email === '' || password === '') {
    return "Both of the email and password forms must not be empty!";
  }
  if (getUserByEmail(email)) {
    return "That email is being used by someone else, please choose another!";
  }
  return true;
};

const loginValidation = function(loginEmail, loginPassword, database) { // checks if email exists within the database, then checks stored password of that email to login password
  const getUserByEmailResult = getUserByEmail(loginEmail, database);
  if (getUserByEmailResult === undefined) {
    return "Can't find user with that email!";
  }
  if (!bcrypt.compareSync(loginPassword, database[getUserByEmailResult].password)) {
    return "Incorrect password given!";
  }
  return true;
};

const generateRandomString = function() { // used to generate short URL id
  let string = "";
  while (string.length < 6) {
    const randomNum = Math.floor(Math.random() * 62); // generates a random number between 0 and 61 (let 0-9 be numbers, 10-35 be upper case letters, 36-61 be lower case letters)
    if (randomNum < 10) {
      const num = randomNum + 48; // utf16 numbers start at 48
      string += String.fromCodePoint(num);
    } else if (randomNum < 36) {
      const num = randomNum + 55; // utf16 upper case letters start at 65 (10 + 55)
      string += String.fromCodePoint(num);
    } else {
      const num = randomNum + 61; // utf16 lower case letters start at 97 (61 + 36)
      string += String.fromCodePoint(num);
    }
  };
  return string;
};

module.exports = {
  getUserByEmail,
  urlsForUser,
  userOwnsShortURL,
  isValidRegistration,
  loginValidation,
  generateRandomString
};