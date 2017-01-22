var express = require('express');
var router = express.Router();

var file = require('./file')
var animes = require('./animes')

router.use(file)
router.use(animes)

require('./userTest')

module.exports = router;