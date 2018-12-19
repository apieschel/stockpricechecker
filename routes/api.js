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
const Stock = require("../models.js").stockModel;

module.exports = function (app) {

  app.route('/api/stock-prices')
    .get(function (req, res){
    
        https.get('https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=' + req.query.stock + '&apikey=' + process.env.API_KEY, (resp) => {
        let stockData = '';

        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
          stockData += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            let dataset = JSON.parse(stockData);
            let name = dataset["Global Quote"]["01. symbol"];
            let price = dataset["Global Quote"]["05. price"];
            //console.log(dataset);

            if(name) { 
              if(req.query.like) {
                Stock.findOne({ticker: name}, function(err, data) {
                  if(data !== null) {
                    if(err) throw err;

                    let ip = req.headers['x-forwarded-for'];
                    if(ip) {
                      ip = req.headers['x-forwarded-for'].split(',').shift();
                    } else {
                      ip = req.connection.remoteAddress;
                    }

                    let ipArr = data.ips;

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
                res.json(name + ": " + price);
              }
          } else {
            res.json("Apologies, but we could not find that stock!"); 
          }
        });
      }).on("error", (err) => {
        console.log("Error: " + err.message);
        res.json("Error: " + err.message);
      });
    
    });
  
    app.get("/api/stock-prices/compare", function(req, res) {
      
      https.get('https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=' + req.query.stock[0] + '&apikey=' + process.env.API_KEY, (resp) => {
        let stockData = '';
        let dataset = [];

        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
          stockData += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
          dataset.push(JSON.parse(stockData));
          let name = dataset[0]["Global Quote"]["01. symbol"];
          //console.log(dataset);

          if(name) { 
            
            https.get('https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=' + req.query.stock[1] + '&apikey=' + process.env.API_KEY, (resp) => {
              let stockData = '';

              // A chunk of data has been recieved.
              resp.on('data', (chunk) => {
                stockData += chunk;
              });

              // The whole response has been received. Print out the result.
              resp.on('end', () => {
                dataset.push(JSON.parse(stockData));
                let name = dataset[1]["Global Quote"]["01. symbol"];
                //console.log(dataset);

                if(name) { 
                  
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
                      
                      if(data.length === 1) {
                        
                        if(data[0].ticker === dataset[0]["Global Quote"]["01. symbol"]) {
                          let newStock = new Stock({
                            ticker: dataset[1]["Global Quote"]["01. symbol"], 
                            price: dataset[1]["Global Quote"]["05. price"], 
                            likes: 1, 
                            ips: [ip]
                          });
                          newStock.save();
                        } else {
                          let newStock = new Stock({
                            ticker: dataset[0]["Global Quote"]["01. symbol"], 
                            price: dataset[0]["Global Quote"]["05. price"], 
                            likes: 1, 
                            ips: [ip]
                          }); 
                          newStock.save();
                        }
                        
                        
                      }
                       
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
                  } else {
                                   
                      Stock.find({likes: {$exists: true}}, function(err, data) {
                        if(err) throw err;

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
                  res.json("Apologies, but we could not find that stock!"); 
                }
              });
            }).on("error", (err) => {
              console.log("Error: " + err.message);
              res.json("Error: " + err.message);
            });
            
          } else {
            res.json("Apologies, but we could not find that stock!"); 
          }
        });
      }).on("error", (err) => {
        console.log("Error: " + err.message);
        res.json("Error: " + err.message);
      });     
    });
};