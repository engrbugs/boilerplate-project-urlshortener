'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var dns = require('dns');

require('dotenv').config();

var cors = require('cors');
const bodyParser = require('body-parser');

var app = express();
console.log(process.env);

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
console.log(process.env.MONGO_URI);
//console.log(process.env.MONGO_URI);
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
var urlSchema = mongoose.Schema({
  orginal_url: {
    type: String,
    required: true
  },
  short_url: {
    type: Number
  }
}); /* = <Your Model> */

const Url = mongoose.model('Url', urlSchema);
app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(bodyParser.urlencoded({ extended: false }))
app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  console.log("i'm here");
  res.sendFile(process.cwd() + '/views/index.html');
});

//const links = [];
var id = 0;


function createNewUrl(url, id) {
//function newUrl(url, id) {
  console.log('adding new url');
  const link = new Url({
    orginal_url: url,
    short_url: `${id}`
  });
  
  link.save((err, data) => {
    console.log(err, data);
    if(err) {
      return(err);
    } else {
      return(null, data);
    };
    
    
  });
};


app.post("/api/shorturl/new", (req, res) => {
  console.log("i'm here again");
  const { url } = req.body;

  const noHTTPSurl = url.replace(/^https?:\/\//, '');
  
  dns.lookup(noHTTPSurl, (err) => {
    if (err) {
      return res.json({
        error: "invalid URL"
      });
    } else {
      id++;
      const data = {
        orginal_url: url,
        short_url: `${id}`
      };
      console.log('adding new url');
      const link = new Url(data);
      
      link.save(err);
      if (err) {
        return res.json({
          error: err
        });
      } else {
        return res.json(data);
      }
      //links.push(link);

      //console.log(links);
      
    };
  });

});

  
app.get("/api/shorturl/:id", function (req, res) {
  const { id } = req.params;
  
  console.log('search id:', id);

  const link = links.find(l => l.short_url === id);

  console.log('link found:', link);

  if (link) {
    return res.redirect(link.orginal_url);
  } else {
    return res.json({
      error: 'No short url'
    });
  };

});


app.listen(port, function () {
  console.log('Node.js listening (v0.1.1) ... ' + port);
});