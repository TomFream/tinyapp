const express = require("express");
const bodyParser = require("body-parser");
const { getUserByEmail, generateRandomString } = require("./helpers");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const app = express();
const PORT = 8080;

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['Test key one', 'Test key two'],
}));
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", userID: "userRandomID"},
  "9sm5xK": {longURL: "http://www.google.com", userID: "user2RandomID"}
};

const users = {
  //Testing user - Password: test
  JK4biq: {
    id: 'JK4biq',
    email: 'test@test',
    password: '$2b$10$zGBN6gC6OTE4XWZDnrYfXOvFdf3Ya8/z/.W6U22RFwlKreJjtAefy'
  }
};

// Returns URLs from database that belong to specified user
const urlsForUser = function(id) {
  const databaseKeys = Object.keys(urlDatabase);
  let parsedDatabase = {};

  for (const key of databaseKeys) {
    if (urlDatabase[key].userID === id) {
      parsedDatabase[key] = urlDatabase[key];
    }
  }
  return parsedDatabase;
};

// Login/logout and registration handlers
app.get("/register", (req, res) => {
  if (req.session.user_id) {
    return res.redirect("/urls");
  }
  const templateVars = {
    user: users[req.session.user_id]
  };
  res.render("registration", templateVars);
});

app.post("/register", (req, res) => {
  if (req.body.email === '' || req.body.password === '') {
    return res.status(400).send(
      '400: Username or password field cannot be empty'
    );
  }

  const newUserId = generateRandomString();
  const newUserEmail = req.body.email;
  const newUserPassword = req.body.password;
  const hashedPassword = bcrypt.hashSync(newUserPassword, 10);
  
  if (getUserByEmail(newUserEmail, users)) {
    return res.status(400).send('400: Email already in use');
  }

  users[newUserId] = {
    id: newUserId,
    email: newUserEmail,
    password: hashedPassword
  };
  req.session.user_id = newUserId;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const user_id = getUserByEmail(req.body.email, users);
  if (user_id && bcrypt.compareSync(req.body.password, user_id.password)) {
    req.session.user_id = user_id.id;
    res.redirect('/urls');
    return;
  }
  return res.status(403).send('403: Authentication Falied');
});

app.get("/login", (req, res) => {
  if (req.session.user_id) {
    return res.redirect("/urls");
  }
  const templateVars = {
    user: users[req.session.user_id]
  };
  res.render("login", templateVars);
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

// Url page handlers
app.get("/", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  }

  if (!req.session.user_id) {
    res.redirect("/login");
  }
});

app.get("/urls", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
    urls: urlsForUser(req.session.user_id) };
  res.render("urls_index", templateVars);
});

app.post("/urls/:shortUrl/delete", (req, res) => {
  if (req.session.user_id === urlDatabase[req.body.shortURL].userID) {
    delete urlDatabase[req.body.shortURL];
  }
  res.redirect('/urls');
});

app.post("/urls/:url/edit", (req, res) => {
  const urlToUpdate = req.params.url;
  const newURL = req.body.longURL;
  if (req.session.user_id === urlDatabase[urlToUpdate].userID) {
    urlDatabase[urlToUpdate].longURL = newURL;
  }
  res.redirect('/urls');
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  };
  if (!templateVars.user) {
    res.redirect("/login");
  }
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  const newShortUrl = generateRandomString();
  urlDatabase[newShortUrl] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  };
  res.redirect(`/urls/${newShortUrl}`);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    user: '',
    shortURL: '',
    longURL: ''
  };

  if (!urlDatabase[req.params.shortURL]) {
    return res.status(404).send('404: Resource does not exist');
  }

  if (urlDatabase[req.params.shortURL].userID !== req.session.user_id) {
    templateVars.user = null;
    return res.render("urls_show", templateVars);
  }
  
  templateVars.user = users[req.session.user_id];
  templateVars.shortURL = req.params.shortURL;
  templateVars.longURL = urlDatabase[req.params.shortURL].longURL;
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    return res.status(404).send('404: Resource does not exist');
  }
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.get("/urls.json", (req, res) => {
  res.json(urlsForUser(req.session.user_id));
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});