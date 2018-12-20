**FreeCodeCamp**- Information Security and Quality Assurance
------

Project Stock Price Checker

1) SET NODE_ENV to `test` without quotes and set DB to your mongo connection string
2) Complete the project in `routes/api.js` or by creating a handler/controller
3) You will add any security features to `server.js`
4) You will create all of the functional tests in `tests/2_functional-tests.js`

Edit 12-19-2018: Functional tests need to be run individually. If all tests are run at once, then the allowed 5 API calls per minute for the Alpha Vantage site (https://www.alphavantage.co/) will be exceeded, and the final test will fail. Alpha Vantage was used in this project instead of the boilerplate's recommended API Google Finance, which no longer appears to work.
