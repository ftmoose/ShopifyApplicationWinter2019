var mongoose = require('mongoose');
var { buildSchema } = require('graphql');
var Order = require('../models/order.js');
var Shop = require('../models/shop.js')

var orderSchema = buildSchema(`

  type OrderObject {
    _id: String!
    date: String!
    shop: String!
    line_items: [String]!
    total: Float!
    refunded: Boolean!
  }

  type Query {
    getOrderById(_id: String!): OrderObject
    getOrdersByShopId(shopId: String): [OrderObject]
  }

  type Mutation {
    createOrder(shopId: String!, line_items: [String]!): OrderObject
    refundOrder(_id: String!): OrderObject
  }
`);

class OrderObject {
    constructor(id, { shop }) {
        this._id = id;
        this.shop = shop;
        this.refunded = false;
    }
}

var orderRoot = {
    getOrderById: async ({ _id }) => {
        // find order
        let order = await Order.findOne({ _id });
        // convert MongoDB ObjectId type to String before returning
        order = order.toObject();
        order._id = order._id.toString();
        order.shop = order.shop.toString();
        for (var i = 0; i < order.line_items.length; i++) {
            order.line_items[i] = order.line_items[i].toString();
        }
        // convert date to string
        order.date = order.date.toString();
        return order;
    },
    getOrdersByShopId: async ({ shopId }) => {
        // find orders
        var orders;
        if (shopId)
            orders = await Order.find({ shop: shopId });
        else
            orders = await Order.find({});
        // convert MongoDB ObjectId type to String before returning
        orders2 = []
        orders.forEach(function(order){
            o = order.toObject();
            o._id = o._id.toString();
            o.shop = o.shop.toString();
            for (var i = 0; i < o.line_items.length; i++) {
                o.line_items[i] = o.line_items[i].toString();
            }
            // convert date to string
            o.date = o.date.toString();
            orders2.push(o);
        });
        return orders2;
    },
    createOrder: async ({ shopId, line_items }) => {
        // build new mongo Order object
        let order = new Order({
            date: new Date(),
            shop: shopId,
            line_items: line_items,
            total: 0,
            refunded: false
        });
        // save to DB
        await order.save();
        // add order to shop
        let shop = await Shop.findOne({ _id: shopId });
        shop.orders.push(order._id);
        shop.save();
        // convert MongoDB ObjectId type to String before returning
        order = order.toObject();
        order._id = order._id.toString();
        order.shop = order.shop.toString();
        for (var i = 0; i < order.line_items.length; i++){
            order.line_items[i] = order.line_items[i].toString();
        }
        // convert date to string
        order.date = order.date.toString();
        return order;
    },
    refundOrder: async ({ _id }) => {
        // find the order
        let order = await Order.findOne({ _id });
        // set refunded to true
        order.refunded = true;
        // save order
        await order.save();
        // convert MongoDB ObjectId type to String before returning
        order = order.toObject();
        order._id = order._id.toString();
        order.shop = order.shop.toString();
        for (var i = 0; i < order.line_items.length; i++) {
            order.line_items[i] = order.line_items[i].toString();
        }
        // convert date to string
        order.date = order.date.toString();
        return order;
    }
};

module.exports = { orderSchema: orderSchema, orderRoot: orderRoot };