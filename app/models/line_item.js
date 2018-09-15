var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = mongoose.Schema.Types.ObjectId;
var Product = require('../models/product.js');

var LineItemSchema = new Schema({
    product: { type: ObjectId, ref: 'Product', required: true },
    qty: { type: Number, required: true },
    total: { type: Number, required: true }
});

LineItemSchema.pre('save', function(next) {
    var outerThis = this;
    Product.findOne({_id: this.product}, function(err, product){
        outerThis.total = outerThis.qty * product.price;
        next();
    });

});

module.exports = mongoose.model('LineItem', LineItemSchema);