'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var dns = require('dns');

var cors = require('cors');
const bodyParser = require('body-parser');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
// mongoose.connect(process.env.DB_URI);

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(bodyParser.urlencoded({ extended: false }))
app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  console.log("i'm here");
  res.sendFile(process.cwd() + '/views/index.html');
});

const links = [];
var id = 0;


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
      const link = {
        orginal_url: url,
        short_url: `${id}`
      };

      links.push(link);

      console.log(links);

      return res.json(link);
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
  console.log('Node.js listening ...' + port);
});