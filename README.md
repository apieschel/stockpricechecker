**Stock Price Checker Project**

1) SET NODE_ENV to `test` without quotes to run tests
2) Logic is contained in `routes/api.js`
3) Security features are in `server.js`
4) All functional tests are in `tests/2_functional-tests.js`

Note: 1-stock and 2-stock functional tests need to be run separately. If all tests are run at once, then the allowed 5 API calls per minute for the Alpha Vantage site (https://www.alphavantage.co/) will be exceeded, and some tests will fail. Comment out tests except for the ones you want to run in `tests/2_functional-tests.js`. After running a few tests, you might have to give it a minute before running the next one.