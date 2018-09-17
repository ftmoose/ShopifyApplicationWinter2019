var mongoose = require('mongoose');
var { buildSchema } = require('graphql');
var Product = require('../models/product.js');
var Shop = require('../models/shop.js');

var productSchema = buildSchema(`

  type ProductObject {
    _id: String!
    name: String!
    price: Float!
    line_items: [String]!
    archived: Boolean
  }

  type Query {
    getProductById(_id: String!): ProductObject
    getProductsByName(name: String): [ProductObject]
  }

  type Mutation {
    createProduct(name: String!, price: Float!, shopId: String): ProductObject
    updateProduct(_id: String!, name: String, price: Float): ProductObject
    archiveProduct(_id: String!): ProductObject
    unarchiveProduct(_id: String!): ProductObject
    deleteProduct(_id: String!, verification: Boolean!): Boolean
  }
`);

class ProductObject {
    constructor(id, { name, price }) {
        this._id = id;
        this.name = name;
        this.price = price;
    }
}

var productRoot = {
    getProductById: async ({ _id }) => {
        // find corresponding product
        let product = await Product.findOne({ _id: _id });
        // convert MongoDB ObjectId type to String before returning
        product = product.toObject();
        product._id = product._id.toString();
        return product;
    },
    getProductsByName: async ({ name }) => {
        // find corresponding products
        var products;
        if (name)
            products = await Product.find({ name: name });
        else
            products = await Product.find({});
        // convert MongoDB ObjectId type to String before returning
        var products2 = [];
        products.forEach(function(product){
            let p = product.toObject();
            p._id = p._id.toString();
            // convert product line items to strings
            let lis = [];
            p.line_items.forEach(function(li){
                lis.push(li.toString());
            });
            p.line_items = lis;
            products2.push(p);
        });
        console.log(products2);
        return products2;
    },
    createProduct: async ({ name, price, shopId }) => {
        // build new MongoDB product object
        let product = new Product({
            name: name,
            price: price,
            line_items: [],
            archived: false
        });
        // save to DB
        await product.save();
        // add to shop ?
        if (shopId){
            let shop = await Shop.findOne({ _id: shopId });
            shop.products.push(product._id);
            await shop.save();
        }
        // convert MongoDB ObjectId type to String before returning
        product = product.toObject();
        product._id = product._id.toString();
        return product;
    },
    updateProduct: async ({ _id, name, price }) => {
        // find corresponding product
        let product = await Product.findOne({ _id: _id });

        // edit fields
        if (name)
            product.name = name;
        if (price)
            product.price = price;
        // save updated product
        await product.save();
        // convert MongoDB ObjectId type to String before returning
        product = product.toObject();
        product._id = product._id.toString();
        return product;
    },
    archiveProduct: async ({ _id }) => {
        // find product
        let product = await Product.findOne({ _id: _id });
        // set archived to true
        product.archived = true;
        // save
        product.save();
        // convert MongoDB ObjectId type to String before returning
        product = product.toObject();
        product._id = product._id.toString();
        return product;
    },
    unarchiveProduct: async ({ _id }) => {
        // find product
        let product = await Product.findOne({ _id: _id });
        // set archived to false
        product.archived = false;
        // save
        product.save();
        // convert MongoDB ObjectId type to String before returning
        product = product.toObject();
        product._id = product._id.toString();
        return product;
    },
    // This endpoint should rarely be hit!
    // Deleting a product could be dangling references in line_items
    deleteProduct: async ({ _id, verification }) => {
        if (!verification) return false;
        var deleted = false;
        await Product.remove({ _id: _id }, function(err, amt){
            // check if amount of documents deleted > 0
            if (amt.n) {
                deleted = true;
            }
        });
        return deleted;
    }
};

module.exports = { productSchema: productSchema, productRoot: productRoot};