const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
    suite('GET /api/stock-prices => stockData object', function() {
      
      // Run 1-stock and 2-stock tests separately. If all tests are run at once, then the allowed 5 API calls per minute 
      // for the Alpha Vantage site (https://www.alphavantage.co/) will be exceeded, and some tests will fail.
  
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
      
      // You might need to clear the database for this Test to pass
      test('1 stock with like', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'aapl', like: 'true'})
        .end(function(err, res){
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
      
      /* Uncomment when you're ready to run the 2-stock tests
      test('2 stocks', function(done) {
        chai.request(server)
        .get('/api/stock-prices/compare')
        .query({stock: ['goog', 'aapl']})
        .end(function(err, res){
          assert.equal(res.status, 200, 'response status should be 200');
          assert.equal(res.type, 'application/json', 'check if the response is json');
          assert.isDefined(res.body.stockOne, 'check if the first stock is defined');
          assert.isDefined(res.body.stockTwo, 'check if the second stock is defined');
          assert.equal(res.body.stockOne.ticker, 'GOOG', 'check if the first stock name is returned'); 
          assert.equal(res.body.stockTwo.ticker, 'AAPL', 'check if the second stock name is returned'); 
          assert.equal(typeof res.body.stockOne.price, 'string', 'check for price in first stock');
          assert.equal(typeof res.body.stockOne.rel_likes, 'number', 'check for number of relative likes in first stock');
          assert.equal(typeof res.body.stockTwo.price, 'string', 'check for price in second stock');
          assert.equal(typeof res.body.stockTwo.rel_likes, 'number', 'check for number of relative likes in second stock');
          done();
        });
      });
      
      test('2 stocks with like', function(done) {
        chai.request(server)
        .get('/api/stock-prices/compare')
        .query({stock: ['goog', 'aapl'], like: 'true'})
        .end(function(err, res){
          assert.equal(res.status, 200, 'response status should be 200');
          assert.equal(res.type, 'application/json', 'check if the response is json');
          assert.isDefined(res.body.stockOne, 'check if the first stock is defined');
          assert.isDefined(res.body.stockTwo, 'check if the second stock is defined');
          assert.equal(res.body.stockOne.ticker, 'GOOG', 'check if the first stock name is returned'); 
          assert.equal(res.body.stockTwo.ticker, 'AAPL', 'check if the second stock name is returned'); 
          assert.equal(typeof res.body.stockOne.price, 'string', 'check for price in first stock');
          assert.equal(typeof res.body.stockOne.rel_likes, 'number', 'check for number of relative likes in first stock');
          assert.equal(typeof res.body.stockTwo.price, 'string', 'check for price in second stock');
          assert.equal(typeof res.body.stockTwo.rel_likes, 'number', 'check for number of relative likes in second stock');
          done();
        });
      });*/ 
    });
});
