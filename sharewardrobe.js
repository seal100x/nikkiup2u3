function shareWardrobe() {
	var myClothes = MyClothes();
	myClothes.filter(clothes);
	var mine = myClothes.mine;
	var result = [];
	var resultIndex = 0;
	for (var t in category) {
		if(t>0)
			break;
		var type = category[t];
		if(!mine[type]){	
			result[resultIndex++] = "1";
			console.log(type+":" + 1);
			continue;			
		}
		var size = 1*mine[type][mine[type].length-1];
		var array = [1];
		for (var i = 0; i < size; i++) {
			array.push(0);
		}
		for (var j in mine[type]) {
			var id = 1 * mine[type][j];
			array[id] = 1;
		}
		var str = array.join('');
		var str10 =  parseInt(str,2);
		var str36 =  str10.toString(36);
		console.log(type+":" + str36);
		var strmini = pako.deflate( str36, { to: 'string' } );
		console.log(type+":" + strmini);
		result[resultIndex++] = strmini;
		$("#wardrobeversion").text("file:///D:/Games/nikkiup2u3/index.html?aaa="+strmini);
		
	}
}