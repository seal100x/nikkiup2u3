
function unique3(toUnique) {
	var res = [];
	var json = {};
	for (var i = 0; i < toUnique.length; i++) {
		if (!json[toUnique[i]]) {
			res.push(toUnique[i]);
			json[toUnique[i]] = 1;
		}
	}
	return res;
}

function showStrategy(){
	if(!uiFilter["toulan"]){
		showStrategy2();
		return;
	}
		
	var theme = allThemes[$("#theme").val()];
	var filters = clone(criteria);
	filters.own = true;
	filters.missing = true;
			
	for (var i in CATEGORY_HIERARCHY) {
		if(i == "袜子"){
			filters[CATEGORY_HIERARCHY[i][0]] = true;	
			filters[CATEGORY_HIERARCHY[i][1]] = true;	
		}
		if(i != "饰品"){
			filters[CATEGORY_HIERARCHY[i]] = true;	
		}
		else{
			for (var j in CATEGORY_HIERARCHY[i]) {
				filters[CATEGORY_HIERARCHY[i][j]] = true;
			}			
		}
	}
	var result = {};
	for (var i in clothes) {
		var type = clothes[i].type.type
		if (!result[type]) {
			result[type] = [];
		}
		if (matches(clothes[i], {}, filters)) {
			clothes[i].calc(filters);
			if (clothes[i].isF||$.inArray(type,skipCategory)>=0) continue;
			result[type].push(clothes[i]);
		}
	}
	
	var resultWords = {};
	for(var i in result){
		result[i].sort(byScore);
		result[i].splice(50,999);
		resultWords[i] = [];
		for(var j in result[i]){
			resultWords[i].push.apply( resultWords[i], result[i][j].name.split('') );
		}
		resultWords[i] = unique3(resultWords[i]);
	}
	var wordNums = {};
	for(var i in resultWords){
		for(var j in resultWords[i]){
			var quanzhong = 0.15;
			if(i.indexOf("饰品") < 0)
				quanzhong = 1
			wordNums[resultWords[i][j]] = (wordNums[resultWords[i][j]] == null ? quanzhong : wordNums[resultWords[i][j]] + quanzhong);
		}
	}
	
	var str = "粉毛运动少年雅公子家雪美学长神奇幻者主银金红白发黑蓝小·棕灰之歌黄冰士枫蔷薇女墨绿人精灵马尾紫花蝶童心青月云舞娘轻音光曲幽语天兔乐珠华丽珍稀娃可时蕾鹿头古英糕满梦星莉蝴水兰千罗帽甜力宝温夜爱丝手果泡流的短生恋色姐茶影暖锦圣信海风莓园普通情落香清下意奶高娜暗耳桃带玫日夏典柔春竹巧调蜜草糖喵樱叶羽迹火皮空包迷球瑰克魔裙格结冬衣祥纹上凉牛仔领点巾纱服绒枝套礼外背衫披装条链环裤靴袜饰圈鞋跟冠项颈";
	var notArray = str.split("");
		
	var mostNum = [];
	for(var i in wordNums){
		if(wordNums[i] > 3 &&  $.inArray(i, notArray) < 0){
			mostNum.push({"name" : i , "num" : wordNums[i]});
		}
	}
	
	mostNum.sort(function(a,b){
		return a["num"][1] - b["num"][1];
	});
	
	var str = "";
	for(var i =0; i<4 && i < mostNum.length; i++){
		str += mostNum[i].name;
	}	
	
	showStrategy2(str.split(""));
}

