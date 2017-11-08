// API参数转换
var createAPIParams = function(params) {
  var apiParams = {
    Body: params != null ? params : undefined,
    AccessToken: '',
    AppKey: '',
    Timestamp: new Date(),
    Sign: 'WeChat'
  };
  
  return apiParams;
};

// hasOwn, toString 别名
var hasOwn = Object.prototype.hasOwnProperty,
    toString = Object.prototype.toString;

// Object, Array 数据类型
var objectTag = '[object Object]',
    arrayTag = '[object Array]';

// 字段映射
var mapFields = function (source, fields) {
  var target = undefined;

  if(source == null) return null;

  // 处理 Array<Object>
  if(toString.call(source) === arrayTag) {
    target = [];
    for(var index = 0, len = source.length; index < len; index ++) {
      var temp = mapFields(source[index], fields)
      target.push(temp);
    }
  }

  // 处理Object
  if(toString.call(source) === objectTag) {
    target = {};
    for(var key in source) {
      if(!hasOwn.call(source, key)) continue;
      
      for (var field in fields) {
        // 匹配到字段，赋值后直接跳出循环
        if (key === field) {
          var temp = source[key];

          // 处理Object/Array
          if (toString.call(source[key]) === objectTag ||
            toString.call(source[key]) === arrayTag) {
            var temp = mapFields(source[key], fields);
          };

          target[fields[field]] = temp;
          break;
        }
      }
    }
  }

  return target;
};

// 判断对象
var isObject = function isObject(value) {
  const type = typeof value
  return value != null && (type == 'object' || type == 'function')
};

// debounce 的关注点是空闲的间隔时间。
var debounce = function debounce(func, wait, options) {
  let lastArgs,
    lastThis,
    maxWait,
    result,
    timerId,
    lastCallTime

  let lastInvokeTime = 0
  let leading = false
  let maxing = false
  let trailing = true

  if (typeof func != 'function') {
    throw new TypeError('Expected a function')
  }
  wait = +wait || 0
  if (isObject(options)) {
    leading = !!options.leading
    maxing = 'maxWait' in options
    maxWait = maxing ? Math.max(+options.maxWait || 0, wait) : maxWait
    trailing = 'trailing' in options ? !!options.trailing : trailing
  }

  var invokeFunc = function invokeFunc(time) {
    const args = lastArgs
    const thisArg = lastThis

    lastArgs = lastThis = undefined
    lastInvokeTime = time
    result = func.apply(thisArg, args)
    return result
  }

  var leadingEdge = function leadingEdge(time) {
    // Reset any `maxWait` timer.
    lastInvokeTime = time
    // Start the timer for the trailing edge.
    timerId = setTimeout(timerExpired, wait)
    // Invoke the leading edge.
    return leading ? invokeFunc(time) : result
  }

  var remainingWait = function remainingWait(time) {
    const timeSinceLastCall = time - lastCallTime
    const timeSinceLastInvoke = time - lastInvokeTime
    const timeWaiting = wait - timeSinceLastCall

    return maxing
      ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke)
      : timeWaiting
  }

  var shouldInvoke = function shouldInvoke(time) {
    const timeSinceLastCall = time - lastCallTime
    const timeSinceLastInvoke = time - lastInvokeTime

    // Either this is the first call, activity has stopped and we're at the
    // trailing edge, the system time has gone backwards and we're treating
    // it as the trailing edge, or we've hit the `maxWait` limit.
    return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
      (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait))
  }

  var timerExpired = function timerExpired() {
    const time = Date.now()
    if (shouldInvoke(time)) {
      return trailingEdge(time)
    }
    // Restart the timer.
    timerId = setTimeout(timerExpired, remainingWait(time))
  }

  var trailingEdge = function trailingEdge(time) {
    timerId = undefined

    // Only invoke if we have `lastArgs` which means `func` has been
    // debounced at least once.
    if (trailing && lastArgs) {
      return invokeFunc(time)
    }
    lastArgs = lastThis = undefined
    return result
  }

  var cancel = function cancel() {
    if (timerId !== undefined) {
      clearTimeout(timerId)
    }
    lastInvokeTime = 0
    lastArgs = lastCallTime = lastThis = timerId = undefined
  }

  var flush = function flush() {
    return timerId === undefined ? result : trailingEdge(Date.now())
  }

  var pending = function pending() {
    return timerId !== undefined
  }

  var debounced = function debounced(...args) {
    const time = Date.now()
    const isInvoking = shouldInvoke(time)

    lastArgs = args
    lastThis = this
    lastCallTime = time

    if (isInvoking) {
      if (timerId === undefined) {
        return leadingEdge(lastCallTime)
      }
      if (maxing) {
        // Handle invocations in a tight loop.
        timerId = setTimeout(timerExpired, wait)
        return invokeFunc(lastCallTime)
      }
    }
    if (timerId === undefined) {
      timerId = setTimeout(timerExpired, wait)
    }
    return result
  }
  debounced.cancel = cancel
  debounced.flush = flush
  debounced.pending = pending
  return debounced
};

// throttle 的关注点是连续的执行间隔时间。
var throttle = function throttle(func, wait, options) {
  let leading = true
  let trailing = true

  if (typeof func != 'function') {
    throw new TypeError('Expected a function')
  }
  if (isObject(options)) {
    leading = 'leading' in options ? !!options.leading : leading
    trailing = 'trailing' in options ? !!options.trailing : trailing
  }
  return debounce(func, wait, {
    'leading': leading,
    'maxWait': wait,
    'trailing': trailing
  })
};

module.exports = {
  createAPIParams: createAPIParams,
  mapFields: mapFields,
  debounce: debounce,
  throttle: throttle
}