var express = require('express');
var io = require('../io');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	console.log("-" + JSON.stringify(io.controls,null,4));
	res.render('index', { layout: 'layout', controls: io.controls, title: 'DRAWS™ Manager', stats: io.systemstats});
});

module.exports = router;

