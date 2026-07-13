
function clone(obj, _seen) {
	if (!_seen) _seen = new WeakSet();
	var o;
	if (typeof obj == "object") {
		if (obj === null) {
			o = null;
		} else if (_seen.has(obj)) {
			return obj; // 循环引用：返回原引用，不再递归
		} else {
			_seen.add(obj);
			if (obj instanceof Array) {
				o = [];
				for (var i = 0, len = obj.length; i < len; i++) {
					o.push(clone(obj[i], _seen));
				}
			} else {
				o = {};
				for (var j in obj) {
					o[j] = clone(obj[j], _seen);
				}
			}
		}
	} else {
		o = obj;
	}
	return o;
}

