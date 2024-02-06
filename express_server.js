const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const urlDatabase = { // default database when server is started TODO: move database into its own file and use fs to update it
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const users = {}; // default database to store user IDs, passwords and emails

const getUserByEmail = function(emailToFind) {
  for (const user in users) {
    const userEmail = users[user].email;
    if (userEmail === emailToFind) {
      return user;
    }
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

const loginValidation = function(loginEmail, loginPassword) {
  const getUserByEmailResult = getUserByEmail(loginEmail);
  if (getUserByEmailResult === false) {
    return "Can't find user with that email!";
  }
  if (users[getUserByEmailResult].password !== loginPassword) {
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
  }
  return string;
};

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

app.get('/urls', (req, res) => { // renders index page when requested
  const templateVars = {
    user: users[req.cookies['user_id']],
    urls: urlDatabase
  };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => { // renders page to create new id. if not logged in, redirects to login page
  if (!req.cookies['user_id']) {
    res.redirect('/login');
  } else {
    const templateVars = {
      user: users[req.cookies['user_id']],
    };
    res.render('urls_new', templateVars);
  }
});

app.get('/register', (req, res) => { // renders page to register for an account. if logged in already, redirects to /urls
  if (req.cookies['user_id']) {
    res.redirect('/urls');
  } else {
    const templateVars = {
      user: users[req.cookies['user_id']],
    };
    res.render('register', templateVars);
  }
});

app.get('/login', (req, res) => { // renders login page. if logged in already, redirects to /urls
  if (req.cookies['user_id']) {
    res.redirect('/urls');
  } else {
    const templateVars = {
      user: users[req.cookies['user_id']],
    };
    res.render('login', templateVars);
  }
});

app.get('/u/:id', (req, res) => { // redirects to longURL when requested for short id, if it exists. otherwise shows 404 message
  if (!urlDatabase[req.params.id]) {
    res.send("404: The requested page doesn't exist");
  } else {
    const longURL = urlDatabase[req.params.id].longURL;
    res.redirect(longURL);
  }
});

app.get('/urls/:id', (req, res) => { // handles get request to render page with generated id
  const templateVars = {
    user: users[req.cookies['user_id']],
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL
  };
  res.render('urls_show', templateVars);
});
// stretch TODO: check if URL already exists in database
app.post('/urls', (req, res) => { // creates short id for given URL and redirects to new page to show result. if not logged in, sends message to user.
  if (!req.cookies['user_id']) {
    res.send('You must be logged in to shorten URLs!');
  } else {
    const shortURLid = generateRandomString();
    urlDatabase[shortURLid] = {};
    urlDatabase[shortURLid].longURL = req.body.longURL;
    res.redirect(`/urls/${shortURLid}`);
  }
});

app.post('/urls/:id/delete', (req, res) => { // handles post request to delete id from database then reroutes to index
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

app.post('/urls/:id', (req, res) => { // changes URL of given ID (edit path)
  urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect('/urls');
});

app.post('/login', (req, res) => { // stores cookie with user login id after validation check
  const loginValidationResult = loginValidation(req.body.email, req.body.password);
  if (loginValidationResult !== true) {
    res.statusCode = 403;
    res.send(loginValidationResult);
  } else {
    const userID = getUserByEmail(req.body.email);
    res.cookie('user_id', userID);
    res.redirect('/urls');
  }
});

app.post('/logout', (req, res) => { // clears cookie storing user_id when logout
  res.clearCookie('user_id');
  res.redirect('/login');
});

app.post('/register', (req, res) => { // adds new user ID with password and email to users object. also stores cookie for ID
  const registrationValidationResult = isValidRegistration(req.body.email, req.body.password);
  if (registrationValidationResult !== true) { // sends appropriate message to user if registration info invalid
    res.statusCode = 400;
    res.send(registrationValidationResult);
  } else { // creates new user if registration info is valid
    const newUserID = generateRandomString();
    users[newUserID] = {};
    users[newUserID].id = newUserID;
    users[newUserID].email = req.body.email;
    users[newUserID].password = req.body.password;
    res.cookie('user_id', newUserID);
    console.log('new data added: ', users);
    res.redirect('/urls');
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});