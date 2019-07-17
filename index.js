//index.js - ${db} URL shortener - Maximilian Schiller
const express = require('express');
const requests = require('request');
const app = express();
const shortid = require('shortid');
const mysql = require('mysql');
const validUrl = require("valid-url");
const tldEnum = require('tld-enum');
const purl = require('url');

const domain = "betahuhn.de"; //domain to use
const db = "betahuhn";        //db table to use

//Url that are blocked/reserverd for later use
const blockedurl = [
  'admin',
  'contact',
  'about',
  'privacy',
  'root',
  'page',
  'imprint',
  'details',
  'mobile',
  'api',
  'bin',
  'ip',
  'time',
  'temperature',
  'temperatur',
  'temp',
  'zeit',
  'graph'
]
//API Keys
const keys = [
  'XC6JE5dQsb',
  'YByKh7a7UB',
  'J8KGA0FYSY',
  'r6IasPapiC',
  'start123$'
]
//Init connection to MYSQL db
var connection = mysql.createConnection({
    host: "localhost",
    user: "USERNAME",
    password: "PASSWORD",
    database: "urlshortener"
  });
connection.connect(function(err) {
    if (err) {
      return console.error('error: ' + err.message);
    }
    console.log('Connected to the MySQL server.');
  });
//Starting Server on port 4000
app.listen(4000, () => console.log('listening on port 4000'));
app.use(express.static('public'));
app.use(express.json({ limit: '1mb' }));
app.set("view engine","ejs");
//Define route for Client requests from website
app.post('/api', (request, response) => {
    var ip = request.headers['x-forwarded-for'] || request.connection.remoteAddress;
    console.log('Got a request from: ' + ip);
    console.log(request.body.href);
    const url = request.body.href;
    const code = request.body.code;
    shorten(request, response, url, code);
});
//Define route for API
app.get('/api/', (request, response) => {
  var ip = request.headers['x-forwarded-for'] || request.connection.remoteAddress;
  console.log('Got an API request from: ' + ip);
  var key = request.query.key;
  if(key !== undefined){
    var check = checkkey(key, keys);
    if(check == true){
      var url = request.query.url;
      var code = request.query.code;
      console.log(url + " " + code)
      shorten(request, response, url, code);
    } else{
      response.json({
        status: '401',
        response: 'invalid key'
      });
    }
  } else{
    response.json({
      status: '400',
      response: 'no key provided'
    });
  }
});
//Define route for ip relay
app.get('/ip', (request, response) => {
  var ip = request.headers['x-forwarded-for'] || request.connection.remoteAddress;
  console.log('Got an IP request from: ' + ip);
  response.json({
    status: '200',
    response: 'ok',
    ip: ip
  });
});
//Define route for redirects
app.get('/:code', (request, response) => {
  var ip = request.headers['x-forwarded-for'] || request.connection.remoteAddress;
  const sid = request.params.code;
  console.log('Got a redirect request from: ' + ip);
  console.log(sid);
  if (blockedurl.indexOf(sid) >= 0){ //Checking if requested route is allowed
    console.log("401: Unauthorized - /" + sid)
    response.status(401)     
            .send('Unauthorized');
  }
  else{
    getUrl(sid).then(function(result){ //Get url by shortcode from db
      if (result.length > 0){
        var url =  result[0].url
        var domain = purl.parse(url).hostname;
        response.render('index.ejs', {url:url, domain:domain}); //Return ejs template with variable url and domain to client
        console.log("301: redirected - " + url);
      }
      else{
        console.log("404: Not found - /" + sid)
        response.status(404) //If shortcode wasn't found in db    
            .send('Not found.');
      }
    });
  }
});
//Function to check if short code is in db
function checkCode(sid){
    var sql = `SELECT * FROM ${db} WHERE shortcode = '${sid}';`;
    return new Promise(function(resolve, reject) {
      connection.query(sql, function(error, result, fields) {
        resolve(result.length > 0);
      });
    })
}
//Funtion to get the url of a short code 
function getUrl(sid){
  var sql = `SELECT url FROM ${db} WHERE shortcode = '${sid}';`;
  return new Promise(function(resolve, reject) {
    connection.query(sql, function(error, result, fields) {
      resolve(result);
    });
  })
}
//Check if url exists in db
function checkUrl(url){
  var sql = `SELECT shortcode FROM ${db} WHERE url = '${url}';`;
  return new Promise(function(resolve, reject) {
    connection.query(sql, function(error, result, fields) {
      resolve(result);
    });
  })
}
//Function to check if url has valid tld
function contains(target, pattern){
  var value = 0;
  pattern.forEach(function(word){
    value = value + target.includes(word);
  });
  return (value > 0)
}
//Function to check if API key is valid
function checkkey(target, pattern){
  var test = 0;
  pattern.forEach(function(value){
    if(value == target){
      test = 1;
    }
  });
  return (test == 1);
}
//Function that shortens urls
function shorten(request, response, url, code){
  var ip = request.headers['x-forwarded-for'] || request.connection.remoteAddress;
  //Check if url is valid
  if (validUrl.isWebUri(url)){
    console.log('Valid Uri');
    var href = url;
  } else {
    var url2 = 'http://' + url;
    var urlch = contains(url2, tldEnum.list);
    if (urlch == false){
      console.log(url + " is not a valid url");
      response.json({
        status: '400'
      });
      return;
    } else{
      console.log(url2 + " is valid")
      var href = url2;
    }
  }
  //Code for shortening url with custom code
  if(code !== undefined){
    if (/\s/.test(code)) {
      console.log(code + " has whitespace");
      response.json({
        status: '422'
      });
    }else if(code.match("^[a-zA-Z0-9]*$")){
      console.log(code + " is valid");
      var sid = code;
      //Check if code already in db
      checkCode(sid).then(function(result){
        if (result == false){
          //Insert into db and return new short url to client
          var today = new Date();
          var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
          var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
          var dateTime = date+' '+time;
          var sql = `INSERT INTO ${db} ( created_at, shortcode, url, ip ) VALUES ( '${dateTime}', '${sid}', '${href}', '${ip}' );`
          connection.query(sql);
          console.log(href + " added to db as: " + sid)
          var link = `${domain}/${sid}`
          //return to client
          response.json({
            status: '200',
            url: link
          });
        }
        else{
          console.log(sid + " already in db.");
          response.json({
            status: '409'
          });
        }
      })
    }else{
      console.log(code + " is not valid");
      response.json({
        status: '418'
      });
    }
  //Code for shortening url and creating short code
  } else{
    checkUrl(href).then(function(result){ //Checking if URL was shortened before
      if (result.length > 0){
        sid = result[0].shortcode
        console.log("Already in db - " + sid)
        var link = `${domain}/${sid}`;
        response.json({ //replying with code if it already exists
          status: '200',
          url: link
        });
      }
      else{
      sid = shortid.generate(); //Generating new short code
      checkCode(sid).then(function(result){ //checking if generated short code was used before (not necessery as chance of collision is very low)
        if (result == false){
          //Insert into db and return new short url to client
          var today = new Date();
          var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
          var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
          var dateTime = date+' '+time;
          var sql = `INSERT INTO ${db} ( created_at, shortcode, url, ip ) VALUES ( '${dateTime}', '${sid}', '${href}', '${ip}' );`
          connection.query(sql);
          console.log(href + " added to db as: " + sid);
          var link = `${domain}/${sid}`;
          response.json({ 
            status: '200',
            url: link
          });
        }
        else{
          console.log(sid + " already in db.");
          response.json({
            status: '409'
          });
        }   
      })
    }
  });
  }
}