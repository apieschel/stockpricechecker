/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {

  app.route('/api/stock-prices')
    .get(function (req, res){
      app.get('https://finance.google.com/finance/info?q=NASDAQ%3aGOOG', function(req, res) {
        console.log(res.body);
      });
      res.json("Hello, Alex");  
    });
};
