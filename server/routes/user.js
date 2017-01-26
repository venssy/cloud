var express = require('express');
var router = express.Router();

router.get('/user', function(req, res, next) {

  var session = req.session

  if (session.isLogin) {
    res.render('user',{session: req.session});
  } else {
    res.redirect('/login');
  }


});

module.exports = router;