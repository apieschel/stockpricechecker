'use strict';

const expect = require('chai').expect;
const MongoClient = require('mongodb');
const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
const https = require('https');
const Stock = require("../models.js").stockModel;

module.exports = function (app) {

  app.route('/api/stock-prices')
    .get(function (req, res) {
    
        https.get('https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=' + req.query.stock + '&apikey=' + process.env.API_KEY, (resp) => {
        let stockData = '';

        // A chunk of data has been received.
        resp.on('data', (chunk) => {
          stockData += chunk;
        });

        // The whole response has been received.
        resp.on('end', () => {
            let dataset = JSON.parse(stockData);

            if(dataset['Global Quote'] != null && Object.keys(dataset['Global Quote']).length !== 0) { 
              let name = dataset["Global Quote"]["01. symbol"];
              let price = dataset["Global Quote"]["05. price"];
              
              // if the "Like" box is checked
              if(req.query.like) {
                Stock.findOne({ticker: name}, function(err, data) {
                  // check to see if the stock is already in the database
                  if(data !== null) {
                    if(err) throw err;

                    let ip = req.headers['x-forwarded-for'];
                    
                    if(ip) {
                      ip = req.headers['x-forwarded-for'].split(',').shift();
                    } else {
                      ip = req.connection.remoteAddress;
                    }
                    
                    // grab the array of ip addresses
                    let ipArr = data.ips;
                    
                    // check to see if the user's ip is already in the array
                    if(ipArr.includes(ip)) {
                      res.json("You have already liked this stock!");
                    } else {
                      data.likes = data.likes + 1;
                      data.ips.push(ip);
                      data.save();
                      res.json("You added this stock to your likes!");
                    }       
                  } else {			
                      if(err) throw err;

                      let ip = req.headers['x-forwarded-for'];
                      if(ip) {
                        ip = req.headers['x-forwarded-for'].split(',').shift();
                      } else {
                        ip = req.connection.remoteAddress;
                      }

                      let newStock = new Stock({ticker: name, price: price, likes: 1, ips: [ip]});

                      newStock.save(function(err, data) {
                        if(err) throw err;
                        res.json(data);
                      });																		
                  }
                });
              } else {
                res.json({ticker: name, price: price});
              }
          } else {
            res.json("Apologies, but either we could not find that stock, or we have exceeded our API call per-minute or per-day limit."); 
          }
        });
      }).on("error", (err) => {
        res.json("Error: " + err.message);
      });
    });
  
    app.get("/api/stock-prices/compare", function(req, res) {
      
      https.get('https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=' + req.query.stock[0] + '&apikey=' + process.env.API_KEY, (resp) => {
        let stockData = '';
        let dataset = [];

        // A chunk of data has been received.
        resp.on('data', (chunk) => {
          stockData += chunk;
        });

        // The whole response has been received.
        resp.on('end', () => {
          dataset.push(JSON.parse(stockData));

          if(dataset[0]['Global Quote'] != null &&
             Object.keys(dataset[0]['Global Quote']).length !== 0) {            
            
            let name = dataset[0]["Global Quote"]["01. symbol"];
            
            // Nested callback to process data from the second stock
            https.get('https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=' + req.query.stock[1] + '&apikey=' + process.env.API_KEY, (resp) => {
              let stockData = '';
              
              resp.on('data', (chunk) => {
                stockData += chunk;
              });

              resp.on('end', () => {
                dataset.push(JSON.parse(stockData));
                
                if(dataset[1]['Global Quote'] != null && Object.keys(dataset[1]['Global Quote']).length !== 0) { 
                  let name = dataset[1]["Global Quote"]["01. symbol"];
                  
                  // if "like" is checked
                  if(req.query.like) {
                    
                    let ip = req.headers['x-forwarded-for'];
                    if(ip) {
                      ip = req.headers['x-forwarded-for'].split(',').shift();
                    } else {
                      ip = req.connection.remoteAddress;
                    }
                    
                    Stock.find({ticker: {$in: [dataset[0]["Global Quote"]["01. symbol"], dataset[1]["Global Quote"]["01. symbol"]]}}, 
                    function(err, data) {
                      if(err) throw err;
                      
                      // if neither of the stocks are found in the database
                      if(data.length === 0) {
                        let newStock1 = new Stock({
                          ticker: dataset[0]["Global Quote"]["01. symbol"], 
                          price: dataset[0]["Global Quote"]["05. price"], 
                          likes: 1, 
                          ips: [ip]
                        });
                        
                        let newStock2 = new Stock({
                          ticker: dataset[1]["Global Quote"]["01. symbol"], 
                          price: dataset[1]["Global Quote"]["05. price"], 
                          likes: 1, 
                          ips: [ip]
                        });
                        
                        newStock1.save(function(err, data) { if(err) throw err;});
                        newStock2.save(function(err, data) { if(err) throw err;});
                        
                        res.json({
                            stockOne: {
                              ticker: dataset[0]["Global Quote"]["01. symbol"], 
                              price: dataset[0]["Global Quote"]["05. price"],
                              rel_likes: 0
                            }, 
                            stockTwo: {
                              ticker: dataset[1]["Global Quote"]["01. symbol"],
                              price: dataset[1]["Global Quote"]["05. price"],
                              rel_likes: 0
                        }});                      
                      }
                      
                      // if only one of the stocks is found in the database
                      if(data.length === 1) {
                        let newStock;
                        if(data[0].ticker === dataset[0]["Global Quote"]["01. symbol"]) {
                          newStock = new Stock({
                            ticker: dataset[1]["Global Quote"]["01. symbol"], 
                            price: dataset[1]["Global Quote"]["05. price"], 
                            likes: 1, 
                            ips: [ip]
                          });
                        } else {
                          newStock = new Stock({
                            ticker: dataset[0]["Global Quote"]["01. symbol"], 
                            price: dataset[0]["Global Quote"]["05. price"], 
                            likes: 1, 
                            ips: [ip]
                          }); 
                        }
                        
                        if(!data[0].ips.includes(ip)) {
                          data[0].likes = data.likes + 1;                    
                          data[0].ips.push(ip);
                          data[0].save();
                        }
                        
                        newStock.save();
                        
                        res.json({
                          stockOne: {
                            ticker: data[0].ticker, 
                            price: data[0].price,
                            rel_likes: data[0].likes - newStock.likes
                          }, 
                          stockTwo: {
                            ticker: newStock.ticker,
                            price: newStock.price,
                            rel_likes: newStock.likes - data[0].likes
                          }
                        });
                      }
                      
                      // if both stocks are found in the database
                      if(data.length === 2) {
                        for(let i = 0; i < data.length; i++) {
                          if(!data[i].ips.includes(ip)) {
                            data[i].likes = data.likes + 1;                    
                            data[i].ips.push(ip);
                          }                        
                        }
                        data[0].save();
                        data[1].save();                       
                        
                        let firstStockLikes = data[0].likes; 
                        let secondStockLikes = data[1].likes;
                        
                        res.json({
                          stockOne: {
                            ticker: dataset[0]["Global Quote"]["01. symbol"], 
                            price: dataset[0]["Global Quote"]["05. price"],
                            rel_likes: firstStockLikes - secondStockLikes
                          }, 
                          stockTwo: {
                            ticker: dataset[1]["Global Quote"]["01. symbol"],
                            price: dataset[1]["Global Quote"]["05. price"],
                            rel_likes: secondStockLikes - firstStockLikes
                        }
                        });
                      }
                     
                    }); 
                  // if "like" is not checked
                  } else {
                      // Find the stocks that already have likes             
                      Stock.find({likes: {$exists: true}}, function(err, data) {
                        if(err) throw err;
                        
                        // If stocks with likes exist
                        if(data !== null) {     
                          let firstStockLikes = 0; 
                          let secondStockLikes = 0;

                          for(let i = 0; i < data.length; i++) {
                            if(dataset[0]["Global Quote"]["01. symbol"] === data[i].ticker) {
                              firstStockLikes = data[i].likes;
                            }
                            if(dataset[1]["Global Quote"]["01. symbol"] === data[i].ticker) {
                              secondStockLikes = data[i].likes;
                            }
                          }

                          res.json({
                            stockOne: {
                              ticker: dataset[0]["Global Quote"]["01. symbol"], 
                              price: dataset[0]["Global Quote"]["05. price"],
                              rel_likes: firstStockLikes - secondStockLikes
                            }, 
                            stockTwo: {
                              ticker: dataset[1]["Global Quote"]["01. symbol"],
                              price: dataset[1]["Global Quote"]["05. price"],
                              rel_likes: secondStockLikes - firstStockLikes
                            }
                          });
                        } else {
                          res.json({
                            stockOne: {
                              ticker: dataset[0]["Global Quote"]["01. symbol"], 
                              price: dataset[0]["Global Quote"]["05. price"],
                              rel_likes: 0
                            }, 
                            stockTwo: {
                              ticker: dataset[1]["Global Quote"]["01. symbol"],
                              price: dataset[1]["Global Quote"]["05. price"],
                              rel_likes: 0
                            }
                          });
                        }
                    });
                  }
                } else {
                  res.json("Apologies, but either we could not find that stock, or we have exceeded our API call per-minute or per-day limit."); 
                }
              });
            }).on("error", (err) => {
              res.json("Error: " + err.message);
            });
            
          } else {
            res.json("Apologies, but either we could not find that stock, or we have exceeded our API call per-minute or per-day limit."); 
          }
        });
      }).on("error", (err) => {
        res.json("Error: " + err.message);
      });     
    });
};