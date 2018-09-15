var mongoose = require('mongoose');
var { buildSchema } = require('graphql');
var LineItem = require('../models/line_item.js');
var Product = require('../models/product.js');

// Construct a schema, using GraphQL schema language
var lineItemSchema = buildSchema(`

  type LineItemObject {
    _id: String!
    product: String!
    qty: Int!
    total: Float!
  }

  type Query {
    getLineItemById(_id: String!): LineItemObject
    getLineItemsByProductId(productId: String): [LineItemObject]
  }

  type Mutation {
    createLineItem(productId: String!, qty: Int!): LineItemObject
    createLineItems(productIds: [String]!, qtys: [Int]!): [LineItemObject]
    updateLineItem(_id: String!, qty: Int): LineItemObject
    deleteLineItem(_id: String!): Boolean
  }
`);

// If Message had any complex fields, we'd put them on this object.
class LineItemObject {
    constructor(id, total, { productId, qty }) {
        this._id = id;
        this.product = productId;
        this.qty = qty;
        this.total = total;
    }
}

var lineItemRoot = {
    getLineItemById: async ({ _id }) => {
        // find corresponding line item
        var lineItem = await LineItem.findOne({ _id: _id });
        // convert MongoDB ObjectId type to String before returning
        lineItem = lineItem.toObject();
        lineItem._id = lineItem._id.toString();
        lineItem.product = lineItem.product.toString();
        return lineItem;
    },
    getLineItemsByProductId: async ({ productId }) => {
        // find corresponding line item
        if (productId)
            lineItems = await LineItem.find({ product: productId });
        else
            lineItems = await LineItem.find({});            
        // convert MongoDB ObjectId type to String before returning
        var lineItems2 = [];
        lineItems.forEach(function(lineItem){
            let l = lineItem.toObject();
            l._id = l._id.toString();
            l.product = l.product.toString();
            lineItems2.push(l);
        });
        return lineItems2;
    },
    createLineItem: async ({ productId, qty }) => {
        // build new MongoDB LineItem object
        let lineItem = new LineItem({
            product: productId,
            qty: qty,
            total: 0
        });
        // save to DB
        await lineItem.save();
        // add line item to product
        let product = await Product.findOne({ _id: productId });
        console.log(product);
        product.line_items.push(lineItem._id);
        await product.save();
        // convert MongoDB ObjectId type to String before returning
        lineItem = lineItem.toObject();
        lineItem._id = lineItem._id.toString();
        lineItem.product = lineItem.product.toString();
        return lineItem;
    },
    createLineItems: async ({ productIds, qtys }) => {
        // verify input
        if (productIds.length != qtys.length) throw new Error("Invalid input");
        var line_items = [];
        for (let i = 0; i < qtys.length; i++){
            // build new MongoDB LineItem object
            let lineItem = new LineItem({
                product: productIds[i],
                qty: qtys[i],
                total: 0
            });
            // save to DB
            await lineItem.save();
            // add line item to product
            let product = await Product.findOne({ _id: productIds[i] });
            product.line_items.push(lineItem._id);
            await product.save();
            // convert MongoDB ObjectId type to String before returning
            lineItem = lineItem.toObject();
            lineItem._id = lineItem._id.toString();
            lineItem.product = lineItem.product.toString();
            line_items.push(lineItem)
        }
        return line_items;
    },
    updateLineItem: async ({ _id, qty }) => {
        // find line item
        let lineItem = await LineItem.findOne({ _id: _id });
        // edit the line item
        if (qty)
            lineItem.qty = qty;
        // save, note the total parameter gets updated by mongoose middleware
        await lineItem.save();
        // convert MongoDB ObjectId type to String before returning
        lineItem = lineItem.toObject();
        lineItem._id = lineItem._id.toString();
        lineItem.product = lineItem.product.toString();
        console.log(lineItem);
        return lineItem;
    },

    // This should rarely be done!!!
    // Deleting a line item will leave dangling references in Orders and Product
    deleteLineItem: async ({ _id }) => {
        var deleted = false;
        await LineItem.remove({ _id: _id }, function(err, amt) {
            // check if amount of documents deleted > 0
            if (amt.n){
                deleted = true;
            }
        });
        // returns true if a document was deleted
        return deleted;
    }
};

module.exports = { lineItemSchema: lineItemSchema, lineItemRoot: lineItemRoot};