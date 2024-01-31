const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

const urlDatabase = { // default database when server is started TODO: move database into its own file and use fs to update it
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get('/urls', (req, res) => { // renders index page when requested
  const templateVars = {urls: urlDatabase};
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => { // renders page to create new id when requested
  res.render("urls_new");
});

app.get("/u/:id", (req, res) => { // redirects to longURL when requested for short id, if it exists. otherwise shows 404 message
  if (!urlDatabase[req.params.id]) {
    res.send("404: The requested page doesn't exist");
  } else {
    const longURL = urlDatabase[req.params.id];
    res.redirect(longURL);
  }
});

app.get("/urls/:id", (req, res) => { // handles get request to render page with generated id
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});
// stretch TODO: check if URL already exists in database
app.post("/urls", (req, res) => { // creates short id for given URL and redirects to new page to show result
  const shortURLid = generateRandomString();
  urlDatabase[shortURLid] = req.body.longURL;
  res.redirect(`/urls/${shortURLid}`);
});

app.post("/urls/:id/delete", (req, res) => { // handles post request to delete id from database then reroutes to index
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
})

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect('/urls');
})

app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect('/urls');
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});