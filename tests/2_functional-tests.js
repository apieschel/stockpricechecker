/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
    
    suite('GET /api/stock-prices => stockData object', function() {
      /*
      test('1 stock', function(done) {
       chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog'})
        .end(function(err, res){
          assert.equal(res.status, 200, 'response status should be 200');
          assert.equal(res.type, 'application/json', 'check if the response is json');
          assert.equal(typeof res.body.price, 'string', 'check that the price string is there');
          assert.equal(res.body.ticker, 'GOOG', 'check if the correct stock name is returned'); 
          done();
        });
      });
      
      
      test('1 stock with like', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'aapl', like: 'true'})
        .end(function(err, res){
          console.log(res.body);
          assert.equal(res.status, 200, 'response status should be 200');
          assert.equal(res.type, 'application/json', 'check if the response is json');
          assert.equal(typeof res.body.price, 'string', 'check that the price string is there');
          assert.equal(typeof res.body.likes, 'number', 'check that the number of likes exists');
          assert.equal(typeof res.body.ips, 'object', 'check for the array of ip addresses');
          assert.equal(res.body.ticker, 'AAPL', 'check if the correct stock name is returned'); 
          done();
        });  
      });
      
      
      test('1 stock with like again (ensure likes arent double counted)', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'aapl', like: 'true'})
        .end(function(err, res){
          assert.equal(res.status, 200, 'response status should be 200');
          assert.equal(res.type, 'application/json', 'check if the response is json');
          assert.equal(res.body, 'You have already liked this stock!', 'check for the correct notification message'); 
          done();
        });
      });
      */
      
      
      test('2 stocks', function(done) {
        chai.request(server)
        .get('/api/stock-prices/compare')
        .query({stock: ['goog', 'aapl']})
        .end(function(err, res){
          console.log(res.body);
          assert.equal(res.status, 200, 'response status should be 200');
          assert.equal(res.type, 'application/json', 'check if the response is json');
          assert.equal(res.body.stockOne.ticker, 'GOOG', 'check if the first stock name is returned'); 
          assert.equal(res.body.stockTwo.ticker, 'AAPL', 'check if the second stock name is returned'); 
          assert.equal(typeof res.body.StockOne.price, 'string', 'check for price in first stock');
          assert.equal(typeof res.body.StockOne.rel_likes, 'number', 'check for number of relative likes in first stock');
          assert.equal(typeof res.body.StockTwo.price, 'string', 'check for price in second stock');
          assert.equal(typeof res.body.StockTwo.rel_likes, 'number', 'check for number of relative likes in second stock');
          done();
        });
      });
      
      /*
      test('2 stocks with like', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog'})
        .end(function(err, res){
          assert.equal(res.type, 'application/json', 'check if the response is json');
          assert.equal(typeof res.body.price, 'string', 'check for the price string is there');
          assert.equal(res.status, 200, 'response status should be 200');
          assert.equal(res.body.ticker, 'GOOG', 'check if the stock name is returned'); 
          done();
        });
      });
      */
      
    });

});
