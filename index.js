'use strict';
/* global Map:readonly, Set:readonly, ArrayBuffer:readonly */

var hasElementType = typeof Element !== 'undefined';
var hasMap = typeof Map === 'function';
var hasSet = typeof Set === 'function';
var hasArrayBuffer = typeof ArrayBuffer === 'function';

function equal(a, b) {
  if (a === b)
    return true;
  else if (typeof a !== 'object' || typeof b !== 'object')
    return a !== a && b !== b;
  else if (a.constructor !== b.constructor)
    return false;


  var length, i, key, it;
  if (Array.isArray(a)) {
    length = a.length;
    if (length != b.length) return false;
    for (i = length; i-- !== 0;)
      if (!equal(a[i], b[i])) return false;
    return true;
  } else if (hasMap && a instanceof Map) {
    if (a.size !== b.size) return false;
    it = a.entries();
    for (i = it.next(); !i.done; i = it.next())
      if (!b.has(i.value[0])) return false;
    it = a.entries();
    for (i = it.next(); !i.done; i = it.next())
      if (!equal(i.value[1], b.get(i.value[0]))) return false;
  } else if (hasSet && a instanceof Set) {
    if (a.size !== b.size) return false;
    it = a.entries();
    for (i = it.next(); !i.done; i = it.next())
      if (!b.has(i.value[0])) return false;
    return true;
  } else if (hasArrayBuffer && ArrayBuffer.isView(a) && ArrayBuffer.isView(b)) {
    length = a.length;
    if (length != b.length) return false;
    for (i = length; i-- !== 0;)
      if (a[i] !== b[i]) return false;
    return true;
  } else if (a instanceof RegExp) {
    return a.source === b.source && a.flags === b.flags;
  } if (a.valueOf !== Object.prototype.valueOf)
    return a.valueOf() === b.valueOf();
  else if (a.toString !== Object.prototype.toString)
    return a.toString() === b.toString();
  else if (hasElementType && a instanceof Element)
    return false;

  i = 0;
  for (key in a) {
    if (!Object.prototype.hasOwnProperty.call(a, key))
      continue;
    else if (
      (key !== '_owner' || !a.$$typeof) &&
        !Object.prototype.hasOwnProperty.call(b, key) ||
        !equal(a[key], b[key])
    )
      return false;


    i++;
  }

  if (i !== Object.keys(b).length) return false;


  return true;
}

module.exports = function exportedEqual(a, b) {
  try {
    return equal(a, b);
  } catch (error) {
    if (/stack|recursion/.test(error.message || '')) {
      // warn on circular references, don't crash
      // browsers give this different errors name and messages:
      // chrome/safari: "RangeError", "Maximum call stack size exceeded"
      // firefox: "InternalError", too much recursion"
      // edge: "Error", "Out of stack space"
      console.warn('Warning: react-fast-compare does not handle circular references.', error.name, error.message);
      return false;
    }
    // some other error. we should definitely know about these
    throw error;
  }
};
