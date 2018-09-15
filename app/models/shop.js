var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = mongoose.Schema.Types.ObjectId;

var ShopSchema = new Schema({
    name: { type: String, required: true },
    info: { type: String, required: true },
    products: [{ type: ObjectId, ref: 'Product', }],
    orders: [{ type: ObjectId, ref: 'Order' }]
});

module.exports = mongoose.model('Shop', ShopSchema);