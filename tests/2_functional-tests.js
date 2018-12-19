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
      
      test('1 stock', function(done) {
       chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog'})
        .end(function(err, res){
            
          console.log(typeof res.body.price);
          assert.equal(res.type, 'application/json', 'check if the response is json');
          assert.equal(typeof res.body.price, 'string', 'check for the price string is there');
          assert.equal(res.status, 200, 'response status should be 200');
          assert.equal(res.body.ticker, 'GOOG', 'check if the stock name is returned'); 
         
          done();
        });
      });
      
      test('1 stock with like', function(done) {
        
      });
      
      test('1 stock with like again (ensure likes arent double counted)', function(done) {
        
      });
      
      test('2 stocks', function(done) {
        
      });
      
      test('2 stocks with like', function(done) {
        
      });
      
    });

});
