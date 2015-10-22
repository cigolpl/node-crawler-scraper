'use strict';
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var _ = require('lodash');
var Promise = require('bluebird');
var myrequest = require('./request')();
var async = require('async');

var userAgent = 'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.0) Opera 12.14';
var userAgent = 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:27.0) Gecko/20100101 Firefox/27.0';

//Chrome 41.0.2228.0
var userAgent = 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36';
//Chrome 41.0.2227.1
var userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2227.1 Safari/537.36';
//Chrome 40.0.2214.93
var userAgent = 'Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.93 Safari/537.36';
//Firefox 40.1
var userAgent = 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:40.0) Gecko/20100101 Firefox/40.1';
//Firefox 36.0
var userAgent = 'Mozilla/5.0 (Windows NT 6.3; rv:36.0) Gecko/20100101 Firefox/36.0';

function Crawler(options) {
  var self = this;
  self.init(options);
}

util.inherits(Crawler, EventEmitter);

Crawler.prototype.init = function(options) {
  var self = this;

  var defaultOptions = {
    maxConnections: 4,
    delay: 0,
    crawlerType: 'request',
    userAgent: userAgent
  };

  self.options = _.extend(defaultOptions, options);

  self.q = async.queue(function (url, callback) {
    myrequest.processUrlAsync(_.extend(_.clone(self.options), {url: url}))
    .delay(self.options.delay)
    .then(function(res) {
      if (!res) {
        options.callback(new Error('exception'));
        return callback();
      }
      if (res[1].statusCode >= 500) {
        options.callback(new Error('http error'), res[1], res[2]);
        return callback();
      }
      options.callback(res[0], res[1], res[2], res[3]);
      return callback();
    });
  }, self.options.maxConnections);
};

Crawler.prototype.queue = function queue (links) {
  var self = this;
  self.q.push(links, function (err) {
  });
}

module.exports = Crawler;
