function handler(req, res) {
  if (req.session.loggedin) {
    res.redirect('/list');
    return;
  }
  return res.render('dashboard/templates/login');
}

module.exports = handler;
