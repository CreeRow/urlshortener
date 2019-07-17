**Simple customizable URL Shortener Service with Server and Client**


This is a simple URL shortener based on [Node.js](https://github.com/nodejs/node.git) and [Expressjs](https://github.com/expressjs/express.git). It supports shortening requests using the client web
interface or the REST API. It was made to be used with the [betahuhn.de](http://betahuhn.de) domain and creates shortcodes from long urls which are then stored in a MYSQL Database. You can later access the long url from the created shortcode, kinda like Bitly, but as a custom service. 

This was my first real programming project and i thought i share it here.

It uses [Node.js](https://github.com/nodejs/node.git) and [Expressjs](https://github.com/expressjs/express.git) for the server stuff and the [MySQL Node.js](https://github.com/mysqljs/mysql.git) library to interact with a mysql db for the database stuff. It also requires [shortid](https://github.com/dylang/shortid.git), [tld-enum](https://github.com/incognico/list-of-top-level-domains.git) and [valid-url](https://github.com/ogt/valid-url.git).

For example:
You could shorten https://github.com/betahuhn/urlshortener.git to http://betahuhn.de/55UGf-Eg-

For reference go to http://betahuhn.de

To install it:
```
git clone https://github.com/betahuhn/urlshortener
```
cd into the newly created directory:
```
cd urlshortener
```
Install Node.js:
```
sudo apt install nodejs npm
```
Install the required npm packages:
```
npm install
```
Change the MYSQL settings in the index.js file to your database settings and start the server with:
```
node index.js
```
Now you can goto localhost:4000 and see it working!

