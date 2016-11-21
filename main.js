/*jslint node: true */
"use strict";

var parseString = require("xml2js").parseString;
var crypto = require("crypto");
var request = require("request");
var credentials = require("./credentials");
var config = require("./config");
var fs = require("fs");
var action = config.action;
var params = {
    "Action": action,
    "SellerId": credentials.SellerId,
    "SignatureVersion": "2",
    "SignatureMethod": "HmacSHA256",
    "Timestamp": new Date().toISOString(),
    "Version": config[action].version,
    "AWSAccessKeyId": credentials.AWSAccessKeyId
};
var hmac = crypto.createHmac("sha256", credentials.SecretKey);
var options = {
    headers: {
        "User-Agent": "mws-ngp/0.0.1 (Language=Javascript)",
        "Content-Type": "text/xml"
    }
};

Object.keys(config[action].params).forEach(function (key) {
    params[key] = config[action].params[key];
});

var strParams = Object.keys(params).sort().map(function (key) {
    return encodeURIComponent(key) + "=" + encodeURIComponent(params[key]);
}).join("&");

var arr = ["POST", config.domen, config[action].endpoint + config[action].version, strParams];
var queryRequest = arr.join("\n");
var signature = hmac.update(queryRequest).digest("base64");

options.url = "https://" + config.domen + config[action].endpoint + config[action].version + "?" + strParams + "&Signature=" + encodeURIComponent(signature);

request.post(options, function (error, response, body) {
    if (error) {
        console.error(error);
    } else if (response.statusCode !== 200 && response.statusCode !== 204) {
        console.error(response.statusCode + ": " + response.statusMessage);
    } else {
        parseString(body, {explicitArray: false}, function (err, result) {
            if (err) {
                console.error(err);
            } else {
                fs.writeFile("./results/" + action + ".json", JSON.stringify(result, null, "\t"), "utf8", function (err) {
                    if (err) {
                        console.error(err);
                    } else {
                        console.log(action + " - Done!");
                    }
                });
            }
        });
    }
});
