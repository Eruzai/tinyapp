const express = require('express');
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs'); // password hashing
const {
  getUserByEmail,
  urlsForUser,
  userOwnsShortURL,
  isValidRegistration,
  loginValidation,
  generateRandomString } = require('./helpers');

const app = express();
const PORT = 8080; // default port 8080

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieSession({ name: 'user_id', keys: ['key1', 'key2']}));

const urlDatabase = { // default database when server is started
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const users = {}; // default database to store user IDs, passwords and email addresses

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
    user: users[req.session.user_id],
    urls: urlsForUser(req.session.user_id, urlDatabase)
  };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => { // renders page to create new id. if not logged in, redirects to login page
  if (!req.session.user_id) {
    res.redirect('/login');
  } else {
    const templateVars = {
      user: users[req.session.user_id],
    };
    res.render('urls_new', templateVars);
  }
});

app.get('/register', (req, res) => { // renders page to register for an account. if logged in already, redirects to /urls
  if (req.session.user_id) {
    res.redirect('/urls');
  } else {
    const templateVars = {
      user: users[req.session.user_id],
    };
    res.render('register', templateVars);
  }
});

app.get('/login', (req, res) => { // renders login page. if logged in already, redirects to /urls
  if (req.session.user_id) {
    res.redirect('/urls');
  } else {
    const templateVars = {
      user: users[req.session.user_id],
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

app.get('/urls/:id', (req, res) => { // handles get request to render page with generated id, if it exists. only renders the urls owned by the user
  if (!urlDatabase[req.params.id]) {
    res.send("404: The requested page doesn't exist");
  } else {
    const templateVars = {
      user: users[req.session.user_id],
      id: req.params.id,
      longURL: urlDatabase[req.params.id].longURL,
      userOwnsURLResult: userOwnsShortURL(req.session.user_id, req.params.id, urlDatabase)
    };
    res.render('urls_show', templateVars);
  }
});

app.post('/urls/:id/delete', (req, res) => { // handles post request to delete id from database then reroutes to index but only if you are logged in and own the URL
  if (!req.session.user_id) {
    res.send('You must be logged in to shorten URLs!');
  } else if (!userOwnsShortURL(req.session.user_id, req.params.id, urlDatabase)){
    res.send('You can not delete URLs that you do not own');
  } else {
    delete urlDatabase[req.params.id];
    res.redirect('/urls');
  }
});

app.post('/urls/:id', (req, res) => { // changes URL of given ID (edit path) but only if logged in and you own the URL
  if (!req.session.user_id) {
    res.send('You must be logged in to shorten URLs!');
  } else if (!userOwnsShortURL(req.session.user_id, req.params.id, urlDatabase)){
    res.send('You can not delete URLs that you do not own');
  } else {
    urlDatabase[req.params.id].longURL = req.body.longURL;
    res.redirect('/urls');
  }
});
// stretch TODO: check if URL already exists in database
app.post('/urls', (req, res) => { // creates short id for given URL and redirects to new page to show result. if not logged in, sends message to user.
  if (!req.session.user_id) {
    res.send('You must be logged in to shorten URLs!');
  } else {
    const shortURLid = generateRandomString();
    urlDatabase[shortURLid] = {};
    urlDatabase[shortURLid].longURL = req.body.longURL;
    urlDatabase[shortURLid].userID = req.session.user_id;
    res.redirect(`/urls/${shortURLid}`);
  }
});

app.post('/login', (req, res) => { // stores cookie with user login id after validation check
  const loginValidationResult = loginValidation(req.body.email, req.body.password, users);
  if (loginValidationResult !== true) {
    res.statusCode = 403;
    res.send(loginValidationResult);
  } else {
    const userID = getUserByEmail(req.body.email, users);
    req.session.user_id = userID;
    res.redirect('/urls');
  }
});

app.post('/logout', (req, res) => { // clears cookie storing user_id when logout
  req.session['user_id'] = null;
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
    users[newUserID].password = bcrypt.hashSync(req.body.password, 10);
    req.session.user_id = newUserID;
    res.redirect('/urls');
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});