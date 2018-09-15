var express = require('express');
var router = express.Router();
var Shop = require('../models/shop.js');

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index');
});

// /* GET shop page. */
// router.get('/shop/:id', async function (req, res, next) {
// 	// render shop page with all shops
// 	let shop = await Shop.findOne({ _id: req.params.id }).populate('products');
// 	if (!shop)
// 		next();
// 	res.render('shop', { shop, cart });
// });

module.exports = router;
