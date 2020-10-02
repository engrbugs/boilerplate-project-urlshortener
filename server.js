"use strict";

var express = require("express");
var mongo = require("mongodb");
var mongoose = require("mongoose");
var dns = require("dns");

require("dotenv").config();

var cors = require("cors");
const bodyParser = require("body-parser");

var app = express();

// Basic Configuration
var port = process.env.PORT || 3000;

/** this project needs a db !! **/
console.log(process.env.MONGO_URI);
//console.log(process.env.MONGO_URI);
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
var urlSchema = mongoose.Schema({
  orginal_url: {
    type: String,
    required: true,
  },
  short_url: {
    type: Number,
  },
}); /* = <Your Model> */

const Url = mongoose.model("Url", urlSchema);

var id = 0;
Url.countDocuments({}, function (error, numOfDocs) {
  console.log("I have " + numOfDocs + " documents in my collection");
  id = numOfDocs;
  // ..
});
app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/public", express.static(process.cwd() + "/public"));

app.get("/", function (req, res) {
  console.log("i'm here");
  res.sendFile(process.cwd() + "/views/index.html");
});

//const links = [];

app.post("/api/shorturl/new", (req, res) => {
  console.log("i'm here again");
  const { url } = req.body;

  const noHTTPSurl = url.replace(/^https?:\/\//, "");
  console.log(noHTTPSurl);

  dns.lookup(noHTTPSurl, (err) => {
    if (err) {
      return res.json({
        error: "invalid URL",
      });
    } else {
      Url.findOne({ orginal_url: url }, function (err, data) {
        if (err) {
          return res.json({
            error: err,
          });
        } else if (data === null) {
          console.log("no collection found:", url);
          id++;
          const newUrl = {
            orginal_url: url,
            short_url: `${id}`,
          };
          console.log("adding new url");
          const link = new Url(newUrl);

          link.save(err);
          if (err) {
            return res.json({
              error: err,
            });
          } else {
            return res.json(newUrl);
          }
          //links.push(link);

          //console.log(links);
          
        } else {
          console.log("I have found " + data + " documents in my collection");
          console.log("link found:", data);
          return res.json({
            orginal_url: data.orginal_url,
            short_url: data.short_url
          });
        }
      });
    }
  });
});

app.get("/api/shorturl/:id", function (req, res) {
  const { id } = req.params;

  console.log("search id:", id);

  Url.findOne({ short_url: id }, function (err, data) {
    let link = data;
    console.log("I have found " + link + " documents in my collection");
    if (err) {
      return res.json({
        error: err,
      });
    } else {
      console.log("link found:", link);

      if (link) {
        return res.redirect(link.orginal_url);
      } else {
        return res.json({
          error: "No short url",
        });
      }
    }

    // ..
    // const link = links.find(l => l.short_url === id);

    // console.log("link found:", link);
    //   return res.json({
    //     error: "No short url",
    //           });
    // if (link) {
    //   return res.redirect(link.orginal_url);
    // } else {
    //   return res.json({
    //     error: "No short url",
    //   });
    // }
  });
});

app.listen(port, function () {
  console.log("Node.js listening (v0.1.3) ... " + port);
});
