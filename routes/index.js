var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title:"你浏览过的城市-"+req.signedCookies.citys });
});

module.exports = router;
