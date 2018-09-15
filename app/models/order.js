var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = mongoose.Schema.Types.ObjectId;
var LineItem = require('./line_item.js');

var OrderSchema = new Schema({
    date: { type: Date, required: true },
    shop: { type: ObjectId, ref: 'Shop', required: true },
    line_items: [{ type: ObjectId, ref: 'LineItem', required: true}],
    total: { type: Number, required: true },
    refunded: { type: Boolean, required: true }
});

// set required fields before saving
OrderSchema.pre('save', async function (next) {
    var total = 0;
    for (var i = 0; i < this.line_items.length; i++){
        await LineItem.findOne({ _id: this.line_items[i]}, function(err, line_item){
            total += line_item.total;
        });
    }
    this.total = total;

    next();
});

module.exports = mongoose.model('Order', OrderSchema);