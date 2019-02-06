const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const stockSchema = new Schema({
	ticker: String,
	price: String,
  likes: Number,
  ips: [String]
});

const Stock = mongoose.model('Stock', stockSchema);

exports.stockModel = Stock;