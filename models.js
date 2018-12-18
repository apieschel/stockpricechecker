let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let stockSchema = new Schema({
	ticker: String,
	price: String,
  likes: Number,
  ips: [String]
});

let Stock = mongoose.model('Stock', stockSchema);

exports.stockModel = Stock;