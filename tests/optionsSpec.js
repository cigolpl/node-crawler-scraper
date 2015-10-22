'use strict';

var should = require('should');
var Crawler = require('./../lib/crawler');
var nock = require('nock');

describe('crawler options', function() {
  it('should have default options', function () {
    var c = new Crawler({
    });

    should(c.options).be.an.instanceOf(Object);
    should(c.options.maxConnections).be.exactly(4);
    should(c.options.delay).be.exactly(0);
    should(c.options.crawlerType).be.exactly('request');
    should(c.options.agentType).exist;
  });

  it('should have correct options', function () {
    var userAgent = 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:40.0) Gecko/20100101 Firefox/40.1';
    var c = new Crawler({
      maxConnections: 10,
      crawlerType: 'request',
      delay: 500,
      userAgent: userAgent
    });

    should(c.options.maxConnections).be.exactly(10);
    should(c.options.delay).be.exactly(500);
    should(c.options.crawlerType).be.exactly('request');
    should(c.options.userAgent).be.exactly(userAgent);
  });
});
