/**
 * Memory Cache Pool
 *
 * @module lei-cache
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

var debug = require('debug')('lei:cache');

exports = module.exports = Cache;


/**
 * Cache Object
 *
 * @class Cache
 * @constructor
 * @param {Number} size     default: 100
 * @param {Number} expire   default: 3600000ms (1 hour)
 */
function Cache (size, expire) {
  if (!(size > 0)) size = 100;
  if (!(expire > 0)) expire = 3600000;

  this._size = size;
  this._expire = expire;
  this.reset();

  // timer auto free
  var me = this;
  me._timer = setInterval(function () {
    debug('Timer auto free');
    me._free();
  }, expire / 2);

  debug('Create cache pool: size=%d, default-expire=%d', size, expire);
}

/**
 * Reset
 *
 * @method reset
 */
Cache.prototype.reset = function () {
  this._cache = {};
  this._cacheSize = 0;
  this._freePercent = 0.2;
  this._getCounter = 0;
  this._autoFreeCount = 200;
};

/**
 * Destroy
 *
 * @method destroy
 */
Cache.prototype.destroy = function () {
  return this.reset();
};

/**
 * Set item
 *
 * @method set
 * @param {String} name
 * @param {Object} data
 * @param {Number} expire   (optional)
 */
Cache.prototype.set = function (name, data, expire) {
  if (!(expire > 0)) expire = this._expire;

  var cache = this._cache;
  var timestamp = Date.now();

  // format: [visited counter, last visited, expire, data]
  if (!(name in cache)) this._cacheSize++;
  cache[name] = [0, timestamp, timestamp + expire, data];

  debug('Set cache: [%s] expire=%d(%d)', name, expire, timestamp);

  this._free();
};

/**
 * Get item
 *
 * Examples:
 *   cache.get('a');        // will returns the cache item "a", if cache not exists, returns undefined
 *   cache.get('a', 123);   // will returns the cache item "a", if cache not exists, returns 123
 *
 *   cache.get('a', getDataFromDB, callback);  // call the function "callback", passing the cache item "a" as the second
 *                                             // arguments, if cache not exists, call the "getDataFromDB" before
 *   // the hetDataFromDB function
 *   function getDataFromDB (name, save, callback) {
 *     console.log('Get cache item "%s" from DB...', name);
 *     // do something...
 *     save(123);           // is equivalent to: cache.set(name, 123);
 *     save(123, expire);   // is equivalent to: cache.set(name, 123, expire);
 *     // callback
 *     callback(null, 123); // returns the value, but not save to cache pool, you must call save(123) to save it
 *   }
 *
 * @method get
 * @param {String} name
 * @param {Object|Function} defaultValue
 * @param {Function} callback
 * @return {Object}
 */
Cache.prototype.get = function (name, defaultValue, callback) {
  var me = this;
  var cache = me._cache;

  // automatically to free the expired cache item
  me._getCounter++;
  if (me._getCounter % me._autoFreeCount === 0) {
    me._free();
  }

  debug('Get cache: [%s] default=%s', name, defaultValue);

  if (typeof callback === 'function') {
    // asynchronous
    if (name in cache) {
      me._hit(name);
      return callback(null, me._getData(cache[name]));
    }

    // call function "defaultValue" to get the data
    defaultValue(name, function (data, expire) {
      me.set(name, data, expire);
    }, callback);

  } else {
    // synchronous
    if (name in cache) {
      me._hit(name);
      return me._getData(cache[name]);
    } else {
      return defaultValue;
    }
  }
};

/**
 * Delete item
 *
 * @method delete
 * @param {String} name
 * @return {Boolean}
 */
Cache.prototype.delete = function (name) {
  debug('Delete cache: [%s]', name);

  var cache = this._cache;
  if (name in cache) {
    delete cache[name];
    this._cacheSize--;
    return true;
  } else {
    return false;
  }
};

/**
 * Iterate through all the cache item
 *
 * @method each
 * @param {Function} onItem Fromat: function (name, data, moreInfo, this) {}
 */
Cache.prototype.each = function (onItem) {
  var cache = this._cache;
  for (var name in cache) {
    var item = cache[name];
    onItem(name, this._getData(item), item, this);
  }
};

/**
 * Get data
 *
 * @param {Array} item
 * @return {Object}
 */
Cache.prototype._getData = function (item) {
  return item[3];
};

/**
 * Update last visited
 *
 * @param {String} name
 */
Cache.prototype._hit = function (name) {
  var item = this._cache[name];
  item[0]++;
  item[1] = Date.now();
};

/**
 * Free expired cache item, returns the number
 *
 * @return {Number}
 */
Cache.prototype._freeExpired = function () {
  var cache = this._cache;
  var timestamp = Date.now();
  var counter = 0;

  for (var name in cache) {
    if (cache[name][2] <= timestamp) {
      this.delete(name);
      counter++;
    }
  }

  return counter;
};

/**
 * Free
 */
Cache.prototype._free = function () {
  var me = this;

  debug('Auto free: pool-size=%d, cache-size=%d', me._cacheSize, me._size);

  // free expired items
  var c = me._freeExpired();
  if (!c && me._cacheSize > me._size) {

    // not enough? free other least-recently-used items
    var cache = me._cache;
    var list = [];
    me.each(function (name, data, info) {
      list.push({n: name, t: info[1]});
    });
    list.sort(function (a, b) {
      return a.t - b.t;
    });
    list.slice(0, me._freePercent * me._cacheSize).forEach(function (item) {
      me.delete(item.n);
    });

  }
};
