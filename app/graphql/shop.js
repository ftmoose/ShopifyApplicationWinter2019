var mongoose = require('mongoose');
var { buildSchema } = require('graphql');
var Shop = require('../models/shop.js');
var Order = require('../models/order.js');
var Product = require('../models/product.js');
var LineItem = require('../models/line_item');

var shopSchema = buildSchema(`

  type ShopObject {
    _id: String!
    name: String!
    info: String!
    products: [String]!
    orders: [String]!
  }

  type Query {
	getShop(_id: String!): ShopObject
	getShopsByName(name: String): [ShopObject]
  }

  type Mutation {
    createShop(name: String!, info: String!): ShopObject
	updateShop(_id: String!, name: String, info: String): ShopObject
    deleteShop(_id: String!): Boolean
  }
`);

class ShopObject {
    constructor(id, { name, info }) {
        this._id = id;
        this.name = name;
        this.info = info;
    }
}

var shopRoot = {
    getShop: async ({ _id, populate }) => {
		console.log("Herrrre");
		// find shop
		let shop = await Shop.findOne({_id: _id});
		// convert MongoDB ObjectId type to String before returning
		shop = shop.toObject();
		shop._id = shop._id.toString();
		for (var i = 0; i < shop.products.length; i++){
			shop.products[i] = shop.products[i].toString();
		}
		for (var i = 0; i < shop.orders.length; i++) {
			shop.orders[i] = shop.orders[i].toString();
		}
		return shop;
	},
	getShopsByName: async ({ name }) => {
		// find shops
		var shops
		if (name)
			shops = await Shop.find({ name: name });
		else
			shops = await Shop.find({});
		// convert MongoDB ObjectId type to String before returning
		let shops2 = [];
		shops.forEach(function(shop){
			let s = shop.toObject();
			s._id = s._id.toString();
			for (var i = 0; i < s.products.length; i++) {
				s.products[i] = s.products[i].toString();
			}
			for (var i = 0; i < shop.orders.length; i++) {
				s.orders[i] = s.orders[i].toString();
			}
			shops2.push(s);
		});
		return shops2;
	},
	createShop: async ({ name, info }) => {
		// build new MongoDB shop object
		let shop = new Shop({
			name: name,
			info: info,
			products: [],
			orders: []
		});
		// save to DB
		await shop.save();
		// convert MongoDB ObjectId type to String before returning
		shop = shop.toObject();
		shop._id = shop._id.toString();
		for (var i = 0; i < shop.products.length; i++) {
			shop.products[i] = shop.products[i].toString();
		}
		for (var i = 0; i < shop.orders.length; i++) {
			shop.orders[i] = shop.orders[i].toString();
		}
		return shop;
	},
	updateShop: async ({ _id, name, info }) => {
		// find the shop
		let shop = await Shop.findOne({ _id: _id });
		// update values
		if (name)
			shop.name = name;
		if (info)
			shop.info = info;
		// save
		await shop.save();
		// convert MongoDB ObjectId type to String before returning
		shop = shop.toObject();
		shop._id = shop._id.toString();
		for (var i = 0; i < shop.products.length; i++) {
			shop.products[i] = shop.products[i].toString();
		}
		for (var i = 0; i < shop.orders.length; i++) {
			shop.orders[i] = shop.orders[i].toString();
		}
		return shop;
	},
	deleteShop: async ({ _id }) => {
		// find the shop
		let shop = await Shop.findOne({ _id: _id });
		// delete all shop's orders
		let orders = shop.orders.slice();
		for (var i = 0; i < orders.length; i++){
			await Order.remove({ _id: shop.orders[i] });
		}
		// delete all shop's line_items
		shop.products.forEach(async function(product){
			await LineItem.remove({product: product});
		});
		// delete all shop's products
		let products = shop.products.slice();
		for (var i = 0; i < products.length; i++) {
			await Product.remove({ _id: shop.products[i] });
		}

		// delete shop
		var deleted = false;
		await Shop.remove({ _id: shop._id }, function(err, amt){
			// check if amount of documents deleted > 0
			if (amt.n) {
				deleted = true;
			}
		});
		return deleted;
	}
};

module.exports = {shopSchema: shopSchema, shopRoot: shopRoot};