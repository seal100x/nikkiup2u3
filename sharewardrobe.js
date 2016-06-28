function shareWardrobe() {
	var myClothes = MyClothes();
	myClothes.filter(clothes);
	var mine = myClothes.mine;
	var result = [];
	for (var t in category) {
		var type = category[t];
		if (type.indexOf('饰品') >= 0) {
			if (type == '饰品-头饰')
				type = "饰品";
			else
				continue;
		}
		if (type.indexOf('袜子') >= 0) {
			if (type == '袜子-袜子')
				type = "袜子";
			else
				continue;
		}
		if (!mine[type]) {
			result[type] = "1";
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
		result[type] = zipNum(str);
	}
	var strUrl = "http://seal100x.github.io/nikkiup2u3?";
	for (var r in result) {
		strUrl += typeToggleChar(r) + "=" + result[r] + "&";
	}
	strUrl.substr(0,strUrl.length-1);
	$("#share-link").html("<a href=" + strUrl + ">" + strUrl + "</a>");
}

function typeToggleChar(source){
	if(source  == '发型')
		return 'a';
	if(source  == '连衣裙')
		return 'b';
	if(source  == '外套')
		return 'c';
	if(source  == '上装')
		return 'd';
	if(source  == '下装')
		return 'e';
	if(source  == '袜子')
		return 'f';
	if(source  == '鞋子')
		return 'g';
	if(source  == '妆容')
		return 'h';
	if(source  == '饰品')
		return 'i';
	if(source  == '荧光之灵')
		return 'j';
	
	if(source  == 'a')
		return '发型';
	if(source  == 'b')
		return '连衣裙';
	if(source  == 'c')
		return '外套';
	if(source  == 'd')
		return '上装';
	if(source  == 'e')
		return '下装';
	if(source  == 'f')
		return '袜子';
	if(source  == 'g')
		return '鞋子';
	if(source  == 'h')
		return '妆容';
	if(source  == 'i')
		return '饰品';
	if(source  == 'j')
		return '荧光之灵';
}

function getWardrobe() {
	var request = GetRequest();
	var txt = "";
	for (var t in request) {
		txt += typeToggleChar(t);
		txt += ":";
		var str = unzipNum(request[t]);
		str = str.substr(1,str.length);
		for (var i in str) {
			if (str.charAt(i) == "1") {
				i = 1*i+1;
				if (i < 10) {
					txt += "00" + i + ",";
				} else if (i < 100) {
					txt += "0" + i + ",";
				} else {
					txt += i + ",";
				}
			}
		}
		txt = txt.substr(0,txt.length-1) + "|";
	}
	console.log(txt);
}

function GetRequest() {
	var url = location.search; //获取url中"?"符后的字串
	var theRequest = new Object();
	if (url.indexOf("?") != -1) {
		var str = url.substr(1);
		strs = str.split("&");
		for (var i = 0; i < strs.length; i++) {
			theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
		}
	}
	return theRequest;
}

function zipNum(num){
    if(!zipNum.zip){
        zipNum.zip = function(inputNum){
			inputNum = parseInt(inputNum, 2);
			if(inputNum > 61){
				if(inputNum == 62)
					return "(";
				if(inputNum == 63)
					return ")";
			}
            else if(inputNum > 35){//用大写字母表示36-61
                return String.fromCharCode('A'.charCodeAt(0) + inputNum % 36);
            } else if(inputNum > 9){//用小写字母表示10-35
                return String.fromCharCode('a'.charCodeAt(0) + inputNum % 10);
            } else {
                return inputNum;
            }
        }
    }
	var result = "";
	for(var i = num.length; i>0; i-=6){
		if(i<6){
			result = zipNum.zip(num.substr(0,i)) + result;
		}
		else{
			result = zipNum.zip(num.substr(i-6,6)) + result;
		}
	}
    return result;
}

function unzipNum(num){
	var result = "";
	for(var i = num.length; i>=0; i--){
		result = unzip(num.substr(i-1,1)) + result;
	}
    return result;
}

function unzip(inputNum){	
	if(inputNum == "(")
		return "111110";
	if(inputNum == ")")
		return "111111";
	if(inputNum <= 9){
		return pad(inputNum.toString(2), 6);
	}
	if(inputNum.charCodeAt() <= 'Z'.charCodeAt(0)){
		return pad((inputNum.charCodeAt() - 'A'.charCodeAt(0) + 36).toString(2), 6);
	}
	if(inputNum.charCodeAt() <= 'z'.charCodeAt(0)){
		return pad((inputNum.charCodeAt() - 'a'.charCodeAt(0) + 10).toString(2), 6);
	}
}

function pad(num, n) { 
	var len = num.toString().length; 
	while(len < n) { 
		num = "0" + num; 
		len++; 
	} 
	return num; 
} 