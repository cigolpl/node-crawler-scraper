'use strict';
var _ = require('lodash');
var Horseman = require('node-horseman');
var Promise = require('bluebird');
var request = Promise.promisifyAll(require('request'));
var cheerio = require('cheerio');

var defaultCheerioOptions = {
  normalizeWhitespace: false,
  xmlMode: false,
  decodeEntities: true
};

module.exports = function() {

  var processUrlWithPhantomAsync = function(data) {
    return new Promise(function(resolve) {
      var horseman = new Horseman({
        loadImages: false,
        injectJquery: false
      });
      horseman
      .userAgent(data.userAgent)
      .open(data.url)
      .html()
      .then(function(body) {
        var res = {uri: horseman.targetUrl, url: horseman.targetUrl, statusCode: 200};
        var $ = cheerio.load(body, defaultCheerioOptions);
        horseman.close();
        return resolve([null, res, $, []]);
      })
    })
  }

  var processUrlWithRequestAsync = function(data) {
    return request.getAsync({
      url: data.url,
      jar: true,
      gzip: true,
      forever: true,
      headers: {
        'User-Agent': data.userAgent
      }
    })
    .then(function(contents) {
      contents[0].uri = contents[0].request.uri.href;
      var $ = cheerio.load(contents[1], defaultCheerioOptions);
      return [null, contents[0], $, []];
    })
    .catch(function(error) {
      console.log('http error');
      console.log(error);
    })
  }

  var processUrlAsync = function(data) {
    if (data.crawlerType === 'phantomjs') {
      return processUrlWithPhantomAsync(data);
    }
    return processUrlWithRequestAsync(data);
  }

  return {
    processUrlAsync: processUrlAsync,
    processUrlWithPhantomAsync: processUrlWithPhantomAsync,
    processUrlWithRequestAsync: processUrlWithRequestAsync
  }
};

