**Stock Price Checker Project**

1) SET NODE_ENV to `test` without quotes to run tests
2) Logic is contained in `routes/api.js`
3) Security features are in `server.js`
4) All functional tests are in `tests/2_functional-tests.js`

Note: Functional tests need to be run individually. If all tests are run at once, then the allowed 5 API calls per minute for the Alpha Vantage site (https://www.alphavantage.co/) will be exceeded, and the final test will fail. Comment out all tests except the test you want to run in `tests/2_functional-tests.js`. After running a few tests, you might have to give it a minute before running the next one.