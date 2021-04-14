const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs");


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

const generateRandomString = function () {
  var randomString = [];
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  
  for ( var i = 0; i < 6; i++ ) {
    randomString.push(characters.charAt(Math.floor(Math.random() * charactersLength)));
 }
 return randomString.join('');
};

const emailLookup = function (email) {
  const userKeys = Object.keys(users);
  for (const key of userKeys) {
    if (users[key].email === email) {
      return users[key].id;
    }
  }
  return false;
};


app.get("/", (req, res) => {
  res.send("Hello!");
});

// Login/logout and registration handlers
app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render("registration", templateVars);
});

app.post("/register", (req, res) => {
  // console.log("registration form body: ", req.body)
  if (req.body.email === '' || req.body.password === '') {
    return res.status(400).send(
      '400: Username or password field cannot be empty'
   );
  };

  const newUserId = generateRandomString();
  const newUserEmail = req.body.email;
  const newUserPassword = req.body.password;
  
  if (emailLookup(newUserEmail)) {
    return res.status(400).send(
      '400: Email already in use'
   );
  };

  users[newUserId] = {
    id: newUserId,
    email: newUserEmail,
    password: newUserPassword
  };
  console.log("Users object: ", users);
  res.cookie('user_id', newUserId);
  res.redirect("/urls")
});

app.post("/login", (req, res) => {
  console.log("Body of login request: ", req.body);
  
  const user_id = emailLookup(req.body.email);
  if (user_id){ 
    res.cookie('user_id', user_id);
    res.redirect('/urls');
    return;  
  }
  res.redirect('/urls')
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

// Url pages
app.get("/urls", (req, res) => {
  const templateVars = { 
    user: users[req.cookies["user_id"]],
    urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.post("/urls/:shortUrl/delete", (req, res) => {
  console.log("delete request: ", req.body);
  delete urlDatabase[req.body.shortURL];
  res.redirect('/urls');
});

app.post("/urls/:url/edit", (req, res) => {
  console.log("Updated url: ", req.body.longURL);
  console.log("Requesting shortURL: ", req.params.url);
  const urlToUpdate = req.params.url;
  const newURL = req.body.longURL;
  urlDatabase[urlToUpdate] = newURL;
  res.redirect('/urls');
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  }
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  const newShortUrl = generateRandomString();
  urlDatabase[newShortUrl] = req.body.longURL;
  console.log(urlDatabase);  // Log the POST request body to the console
  // res.send("Ok");         // Respond with 'Ok' (we will replace this)
  res.redirect(`/urls/${newShortUrl}`);
});

app.get("/urls/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const templateVars = { 
      user: users[req.cookies["user_id"]],
      shortURL: req.params.shortURL, 
      longURL: urlDatabase[req.params.shortURL]};
    res.render("urls_show", templateVars);
    } else {
      res.send("Error: url not")
    }
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});