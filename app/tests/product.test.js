const chai = require('chai');
const expect = chai.expect;
const assert = chai.assert; 
const should = chai.should();

const Product = require('../models/product.js');

const url = `http://localhost:4000`;
const request = require('supertest')(url);

var globalScope = {
    product: {
        _id: null,
        name: "TestProduct",
        creation_price: 1.49,
        update_price: 1.79
    }
}

describe('Product API Tests', () => {

    // test creating new product
    it('Creates new product', (done) => {
        var name = globalScope.product.name;
        var price = globalScope.product.creation_price;
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
            .send({ query: query, variables: { name, price }})
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);

                // verify all properties are returned
                res.body.data.createProduct.should.have.property('_id');
                res.body.data.createProduct.should.have.property('name');
                res.body.data.createProduct.should.have.property('price');
                res.body.data.createProduct.should.have.property('line_items');
                res.body.data.createProduct.should.have.property('archived');

                // verify price and name are set correctly
                assert(res.body.data.createProduct.name == name, "name parameter was not set properly");
                assert(res.body.data.createProduct.price == price, "price parameter was not set properly");

                // save id
                globalScope.product._id = res.body.data.createProduct._id;

                done();
            });
    });



    // test updating product
    it("Update product", (done) => {
        var price = globalScope.product.update_price;
        var _id = globalScope.product._id;
        let query = `
            mutation ProductObject($_id: String!, $price: Float!){
                updateProduct(_id: $_id, price: $price){
                    _id
                    name
                    price
                    line_items
                    archived
                }
            }
        `;
        request.post('/graphql/product')
            .send({ query: query, variables: { _id, price } })
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);

                // verify all properties are returned
                res.body.data.updateProduct.should.have.property('_id');
                res.body.data.updateProduct.should.have.property('name');
                res.body.data.updateProduct.should.have.property('price');
                res.body.data.updateProduct.should.have.property('line_items');
                res.body.data.updateProduct.should.have.property('archived');

                // verify price was updated correctly
                assert(res.body.data.updateProduct.price == price, "price parameter was not set properly");

                done();
            });
    });



    // test archiving product
    it("Archive product", (done) => {
        var _id = globalScope.product._id;
        let query = `
            mutation ProductObject($_id: String!){
                archiveProduct(_id: $_id){
                    _id
                    name
                    price
                    line_items
                    archived
                }
            }
        `;
        request.post('/graphql/product')
            .send({ query: query, variables: { _id } })
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);

                // verify all properties are returned
                res.body.data.archiveProduct.should.have.property('_id');
                res.body.data.archiveProduct.should.have.property('name');
                res.body.data.archiveProduct.should.have.property('price');
                res.body.data.archiveProduct.should.have.property('line_items');
                res.body.data.archiveProduct.should.have.property('archived');

                // verify price was updated correctly
                assert(res.body.data.archiveProduct.archived == true, "price parameter was not set properly");

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