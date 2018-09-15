var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = mongoose.Schema.Types.ObjectId;

var ProductSchema = new Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    line_items: [{ type: ObjectId, required: true }],
    archived: { type: Boolean, required: true }
});

module.exports = mongoose.model('Product', ProductSchema);