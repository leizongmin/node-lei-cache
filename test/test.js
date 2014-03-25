/**
 * Tests
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

var should = require('should');
var Cache = require('../');

describe('Cache', function () {

  it('#get & set & delete', function () {
    var c = new Cache();
    c.set('a', 123456);
    c.set('b', 7891011);
    // test exists item
    c.get('a').should.equal(123456);
    c.get('b').should.equal(7891011);
    // test not exists item
    should.equal(c.get('c'), undefined);
    c.get('c', 444).should.equal(444);
    c.get('a', 555).should.equal(123456);
    // delete
    c.delete('a');
    should.equal(c.get('a'), undefined);
    c.set('b', 7891011);
  });

  it('#async get', function (done) {
    var c = new Cache();
    c.get('a', function (name, save, callback) {
      name.should.equal('a');
      save(777777);
      callback(null, 777777);
    }, function (err, data) {
      should.equal(err, null);
      data.should.equal(777777);
      // verify again whether has been saved successfully
      c.get('a').should.equal(777777);
      done();
    });
  });

  it('#auto GC', function (done) {
    var c = new Cache(10, 100);

    for (var i = 0; i < 100; i++) {
      c.set('a' + i, i);
    }
    c._cacheSize.should.equal(10);

    setTimeout(function () {
      c.set('x', 111);
      c._cacheSize.should.equal(1);
      c.get('x').should.equal(111);

      for (var i = 0; i < 100; i++) {
        c.set('b' + i, i);
      }
      setTimeout(function () {

        for (var i = 0; i < c._autoFreeCount + 1; i++) {
          c.get('b' + i);
        }

        c._cacheSize.should.equal(0);
        done();

      }, 110);

    }, 110);

  });

  it('#timer GC', function (done) {
    var c = new Cache(10, 100);

    for (var i = 0; i < 100; i++) {
      c.set('a' + i, i);
    }
    c._cacheSize.should.equal(10);

    setTimeout(function () {

      c._cacheSize.should.equal(0);
      done();

    }, 110);
  });

  it('#reset', function () {
    var c = new Cache();
    c.set('a', 123);
    c.set('b', 456);
    c.set('c', 789);
    c.get('a').should.equal(123);
    c.get('b').should.equal(456);
    c.get('c').should.equal(789);
    c.reset();
    c.each(function () {
      throw new Error('Must be empty!');
    });
  });

});