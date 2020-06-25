const user = require('../../config/user');

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
