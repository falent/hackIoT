"use strict";
const express = require("express");
const alexa_adapter = require("./src/index");
const bodyParser = require("body-parser");
const verifier = require('alexa-verifier');
const app = express();

/**
 * start up our http server so we are ready for incoming requests.
 */

 function bootstrapExpress() {
 	app.use(function(req, res, next) {
   if (!req.headers.signaturecertchainurl) {
     return next();
   }

   // mark the request body as already having been parsed so it's ignored by
   // other body parser middlewares
   req._body = true;
   req.rawBody = '';

   //once we get data, add it on to our body
   req.on('data', function(data) {
     return req.rawBody += data;
   });

   //once its all over
   req.on('end', function() {

     var cert_url, er, error, requestBody, signature;

     //parse the raw body
     try {
       req.body = JSON.parse(req.rawBody);
     } catch (error) {
       er = error;
       req.body = {};
     }

     //get the information needed to verify the request
     cert_url = req.headers.signaturecertchainurl;
     signature = req.headers.signature;
     requestBody = req.rawBody;

     //verify the request
     verifier(cert_url, signature, requestBody, function(er) {

       if (er) {
         //if it fails, throw an error and return a failure
         console.error('error validating the alexa cert:', er);
         res.status(401).json({ status: 'failure', reason: er });
       } else {
         //proceed
         console.log("verified!")
         next();
       }

     });
   });

 });

    var fs = require("fs");




    const updateJsonFile = require('update-json-file')

    const filePath = './../../skill.json'

    updateJsonFile(filePath, (data) => {
        var contents = fs.readFileSync("address.json");
        var jsonContent = JSON.parse(contents);
        console.log("Address", jsonContent['tunnels'][1]['public_url']);
        data['manifest']['apis']['custom']['endpoint']['uri'] = jsonContent['tunnels'][1]['public_url'];
        data['manifest']['apis']['custom']['regions']['EU']['endpoint']['uri'] =jsonContent['tunnels'][1]['public_url'];
        return data
    });

    var contents = fs.readFileSync("./../../skill.json");

    var jsonContent = JSON.parse(contents);
    
        app.use(bodyParser.json({ type: "application/json" }));
        app.use("/", alexa_adapter.default);
        var port = process.env.PORT || 8001;
        app.listen(port, function() {
            console.log("Hey super It looks really good. Well done. Your skill is ready! Port " + port);

        });





 }
 bootstrapExpress();