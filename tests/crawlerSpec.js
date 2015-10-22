'use strict';

var should = require('should');
var Crawler = require('./../lib/crawler');
var nock = require('nock');

describe('crawler', function() {
  it('should crawl page successfully', function (done) {
    nock('http://crawlerod.com')
    .get('/')
    .reply(200, '<html></html>')

    var c = new Crawler({
      callback: function(error, result, $) {
        should($.html()).be.exactly('<html></html>');
        done();
      }
    });
    c.queue(['http://crawlerod.com']);
  });

  it('should handle request exception', function (done) {
    nock.disableNetConnect();

    var c = new Crawler({
      callback: function(error, result, $) {
        should(error).be.an.instanceOf(Error);
        done();
      }
    });
    c.queue(['http://google.com/']);
  });

  it('should crawl page successfully', function (done) {
    nock('http://crawlerod.com')
    .get('/')
    .reply(500, '<html></html>')

    var c = new Crawler({
      callback: function(error, result, $) {
        should(error).be.an.instanceOf(Error);
        should($.html()).be.exactly('<html></html>');
        done();
      }
    });
    c.queue(['http://crawlerod.com']);
  });


});
