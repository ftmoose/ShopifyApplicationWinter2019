const chai = require('chai');
const expect = chai.expect;
const assert = chai.assert;
const should = chai.should();

const Product = require('../models/line_item.js');

const url = `http://localhost:4000`;
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

describe('Line Item API Tests', () => {

    // test creating new line item
    it('Creates new line item', (done) => {
        var productId = globalScope.product._id;
        var qty = globalScope.line_item.qty;
        var total = globalScope.product.price * globalScope.line_item.qty ;
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
                // verify all properties are returned
                res.body.data.createLineItem.should.have.property('_id');
                res.body.data.createLineItem.should.have.property('product');
                res.body.data.createLineItem.should.have.property('qty');
                res.body.data.createLineItem.should.have.property('total');

                // verify productId, qty and total are set correctly
                assert(res.body.data.createLineItem.product == productId, "productId parameter was not set properly");
                assert(res.body.data.createLineItem.qty == qty, "qty parameter was not set properly");
                assert(res.body.data.createLineItem.total == total, "total parameter was not set properly {is "+res.body.data.createLineItem.total+", should be "+total+"}");

                // save line_item data
                globalScope.line_item._id = res.body.data.createLineItem._id;
                globalScope.line_item.productId = res.body.data.createLineItem.product;
                globalScope.line_item.total = res.body.data.createLineItem.total;

                done();
            });
    });

    

    // test updating line item qty
    it('Updating line item quantity', (done) => {
        var _id = globalScope.line_item._id;
        var qty = globalScope.line_item.qty2;
        var total = qty * globalScope.product.price;
        var query = `
            mutation LineItemObject($_id: String!, $qty: Int!){
                updateLineItem(_id: $_id, qty: $qty){
                    _id
                    product
                    qty
                    total
                }
            }
        `;
        request.post('/graphql/line_item')
            .send({ query: query, variables: { _id, qty } })
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);

                // verify all properties are returned
                res.body.data.updateLineItem.should.have.property('_id');
                res.body.data.updateLineItem.should.have.property('product');
                res.body.data.updateLineItem.should.have.property('qty');
                res.body.data.updateLineItem.should.have.property('total');

                // verify quantity and total are updated
                assert(res.body.data.updateLineItem.qty == qty, "Quantity was not updated");
                assert(res.body.data.updateLineItem.total == total, "Total was not updated based on qty");

                done();
            });
    });

    
    // test deleteing new line item
    it('Deleting line item', (done) => {
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