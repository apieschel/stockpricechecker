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

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {

  app.route('/api/stock-prices')
    .get(function (req, res){
      const xhr = new XMLHttpRequest();   
      const callback = function(err, data) {
        if(err) {
          res.json(err);
        } else {
          res.json("Hello, Alex");
        }
      }
      xhr.open('GET', 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json', true);
      xhr.responseType = 'json';
      xhr.onload = function() {
        var status = xhr.status;
        console.log(status);
        if (status === 200) {
          console.log(xhr.response);
          callback(null, xhr.response);
        } else {
          callback(status, xhr.response);
        }
      };
      xhr.send();
    });
};