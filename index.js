/* global Map:readonly, Set:readonly, ArrayBuffer:readonly */

var hasElementType = typeof Element !== 'undefined';
var hasMap = typeof Map === 'function';
var hasSet = typeof Set === 'function';
var hasArrayBuffer = typeof ArrayBuffer === 'function';

function equal(a, b) {
  var i = -1, length, it;

  if (!a || !b || typeof a !== 'object' || typeof b !== 'object')
    return a === b || (a !== a && b !== b);
  if (
    a.constructor !== b.constructor ||
    (hasElementType && a instanceof Element)
  ) return false;

  if (Array.isArray(a)) {
    if ((length = a.length) != b.length) return false;
    while (++i < length)
      if (!equal(a[i], b[i])) return false;
    return true;
  }

  if (hasArrayBuffer && ArrayBuffer.isView(a)) {
    if ((length = a.length) != b.length) return false;
    while (++i < length)
      if (a[i] !== b[i]) return false;
    return true;
  }

  if (hasMap && a instanceof Map) {
    if (a.size !== b.size) return false;
    it = a.entries();
    while (!(i = it.next()).done)
      if (
        !b.has(i.value[0]) ||
        !equal(i.value[1], b.get(i.value[0]))
      ) return false;
    return true;
  }

  if (hasSet && a instanceof Set) {
    if (a.size !== b.size) return false;
    it = a.entries();
    while (!(i = it.next()).done)
      if (!b.has(i.value[0])) return false;
    return true;
  }

  if (a instanceof RegExp)
    return a.source === b.source && a.flags === b.flags;
  if (a.valueOf !== Object.prototype.valueOf)
    return a.valueOf() === b.valueOf();
  if (a.toString !== Object.prototype.toString)
    return a.toString() === b.toString();

  it = Object.keys(a);
  if ((length = it.length) !== Object.keys(b).length) return false;
  while (++i < length) {
    if (
      (it[i] !== '_owner' || !a.$$typeof) &&
        (!(it[i] in b) ||
          !equal(a[it[i]], b[it[i]]))
    ) return false;
  }

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
