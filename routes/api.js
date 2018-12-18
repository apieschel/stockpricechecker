/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

const expect = require('chai').expect;
const MongoClient = require('mongodb');
const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
const https = require('https');

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {

  app.route('/api/stock-prices')
    .get(function (req, res){
    
        https.get('https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=GOOG&apikey=' + process.env.API_KEY, (resp) => {
        let data = '';

        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
          data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
          let dataset = JSON.parse(data);
          let name = dataset["Global Quote"]["01. symbol"];
          let price = dataset["Global Quote"]["05. price"];
          console.log(dataset);
          res.json(name + ": " + price);
        });

      }).on("error", (err) => {
        console.log("Error: " + err.message);
        res.json("Error: " + err.message);
      });
    
    });
};