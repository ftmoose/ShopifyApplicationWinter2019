const chai = require('chai');
const expect = chai.expect;
const assert = chai.assert;
const should = chai.should();

const url = `http://localhost:4000`;
const request = require('supertest')(url);

var globalScope = {
    shop: {
        _id: null,
        name: "Test Shop",
        name2: "Test Shop Edited",
        info: "Info for test shop",
        info2: "Edited info for test shop",
        products: null,
        orders: null
    }
}

describe('Shop API Tests', () => {

    // test creating new shop
    it('Creating new shop', (done) => {
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

                // verify all properties are returned
                res.body.data.createShop.should.have.property('_id');
                res.body.data.createShop.should.have.property('name');
                res.body.data.createShop.should.have.property('info');
                res.body.data.createShop.should.have.property('products');
                res.body.data.createShop.should.have.property('orders');

                // verify data is correct
                assert(res.body.data.createShop.name == name, "name property was not set properly");
                assert(res.body.data.createShop.info == info, "info property was not set properly");
                assert(res.body.data.createShop.products, "products property was not set properly");
                assert(res.body.data.createShop.orders, "products property was not set properly");

                // save shop data
                globalScope.shop._id = res.body.data.createShop._id;
                globalScope.shop.products = res.body.data.createShop.products;
                globalScope.shop.orders = res.body.data.createShop.orders;

                done();
            });
    });


    // test editing shop
    it('Editing new shop', (done) => {
        var _id = globalScope.shop._id;
        var name = globalScope.shop.name2;
        var info = globalScope.shop.info2;
        let query = `
            mutation ShopObject($_id: String!, $name: String, $info: String){
                updateShop(_id: $_id, name: $name, info: $info){
                    _id
                    name
                    info
                    products
                    orders
                }
            }
        `;
        request.post('/graphql/shop')
            .send({ query: query, variables: { _id, name, info } })
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                // verify all properties are returned
                res.body.data.updateShop.should.have.property('_id');
                res.body.data.updateShop.should.have.property('name');
                res.body.data.updateShop.should.have.property('info');
                res.body.data.updateShop.should.have.property('products');
                res.body.data.updateShop.should.have.property('orders');

                // verify data is correct
                assert(res.body.data.updateShop.name == name, "name property was not set properly");
                assert(res.body.data.updateShop.info == info, "info property was not set properly");
                assert(res.body.data.updateShop.products, "products property was not set properly");
                assert(res.body.data.updateShop.orders, "products property was not set properly");

                // save shop data
                globalScope.shop._id = res.body.data.updateShop._id;
                globalScope.shop.products = res.body.data.updateShop.products;
                globalScope.shop.orders = res.body.data.updateShop.orders;

                done();
            });
    });

    // test deleting shop
    it("Deleting shop", (done) => {
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

});
