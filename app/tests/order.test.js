const chai = require('chai');
const expect = chai.expect;
const assert = chai.assert;
const should = chai.should();

const Product = require('../models/line_item.js');

const url = `http://localhost:8080`;
const request = require('supertest')(url);

var globalScope = {
    product: {
        _id: null,
        name: "TestProduct",
        price: 1.49
    },
    line_item: {
        _id: null,
        productId: null,
        qty: 3,
        qty2: 4,
        total: null
    },
    order: {
        _id: null,
        date: null,
        shopId: null,
        line_items: [],
        total: null,
        refunded: false
    },
    shop: {
        _id: null,
        name: "Test Shop",
        info: "Info for test shop",
        products: null,
        orders: null
    }
}

// create a dummy product to use in tests
before((done) => {
    var name = globalScope.product.name;
    var price = globalScope.product.price;
    let query = `
            mutation ProductObject($name: String!, $price: Float!){
                createProduct(name: $name, price: $price){
                    _id
                    name
                    price
                    line_items
                    archived
                }
            }
        `;
    request.post('/graphql/product')
        .send({ query: query, variables: { name, price } })
        .expect(200)
        .end((err, res) => {
            if (err) return done(err);

            // save id
            globalScope.product._id = res.body.data.createProduct._id;

            done();
        });
});

// create a dummy line item to use in tests
before((done) => {
    var productId = globalScope.product._id;
    var qty = globalScope.line_item.qty;
    var total = globalScope.product.price * globalScope.line_item.qty;
    let query = `
            mutation LineItemObject($productId: String!, $qty: Int!){
                createLineItem(productId: $productId, qty: $qty){
                    _id
                    product
                    qty
                    total
                }
            }
        `;
    request.post('/graphql/line_item')
        .send({ query: query, variables: { productId, qty } })
        .expect(200)
        .end((err, res) => {
            if (err) return done(err);
 
            // save line_item data
            globalScope.line_item._id = res.body.data.createLineItem._id;
            globalScope.line_item.productId = res.body.data.createLineItem.product;
            globalScope.line_item.total = res.body.data.createLineItem.total;

            done();
        });
});

// create a dummy shop to use in tests
before((done) => {
    var name = globalScope.shop.name;
    var info = globalScope.shop.info;
    let query = `
            mutation ShopObject($name: String!, $info: String!){
                createShop(name: $name, info: $info){
                    _id
                    name
                    info
                    products
                    orders
                }
            }
        `;
    request.post('/graphql/shop')
        .send({ query: query, variables: { name, info } })
        .expect(200)
        .end((err, res) => {
            if (err) return done(err);

            // save shop data
            globalScope.shop._id = res.body.data.createShop._id;
            globalScope.shop.products = res.body.data.createShop.products;
            globalScope.line_item.orders = res.body.data.createShop.orders;

            done();
        });
});

describe('Order API Tests', () => {


    // test creating a new order
    it('Creating order', (done) => {
        var shopId = globalScope.shop._id;
        var line_items = [globalScope.line_item._id];
        var query = `
            mutation OrderObject($shopId: String!, $line_items: [String]!){
                createOrder(shopId: $shopId, line_items: $line_items){
                    _id
                    date
                    shop
                    line_items
                    total
                    refunded
                }
            }
        `;
        request.post('/graphql/order')
            .send({ query: query, variables: { shopId, line_items } })
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                // verify all properties are returned
                res.body.data.createOrder.should.have.property('_id');
                res.body.data.createOrder.should.have.property('date');
                res.body.data.createOrder.should.have.property('shop');
                res.body.data.createOrder.should.have.property('line_items');
                res.body.data.createOrder.should.have.property('total');
                res.body.data.createOrder.should.have.property('refunded');

                // verify values are set correctly
                assert(res.body.data.createOrder.date, "order has no date");
                assert(res.body.data.createOrder.shop == shopId, "shop parameter was not set properly");
                assert(res.body.data.createOrder.line_items.length == line_items.length, "line_items parameter was not set properly");
                for (var i = 0; i < line_items.length; i++){
                    assert(res.body.data.createOrder.line_items[i] == line_items[i], "line_items parameter was not set properly");
                }
                assert(res.body.data.createOrder.total == globalScope.line_item.total, "total parameter was not set properly");
                assert(res.body.data.createOrder.refunded == globalScope.order.refunded, "refunded parameter was not set properly");


                // save order data
                globalScope.order._id = res.body.data.createOrder._id;
                globalScope.order.date = res.body.data.createOrder.date;
                globalScope.order.shopId = res.body.data.createOrder.shop;
                globalScope.order.line_items = res.body.data.createOrder.line_items;
                globalScope.order.total = res.body.data.createOrder.total;
                globalScope.order.refunded = res.body.data.createOrder.refunded;
                

                done();
            });
    });


    // refund order
    it('Refunding order', (done) => {
        var _id = globalScope.order._id;
        var shopId = globalScope.shop._id;
        var line_items = globalScope.order.line_items;
        var query = `
            mutation OrderObject($_id: String!){
                refundOrder(_id: $_id){
                    _id
                    date
                    shop
                    line_items
                    total
                    refunded
                }
            }
        `;
        request.post('/graphql/order')
            .send({ query: query, variables: { _id } })
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                // verify all properties are returned
                res.body.data.refundOrder.should.have.property('_id');
                res.body.data.refundOrder.should.have.property('date');
                res.body.data.refundOrder.should.have.property('shop');
                res.body.data.refundOrder.should.have.property('line_items');
                res.body.data.refundOrder.should.have.property('total');
                res.body.data.refundOrder.should.have.property('refunded');

                // verify values are set correctly
                assert(res.body.data.refundOrder.date, "order has no date");
                assert(res.body.data.refundOrder.shop == shopId, "shop parameter was not set properly");
                assert(res.body.data.refundOrder.line_items.length == line_items.length, "line_items parameter was not set properly");
                for (var i = 0; i < line_items.length; i++) {
                    assert(res.body.data.refundOrder.line_items[i] == line_items[i], "line_items parameter was not set properly");
                }
                assert(res.body.data.refundOrder.total == globalScope.line_item.total, "total parameter was not set properly");
                assert(res.body.data.refundOrder.refunded == true, "refunded parameter was not set properly");


                // save order data
                globalScope.order.refunded = res.body.data.refundOrder.refunded;


                done();
            });
    });

});

// delete dummy product after all tests
after((done) => {
    var _id = globalScope.product._id;
    var verification = true;
    var query = `
            mutation ProductObject($_id: String!, $verification: Boolean!){
	            deleteProduct(_id: $_id, verification: $verification)
            }
        `;
    request.post('/graphql/product')
        .send({ query: query, variables: { _id, verification } })
        .expect(200)
        .end((err, res) => {
            if (err) return done(err);
            done();
        });

});

// delete dummy line item after all tests
after((done) => {
    var _id = globalScope.line_item._id;
    var query = `
            mutation LineItemObject($_id: String!){
                deleteLineItem(_id: $_id)
            }
        `;
    request.post('/graphql/line_item')
        .send({ query: query, variables: { _id } })
        .expect(200)
        .end((err, res) => {
            if (err) return done(err);
            done();
        });
});

// delete dummy shop after all tests
after((done) => {
    var _id = globalScope.shop._id;
    var query = `
            mutation ShopObject($_id: String!){
                deleteShop(_id: $_id)
            }
        `;
    request.post('/graphql/shop')
        .send({ query: query, variables: { _id } })
        .expect(200)
        .end((err, res) => {
            if (err) return done(err);
            done();
        });
});