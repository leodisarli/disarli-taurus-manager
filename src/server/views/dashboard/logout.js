function handler(req, res) {
    req.session.destroy();
    res.redirect('/');
    return;
}

module.exports = handler;
