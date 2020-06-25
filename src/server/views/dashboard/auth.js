require('dotenv').config();
const user = {
  user: process.env.TAURUS_MANAGER_USER,
  pass: process.env.TAURUS_MANAGER_PASS,
}

function handler(req, res) {
  var username = req.body.username;
  var password = req.body.password;
  if (username == user.user && password == user.pass) {
    req.session.loggedin = true;
    req.session.username = username;
    res.redirect('/list');
    return;
  }
  res.redirect('/');
  return;
}

module.exports = handler;
