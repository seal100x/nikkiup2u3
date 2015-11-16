function shareWardrobe() {
	var myClothes = MyClothes();
	myClothes.filter(clothes);
	var mine = myClothes.mine;
	var result = [];
	var resultIndex = 0;
	for (var t in category) {
		var type = category[t];
		if (type.indexOf('饰品') >= 0) {
			if (type == '饰品-头饰')
				type = "饰品";
			else
				break;
		}
		if (!mine[type]) {
			result[resultIndex++] = "1";
			console.log(type + ":" + 1);
			continue;
		}
		var size = 1 * mine[type][mine[type].length - 1];
		var array = [1];
		for (var i = 0; i < size; i++) {
			array.push(0);
		}
		for (var j in mine[type]) {
			var id = 1 * mine[type][j];
			array[id] = 1;
		}
		var str = array.join('');
		var str10 = parseInt(str, 2);
		var str36 = str10.toString(36);
		result[resultIndex++] = str36;
	}
	$("#wardrobeversion").text("http://seal100x.github.io/nikkiup2u3?");
	for (var r in result) {
		$("#wardrobeversion").append("c" + r + "=" + result[r] + "&");
	}
}