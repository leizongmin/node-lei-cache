lei-cache [![Build Status](https://secure.travis-ci.org/leizongmin/node-lei-cache.png?branch=master)](http://travis-ci.org/leizongmin/node-lei-cache) [![Dependencies Status](https://david-dm.org/leizongmin/node-lei-cache.png)](http://david-dm.org/leizongmin/node-lei-cache)
=========

### Install

```bash
$ npm install lei-cache
```

### Quick Start

```javascript
var Cache = require('lei-cache');
    
var cache = new Cache(size, defaultExpire);
    
cache.set('name', 'value', expire);
    

var data = cache.get('name');

var data = cache.get('name', 'default value');

cache.get('name', function (name, save, callback) {
  // get default value
  save(data, expire);
  callback(null, data);
}, function (err, data) {
  // callback
  if (err) throw err;
  console.log(data);
});


cache.each(function (name, data, info, me) {
  console.log('%s=%s', name, data);
});
```

License
=======

```
Copyright (c) 2013 Zongmin Lei (雷宗民) <leizongmin@gmail.com>
http://ucdok.com

The MIT License

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```