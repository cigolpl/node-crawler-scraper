'use strict';
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var _ = require('lodash');
var redis = require('redis');
var Promise = require('bluebird');
var client = Promise.promisifyAll(redis.createClient());
var request = Promise.promisifyAll(require('request'));
var fs = Promise.promisifyAll(require('fs-extra'));
var cheerio = require('cheerio');
var async = require('async');

//var userAgent = 'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.0) Opera 12.14';
var userAgent = 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:27.0) Gecko/20100101 Firefox/27.0';

var defaultCheerioOptions = {
  normalizeWhitespace: false,
  xmlMode: false,
  decodeEntities: true
};

var Horseman = require('node-horseman');

var processUrlWithPhantomAsync = function(url) {
  return new Promise(function(resolve) {
    var horseman = new Horseman({
      loadImages: false,
      injectJquery: false
    });
    horseman
      .userAgent(userAgent)
      .open(url)
      .html()
      .then(function(body) {
        var res = {uri: horseman.targetUrl, url: horseman.targetUrl, statusCode: 200};
        var $ = cheerio.load(body, defaultCheerioOptions);
        horseman.close();
        return resolve([null, res, $, []]);
      })
  })
}

var processUrlWithRequestAsync = function(url) {
  return request.getAsync({
    url: url,
    jar: true,
    gzip: true,
    headers: {
      'User-Agent': userAgent
    }
  })
  .then(function(contents) {
    contents[0].uri = contents[0].request.uri.href;
    var $ = cheerio.load(contents[1], defaultCheerioOptions);
    return [null, contents[0], $, []];
  })
}

var processUrlAsync = function(data) {
  if (data.crawlerType === 'phantomjs') {
    return processUrlWithPhantomAsync(data.url);
  }
  return processUrlWithRequestAsync(data.url);
}

function Crawler(options) {
  var self = this;
  self.init(options);
}

util.inherits(Crawler, EventEmitter);

Crawler.prototype.init = function(options) {
  var self = this;

  var defaultOptions = {
    //cache: false,
    maxConnections: 3,
    delay: 1000,
    onDrain: false,
    crawlerType: 'request',
    //priority:           5,
    //priorityRange:      10,
    //rateLimits:         0,
    //retries:            3,
    //retryTimeout:       10000,
    skipDuplicates: false
  };

  self.options = _.extend(defaultOptions, options);
  self.options.delay = 1;

  self.q = async.queue(function (url, callback) {
    processUrlAsync({url: url, crawlerType: options.crawlerType})
    //.delay(self.options.delay)
    .then(function(res) {
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
