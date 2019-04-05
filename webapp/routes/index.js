var express = require('express');
var io = require('../io');
var router = express.Router();
/* GET home page. */
router.get('/', function(req, res, next) {
//	console.log("-" + JSON.stringify(io.controls,null,4));
	res.render('index', { layout: 'layout', controls: io.controls, title: 'DRAWS™ Manager', stats: io.systemstats});
});


router.get('/application-support', function(req, res, next) {
//	console.log("-" + JSON.stringify(io.drawsapps,null,4));
	res.render('app-support', { layout: 'layout', controls: io.controls, title: 'Application Help', stats: io.systemstats, drawsapps: io.drawsapps});
});

module.exports = router;

