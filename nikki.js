// Ivan's Workshop

var CATEGORY_HIERARCHY = function () {
	var ret = {};
	for (var i in category) {
		var type = category[i].split('-')[0];
		if (!ret[type]) {
			ret[type] = [];
		}
		ret[type].push(category[i]);
	}
	return ret;
}
();

function addShoppingCart(type, id) {
	shoppingCart.put(clothesSet[type][id]);
	refreshShoppingCart();
}

function removeShoppingCart(type) {
	shoppingCart.remove(type);
	refreshShoppingCart();
}

function clearShoppingCart() {
	shoppingCart.clear();
	refreshShoppingCart();
}

function toggleInventory(type, id) {
	var checked = !clothesSet[type][id].own;
	checked ? $('#clickable-' + type + id).addClass('own') : $('#clickable-' + type + id).removeClass("own");
	clothesSet[type][id].own = checked;
	saveAndUpdate();
}

var criteria = {};
function onChangeCriteria() {
	criteria = {};
	for (var i in FEATURES) {
		var f = FEATURES[i];
		var weight = parseFloat($('#' + f + "Weight").val());
		if (!weight) {
			weight = 1;
		}
		if (uiFilter["highscore"]) {
			var highscore2 = $('#' + f + "1d778.active").length ? 1.778 : 1;
			var highscore1 = $('#' + f + "1d27.active").length ? 1.27 : 1;
			weight = accMul(accMul(weight, highscore1), highscore2);
			if (highscore1>1) criteria.highscore1=f;
			if (highscore2>1) criteria.highscore2=f;
		}
		var checked = $('input[name=' + f + ']:radio:checked');
		if (checked.length) {
			criteria[f] = parseInt(checked.val()) * weight;
		}
	}
	tagToBonus(criteria, 'tag1');
	tagToBonus(criteria, 'tag2');
	if (global.additionalBonus && global.additionalBonus.length > 0) {
		criteria.bonus = global.additionalBonus;
	}
	criteria.levelName = $("#theme").val();
	chooseAccessories(criteria);
	drawLevelInfo();
	refreshTable();
	if(uiFilter["highscore"]){
		var totalscores = shoppingCart.totalScore.toCsv();
		var rank = [];
		rank.push(["simplerank" , totalscores[3] > totalscores[4] ? totalscores[3] : totalscores[4]]);
		rank.push(["cuterank" , totalscores[5] > totalscores[6] ? totalscores[5] : totalscores[6]]);
		rank.push(["activerank" , totalscores[7] > totalscores[8] ? totalscores[7] : totalscores[8]]);
		rank.push(["purerank" , totalscores[9] > totalscores[10] ? totalscores[9] : totalscores[10]]);
		rank.push(["coolrank" , totalscores[11] > totalscores[12] ? totalscores[11] : totalscores[12]]);
		rank.sort(function(a,b){
			return b[1] - a[1];
		});
		var numstr = ["Ⅰ","Ⅱ","Ⅲ","Ⅳ","Ⅴ"];
		for(var r  in rank){
			$("#" + rank[r][0]).text(numstr[r]);
		}
	}
}

function accMul(arg1, arg2) {
	var m = 0,
	s1 = arg1.toString(),
	s2 = arg2.toString();
	try {
		m += s1.split(".")[1].length
	} catch (e) {}
	try {
		m += s2.split(".")[1].length
	} catch (e) {}
	return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m)
}

function tagToBonus(criteria, id) {
	var tag = $('#' + id).val();
	var bonus = null;
	if (tag.length > 0) {
		var base = $('#' + id + 'base :selected').text();
		var weight = parseFloat($('#' + id + 'weight').val());
		if ($('input[name=' + id + 'method]:radio:checked').val() == 'replace') {
			bonus = replaceScoreBonusFactory(base, weight, tag)(criteria);
		} else {
			bonus = addScoreBonusFactory(base, weight, tag)(criteria);
		}
		if (!criteria.bonus) {
			criteria.bonus = [];
		}
		criteria.bonus.push(bonus);
	}
}

function clearTag(id) {
	$('#' + id).val('');
	$('#' + id + 'base').val('SS');
	$('#' + id + 'weight').val('1');
	$($('input[name=' + id + 'method]:radio').get(0)).prop("checked", true);
	$($('input[name=' + id + 'method]:radio').get(0)).parent().addClass("active");
	$($('input[name=' + id + 'method]:radio').get(1)).parent().removeClass("active");
}

function bonusToTag(idx, info) {
	$('#tag' + idx).val(info.tag);
	if (info.replace) {
		$($('input[name=tag' + idx + 'method]:radio').get(1)).prop("checked", true);
		$($('input[name=tag' + idx + 'method]:radio').get(1)).parent().addClass("active");
		$($('input[name=tag' + idx + 'method]:radio').get(0)).parent().removeClass("active");
	} else {
		$($('input[name=tag' + idx + 'method]:radio').get(0)).prop("checked", true);
		$($('input[name=tag' + idx + 'method]:radio').get(0)).parent().addClass("active");
	}
	$('#tag' + idx + 'base').val(info.base);
	$('#tag' + idx + 'weight').val(info.weight);
}

var uiFilter = {};
function onChangeUiFilter() {
	uiFilter = {};
	$('.fliter:checked').each(function () {
		uiFilter[$(this).val()] = true;
	});

	if(uiFilter["toulan"]){
		$("#onekey").text("懒黑攻略");
	}
	else{
		$("#onekey").text("一键攻略");		
	}
	
	if (currentCategory && currentCategory != 'switchall') {
		if (CATEGORY_HIERARCHY[currentCategory].length > 1) {
			$('input[name=category-' + currentCategory + ']:checked').each(function () {
				uiFilter[$(this).val()] = true;
			});
		} else {
			uiFilter[currentCategory] = true;
		}
	}
	
	if(currentCategory == 'switchall'){
		for (var c in CATEGORY_HIERARCHY) {
			if (CATEGORY_HIERARCHY[c].length > 1) {
				for (var i in CATEGORY_HIERARCHY[c]) {
					uiFilter[CATEGORY_HIERARCHY[c][i]] = true;
				}
			}
			uiFilter[c] = true;
		}
	}
	refreshTable();
}

function refreshTable() {
	drawTable(filtering(criteria, uiFilter), "clothes", false);
}

function chooseAccessories(accfilters) {
	shoppingCart.clear();
	shoppingCart.putAll(filterTopAccessories(clone(accfilters)));
	shoppingCart.putAll(filterTopClothes(clone(accfilters)));
	refreshShoppingCart();
}

function refreshShoppingCart() {
	shoppingCart.calc(criteria);
	drawTable(shoppingCart.toList(byCategoryAndScore), "shoppingCart", true);
}

function drawLevelInfo() {
	var info = "";
	var $skill = $("#skillInfo");
	var $categoryF = $("#categoryFInfo");
	var $hint = $("#hintInfo");
	$skill.empty();
	$hint.empty();
	$categoryF.empty();
	if (currentLevel) {
		var log = [];
		if (currentLevel.filter) {
			if (currentLevel.filter.tagWhitelist) {
				log.push("tag允许: [" + currentLevel.filter.tagWhitelist + "]");
			}
			if (currentLevel.filter.nameWhitelist) {
				log.push("名字含有: [" + currentLevel.filter.nameWhitelist + "]");
			}
		}
		if (currentLevel.additionalBonus) {
			for (var i in currentLevel.additionalBonus) {
				var bonus = currentLevel.additionalBonus[i];
				var match = "(";
				if (bonus.tagWhitelist) {
					match += "tag符合: " + bonus.tagWhitelist + " ";
				}
				if (bonus.nameWhitelist) {
					match += "名字含有: " + bonus.nameWhitelist;
				}
				match += ")";
				log.push(match + ": [" + bonus.note + " " + bonus.param + "]");
			}
		}
		if (currentLevel.hint) {
			notF = "";
			if (currentLevel.hint[0] && currentLevel.hint[0] != '') {
				var $hintInfo = $("<font>").text("过关提示:  ").addClass("hintInfo");
				$hint.append($hintInfo).append(currentLevel.hint[0]);
			}
			if (currentLevel.hint[1] && currentLevel.hint[1] != '') {
				var $notF = $("<font>").text("可穿戴部件:  ").addClass("not_f");
				$categoryF.append($notF).append(currentLevel.hint[1]);
			}
			$categoryF.append($("<br>"));
			if (currentLevel.hint[2] && currentLevel.hint[2] != '') {
				var $isF = $("<font>").text("会导致F的部件: ").addClass("is_f");
				$categoryF.append($isF).append(currentLevel.hint[2]);
			}
		}
		if (currentLevel.skills) {
			var $shaonv,
			$gongzhu,
			$normal,
			shaonvSkill,
			gongzhuSkill,
			normalSkill;
			if (currentLevel.skills[0]) {
				$shaonv = $("<font>").text("少女级技能:  ").addClass("shaonvSkill");
				shaonvSkill = "";
				for (var i in currentLevel.skills[0]) {
					shaonvSkill += (currentLevel.skills[0][i] + "  ");
				}
			}
			if (currentLevel.skills[1]) {
				$gongzhu = $("<font>").text("公主级技能:  ").addClass("gongzhuSkill");
				gongzhuSkill = "";
				for (var i in currentLevel.skills[1]) {
					gongzhuSkill += (currentLevel.skills[1][i] + "  ");
				}
			}
			if (currentLevel.skills[2]) {
				$normal = $("<font>").text("技能:  ").addClass("normalSkill");
				normalSkill = "";
				for (var i in currentLevel.skills[2]) {
					normalSkill += (currentLevel.skills[2][i] + "  ");
				}
			}
			$skill.append($shaonv).append(shaonvSkill)
			.append($gongzhu).append(gongzhuSkill)
			.append($normal).append(normalSkill);
		}

		info = log.join(" ");
	}
	$("#tagInfo").text(info);
}

function byCategoryAndScore(a, b) {
	var cata = category.indexOf(a.type.type);
	var catb = category.indexOf(b.type.type);
	return (cata - catb == 0) ? b.sumScore - a.sumScore : cata - catb;
}
function byCategory(a, b) {
	var cata = category.indexOf(a);
	var catb = category.indexOf(b);
	return cata - catb;
}

function byScore(a, b) {
	return a.sumScore - b.sumScore == 0 ? a.id - b.id : b.sumScore - a.sumScore;
}

function byScoreS(Num) {
	return function(a, b) {
		return accSumScore(a,Num) - accSumScore(b,Num) == 0 ? a.id - b.id : accSumScore(b,Num) - accSumScore(a,Num);
	}
}

function byId(a, b) {
	var cata = category.indexOf(a.type.type);
	var catb = category.indexOf(b.type.type);
	return (cata - catb == 0) ? a.id - b.id : cata - catb;
}

function filterTopAccessories(filters) {
	filters['own'] = true;
	var accCate = CATEGORY_HIERARCHY['饰品'];
	var accCNum = accCateNum;
	var accSNum = 9;
	for (var i in accCate) {
		filters[accCate[i]] = true;
	}
	for (var i in skipCategory) {
		filters[skipCategory[i]] = false;
	}
	var resultS = {}; var resultAll = {};
	for (var i in clothes) {
		if (matches(clothes[i], {}, filters)) {
			clothes[i].calc(filters);
			if (clothes[i].isF || clothes[i].sumScore <= 0) continue;
			if (!resultS[clothes[i].type.type]) {
				resultS[clothes[i].type.type] = clothes[i];
			} else if (accSumScore(clothes[i],accSNum) > accSumScore(resultS[clothes[i].type.type],accSNum)) {
				resultS[clothes[i].type.type] = clothes[i];
			}
			if (!resultAll[clothes[i].type.type]) {
				resultAll[clothes[i].type.type] = clothes[i];
			} else if (accSumScore(clothes[i],accCNum) > accSumScore(resultAll[clothes[i].type.type],accCNum)) {
				resultAll[clothes[i].type.type] = clothes[i];
			}
		}
	}
	var toSortS = []; var totalS = 0;
	for (var c in resultS) {
		toSortS.push(resultS[c]);
	}
	toSortS.sort(byScoreS(accSNum));
	if (toSortS.length > accSNum) toSortS = toSortS.slice(0, accSNum);
	for (var i in toSortS) {
		totalS += accSumScore(toSortS[i], accSNum);
	}
	var toSortAll = []; var totalAll = 0;
	for (var c in resultAll) {
		toSortAll.push(resultAll[c]);
		totalAll += accSumScore(resultAll[c], accCNum);
	}
	if (totalS > totalAll || uiFilter["acc9"] ) return toSortS;
	else return toSortAll;
}

function filterTopClothes(filters) {
	filters['own'] = true;
	//var accCate = CATEGORY_HIERARCHY['饰品'];
	for (var i in CATEGORY_HIERARCHY) {
		if (i == "袜子") {
			filters[CATEGORY_HIERARCHY[i][0]] = true;
			filters[CATEGORY_HIERARCHY[i][1]] = true;
		}
		if (i != "饰品") {
			filters[CATEGORY_HIERARCHY[i]] = true;
		}
	}
	for (var i in skipCategory) {
		filters[skipCategory[i]] = false;
	}
	var result = {};
	for (var i in clothes) {
		if (matches(clothes[i], {}, filters)) {
			clothes[i].calc(filters);
			if (clothes[i].isF || clothes[i].sumScore <= 0) continue;
			if (!result[clothes[i].type.type]) {
				result[clothes[i].type.type] = clothes[i];
			} else if (clothes[i].sumScore > result[clothes[i].type.type].sumScore) {
				result[clothes[i].type.type] = clothes[i];
			}
		}
	}
	if(result["上装"] && result["下装"] && result["连衣裙"]){
		if(result["上装"].sumScore + result["下装"].sumScore > result["连衣裙"].sumScore){
			delete result["连衣裙"];
		}
		else{
			delete result["上装"];
			delete result["下装"];
		}
	}else if((result["上装"] || result["下装"]) && result["连衣裙"]){
		delete result["上装"];
		delete result["下装"];
	}
	return result;
}

function filtering(criteria, filters) {
	var result = [];
	var result2 = [];
	for (var i in clothes) {
		if (matches(clothes[i], criteria, filters)) {
			clothes[i].calc(criteria);
			result.push(clothes[i]);
		}
	}
	var haveCriteria = false;
	for (var prop in criteria) {
		if (criteria[prop] != 0) {
			haveCriteria = true;
		}
	}
	if (haveCriteria) {
		if (filters.sortbyscore)
			result.sort(byScore);
		else
			result.sort(byCategoryAndScore);
	} else {
		if (filters.sortbyscore)
			result.sort(byScore);
		else
			result.sort(byId);
	}

	if ($("#showmore").attr("isshowmore") == 1) {
		var size = 10;
		if (result[0] && result[0].type.mainType == "饰品")
			size = 5;
		var tsize = size;
		for (var i in result) {
			if (i > 0 && result[i].type.type != result[i - 1].type.type)
				tsize = size;
			if (tsize > 0)
				result2.push(result[i]);
			tsize--;
		}
		if (filters.sortbyscore)
			result2.sort(byScore);
		else
			result.sort(byCategoryAndScore);
		return result2;
	}
	return result;
}

function matches(c, criteria, filters) {
	return ((c.own && filters.own) || (!c.own && filters.missing)) && filters[c.type.type];
}

function loadCustomInventory() {
	var myClothes = $("#myClothes").val();
	if (myClothes.indexOf('|') > 0) {
		loadNew(myClothes);
	} else {
		load(myClothes);
	}
	saveAndUpdate();
	refreshTable();
}

function toggleAll(c) {
	var all = $('#all-' + c)[0].checked;
	var x = $('input[name=category-' + c + ']:checkbox');
	x.each(function () {
		this.checked = all;
	});
	onChangeUiFilter();
}

function drawFilter() {//refactor me
	out = "<ul class='nav nav-tabs nav-justified' id='categoryTab'>";
	for (var c in CATEGORY_HIERARCHY) {
		out += '<li id="' + c + '"><a href="javascript:void(0)" onClick="switchCate(\'' + c + '\')">' + c + '&nbsp;&nbsp;<span class="badge">0</span></a></li>';
	}
		out += '<li id="switchall"><a href="javascript:void(0)" onClick="switchCate(\'switchall\')">全部&nbsp;&nbsp;<span class="badge"></span></a></li>';
	out += "</ul>";
	for (var c in CATEGORY_HIERARCHY) {
		out += '<div id="category-' + c + '">';
		if (CATEGORY_HIERARCHY[c].length > 1) {
			// draw a select all checkbox...
			out += "<label><input type='checkbox' id='all-" + c + "' onClick='toggleAll(\"" + c + "\")' checked>全选</label><br/>";
			// draw sub categories
			for (var i in CATEGORY_HIERARCHY[c]) {
				out += "<label class='filterlabel'><input type='checkbox' name='category-" + c + "' value='" + CATEGORY_HIERARCHY[c][i]
				 + "'' id='" + CATEGORY_HIERARCHY[c][i] + "' onClick='onChangeUiFilter()' checked />" + CATEGORY_HIERARCHY[c][i].split("-")[1] + "</label>\n";
			}
		}
		out += '</div>';
	}
	$('#category_container').html(out);
}

var currentCategory;
function switchCate(c) {
	$("#searchResultList").html('');
	currentCategory = c;
	$("ul#categoryTab li").removeClass("active");
	$("#category_container div").removeClass("active");
	$("#" + c).addClass("active");
	$("#category-" + c).addClass("active");
	onChangeUiFilter();
	ReDrawcloneHeaderRow();
	return false;
}

function changeFilter() {
	$("#theme")[0].options[0].selected = true;
	currentLevel = null;
	if (uiFilter['highscore']) autogenLimit();
	else onChangeCriteria();
}

function changeThemeFliter(){
	var themeOptions = $("#theme option");
	var fliterStr = $("#theme-fliter").val();
	for(var i = 1; i < themeOptions.length; i++){
		var themeOption = $(themeOptions[i]);
		if(themeOption.text().indexOf(fliterStr)>=0 || fliterStr == "筛选"){
			themeOption.show();			
		}
		else{
			themeOption.hide();
		}
	}
	
}

function changeTheme() {
	currentLevel = null;
	global.additionalBonus = null;
	var theme = $("#theme").val();
	if (allThemes[theme]) {
		setFilters(allThemes[theme]);
	}
	if (uiFilter['highscore']) autogenLimit();
	else onChangeCriteria();
}

var currentLevel; // used for post filtering.
function setFilters(level) {
	currentLevel = level;
	global.additionalBonus = currentLevel.additionalBonus;
	var weights = level.weight;
	for (var i in FEATURES) {
		var f = FEATURES[i];
		var weight = weights[f];
		if (uiFilter["balance"]) {
			if (weight > 0) {
				weight = 1;
			} else if (weight < 0) {
				weight = -1;
			}
		}
		$('#' + f + 'Weight').val(Math.abs(weight));
		var radios = $('input[name=' + f + ']:radio');
		for (var j = 0; j < radios.length; j++) {
			var element = $(radios[j]);
			if (parseInt(element.attr("value")) * weight > 0) {
				element.prop("checked", true);
				element.parent().addClass("active");
			} else if (element.parent()) {
				element.parent().removeClass("active");
			}
		}
	}
	clearTag('tag1');
	clearTag('tag2');
	if (level.bonus) {
		for (var i in level.bonus) {
			bonusToTag(parseInt(i) + 1, level.bonus[i]);
		}
	}
}

function drawTheme() {
	var dropdown = $("#theme")[0];
	var def = document.createElement('option');
	def.text = '自定义关卡';
	def.value = 'custom';
	dropdown.add(def);
	for (var theme in allThemes) {
		var option = document.createElement('option');
		option.text = theme;
		option.value = theme;
		dropdown.add(option);
	}
	
	var dropdown2 = $("#theme-fliter")[0];
	var def2 = document.createElement('option');
	def2.text = '筛选';
	def2.value = 'custom';
	dropdown2.add(def2);
	for (var index in themeFilter) {
		var option = document.createElement('option');
		option.text = themeFilter[index][0];
		option.value = themeFilter[index][1];
		dropdown2.add(option);
	}
}

function drawImport() {
	var dropdown = $("#importCate")[0];
	var def = document.createElement('option');
	def.text = '请选择类别';
	def.value = '';
	dropdown.add(def);
	for (var cate in scoring) {
		var option = document.createElement('option');
		option.text = cate;
		option.value = cate;
		dropdown.add(option);
	}
}

function clearImport() {
	$("#importData").val("");
}

function saveAndUpdate() {
	var mine = save();
	updateSize(mine);
}

function updateSize(mine) {
	$("#inventoryCount").text('(' + mine.size + ')');
	$("#myClothes").val(mine.serialize());
	var subcount = {};
	for (c in mine.mine) {
		var type = c.split('-')[0];
		if (!subcount[type]) {
			subcount[type] = 0;
		}
		subcount[type] += mine.mine[type].length;
	}
	for (c in subcount) {
		$("#" + c + ">a span").text(subcount[c]);
	}
}

function doImport() {
	var dropdown = $("#importCate")[0];
	var type = dropdown.options[dropdown.selectedIndex].value;
	var raw = $("#importData").val();
	var data = raw.match(/\d+/g);
	var mapping = {}
	for (var i in data) {
		while (data[i].length < 3) {
			data[i] = "0" + data[i];
		}
		mapping[data[i]] = true;
	}
	var updating = [];
	for (var i in clothes) {
		if (clothes[i].type.mainType == type && mapping[clothes[i].id]) {
			updating.push(clothes[i].name);
		}
	}
	var names = updating.join(",");
	if(names.length > 50){
		names = names.substring(0,50) + "...等" + updating.length + "件衣服";
	}
	if (confirm("你将要在>>" + type + "<<中导入：\n" + names)) {
		var myClothes = MyClothes();
		myClothes.filter(clothes);
		if (myClothes.mine[type]) {
			myClothes.mine[type] = myClothes.mine[type].concat(data);
		} else {
			myClothes.mine[type] = data;
		}
		myClothes.update(clothes);
		saveAndUpdate();
		refreshTable();
		clearImport();
	}
}

function goTop() {
	$("html,body").animate({
		scrollTop : 0
	}, 500);
}

function getDistinct(arr){
	var newArr=[];
	for (var i in arr){
		if(jQuery.inArray(arr[i], newArr)<0){
			newArr.push(arr[i]);
		}
	}
	return newArr;
}

function toggleSearchResult(){
	if($("#searchResultCheck").is(':checked')) $('#searchResult').show();
	else $('#searchResult').hide();
}

function searchResult(){
	switchCate(0);
	var searchTxt=$('#searchResultInput').val();
	if (searchTxt){
		var outSet=[];
		for (var i in clothes){
			if(clothes[i].isSuit.indexOf(searchTxt)>=0) {outSet.push(clothes[i].isSuit);}
		}
		if (outSet.length>0) {
			outSet=getDistinct(outSet);
			$('#searchResultList').append(button_search('套装：','searchCate'));
			for (var i in outSet) {$('#searchResultList').append(button_search(outSet[i],'','searchResultSet'));}
			$(".searchResultSet").click(function () {
				switchCate(0);
				var setName=this.innerHTML;
				$('#searchResultList').append(button_search(setName+'：','searchCate'));
				for (var i in clothes){
					if(clothes[i].isSuit==setName) {$('#searchResultList').append(clothesNameTd_Search(clothes[i]));}
				}
			});
		}
		for (var h in CATEGORY_HIERARCHY){
			var outCate=[];
			for (var i in clothes){
				if (clothes[i].type.mainType==h&&clothes[i].name.indexOf(searchTxt)>=0){
					outCate.push(clothesNameTd_Search(clothes[i]));
				}
			}
			if (outCate.length>0){
				$('#searchResultList').append(button_search(h+'：','searchCate'));
				for (var i in outCate){
					$('#searchResultList').append(outCate[i]);
				}
			}
		}
	}
}

function autogenLimit(){
	//onChangeCriteria, calc normal weight
	criteria = {};
	for (var i in FEATURES) {
		var f = FEATURES[i];
		var weight = parseFloat($('#' + f + "Weight").val());
		if (!weight) {
			weight = 1;
		}
		var checked = $('input[name=' + f + ']:radio:checked');
		if (checked.length) {
			criteria[f] = parseInt(checked.val()) * weight;
		}
	}
	tagToBonus(criteria, 'tag1');
	tagToBonus(criteria, 'tag2');
	if (global.additionalBonus && global.additionalBonus.length > 0) {
		criteria.bonus = global.additionalBonus;
	}
	criteria.levelName = $("#theme").val();
	var clothesOrigScore=[];
	for(var i in clothes){
		clothes[i].calc(criteria);
		var sum_score=(clothes[i].type.mainType=='饰品') ? Math.round(accSumScore(clothes[i],(uiFilter["acc9"]?9:accCateNum))) : clothes[i].sumScore;
		clothesOrigScore[i]=sum_score;
	}
	
	//start loop
	var scoreTotal=0;
	var boosts=[];
	var ownCnt=loadFromStorage().size>0 ? 1 : 0;
	for (var a in FEATURES){
		for (var b in FEATURES){
			if (FEATURES[b]==FEATURES[a]) continue;
			//onChangeCriteria, calc highscore
			criteria = {};
			for (var i in FEATURES) {
				var f = FEATURES[i];
				var weight = parseFloat($('#' + f + "Weight").val());
				if (!weight) {
					weight = 1;
				}
				if (f==FEATURES[b]) {weight=accMul(weight,1.27);criteria.highscore1=f;}
				if (f==FEATURES[a]) {weight=accMul(weight,1.778);criteria.highscore2=f;}
				var checked = $('input[name=' + f + ']:radio:checked');
				if (checked.length) {
					criteria[f] = parseInt(checked.val()) * weight;
				}
			}
			tagToBonus(criteria, 'tag1');
			tagToBonus(criteria, 'tag2');
			if (global.additionalBonus && global.additionalBonus.length > 0) {
				criteria.bonus = global.additionalBonus;
			}
			criteria.levelName = $("#theme").val();
			//calc sumScores
			shoppingCart.clear();
			var currScoreByCate=[];
			for (var i in clothes){
				if (!clothes[i].own&&ownCnt) continue;
				var c=clothes[i].type.type;
				if ($.inArray(c, skipCategory)>=0) continue;
				if (!currScoreByCate[c]) currScoreByCate[c]=0;
				if (clothesOrigScore[i]*1.778 < currScoreByCate[c]) continue; //short cut, no hope to become the new winner; from ip
				clothes[i].calc(criteria);
				var sum_score= (clothes[i].type.mainType=='饰品') ? Math.round(accSumScore(clothes[i],(uiFilter["acc9"]?9:accCateNum))) : clothes[i].sumScore;
				if (sum_score>currScoreByCate[c]) {
					shoppingCart.put(clothes[i]);
					currScoreByCate[c]=sum_score;
				}
			}
			shoppingCart.validate(criteria);
			shoppingCart.calc(criteria);
			var tmpScore=shoppingCart.totalScore.sumScore;
			if (tmpScore>scoreTotal){
				scoreTotal=tmpScore;
				boosts=[FEATURES[b],FEATURES[a]];
			}
		}
	}
	$(".1d27").removeClass("active");
	$(".1d778").removeClass("active");
	$('#' + boosts[0] + "1d27").addClass("active");
	$('#' + boosts[1] + "1d778").addClass("active");
	onChangeCriteria();
}

function initEvent() {
	$("#show_history").click(function () {
		$("#update_history").show();
		$("#show_history").hide();		
		$("#history-update-info-2").html(clothesHistoryNotice);
		$("#history-update-info-3").html(levelHistoryNotice);
		return false;
	});
	$(".fliter").change(function () {
		onChangeUiFilter();
		if (this.value == "balance") {
			changeTheme();
		}
		if (this.value == "highscore") {
			$(".highscore-link").toggle();
			$(".highscore-rank").toggle();
			if ($(this).is(':checked')) autogenLimit();
			else onChangeCriteria();
		}
		if (this.value == "acc9") {
			onChangeCriteria();
		}
	});
	$(".filter-radio").change(function () {
		changeFilter();
	});
	$(".highscore-link").click(function () {
		var has = $(this).hasClass("active");
		if($(this).hasClass("1d27")){
			$(".1d27").removeClass("active");
		}
		if($(this).hasClass("1d778")){
			$(".1d778").removeClass("active");
		}
		if(!has){
			$(this).addClass("active");
		}
		onChangeCriteria();
	});
	$("#sharewardrobe").click(function(){
		shareWardrobe();
	});
	$(".showmore").click(function(){
		var obj  = $(".showmore");
		$(obj[1]).attr("isshowmore", (1 - $(obj[1]).attr("isshowmore")));
		if($(obj[1]).attr("isshowmore") == "1"){
			$(obj[0]).text("↓ 显示全部衣服 ↓");
			$(obj[1]).text("↓ 显示全部衣服 ↓");
		}
		else{
			$(obj[0]).text("↑ 收起衣柜 ↑");
			$(obj[1]).text("↑ 收起衣柜 ↑");
		}
		onChangeUiFilter();
		menuFixed("clothes");
		return false;
	});
	$("#searchResultMode").click(function(){
		if ($(this).hasClass("active")) {$(this).removeClass("active");$(this).html('→衣柜');}
		else {$(this).addClass("active");$(this).html('→购物车');}
	});
	$('#searchResultInput').keydown(function(e) {
		if (e.keyCode==13) {
			$(this).blur();
			searchResult();
		}
	});
	toggleSearchResult();
	initOnekey();
	
	//前台筛选
	$(".front_filter_option").click(function(){
		filterClotherHTML(this);
		 return false;
	});
	$("#add_all").click(function(){
		var clotheslist = {};
		var clothesDivList = $("#clothes .table-body .table-row");		
		for(var i = 0 ; i < clothesDivList.length; i++){
			var $row = $(clothesDivList[i])
			if($row.find(".name.own:first").length > 0 || $row.css("display") == "none"){
				continue;
			}
			var id  = $row.find(".id:first").text();
			var name  = $row.find(".name:first").text();
			var type = $row.find(".category:first").text().split("-")[0];
			if (clotheslist[type]) {
				clotheslist[type]["idlist"].push(id);
				clotheslist[type]["namelist"].push(name);
			} else {
				clotheslist[type] = {};
				clotheslist[type]["idlist"] = [id];
				clotheslist[type]["namelist"] = [name];
			}
		}
		if(clotheslist.length <= 0){
			alert("没有需要添加的部件");
			return;
		}
		var confirmStr = "";
		for(var type in clotheslist){
			var names = clotheslist[type]["namelist"].join(",");
			if(names.length > 50){
				names = names.substring(0,50) + "...等" + clotheslist[type]["namelist"].length + "件衣服";
			}
			confirmStr += "你将要在>>" + type + "<<中导入：\n" + names + "\n";
		}
		if (confirm(confirmStr)) {
			var myClothes = MyClothes();
			myClothes.filter(clothes);
			for(var type in clotheslist){
				if (myClothes.mine[type]) {
					myClothes.mine[type] = myClothes.mine[type].concat(clotheslist[type]["idlist"]);
				} else {
					myClothes.mine[type] = clotheslist[type]["idlist"];
				}
			}
			myClothes.update(clothes);
			saveAndUpdate();
			refreshTable();
		}
	});
}

function filterClotherHTML(btn){
		var clothesDivList = $("#clothes .table-body .table-row");
		var str = "";
		var cls = ".source:first";
		var type = 0;
		switch($(btn).text()){
			case "清空筛选": type = 0; break;
			case "尚缺材料": cls = ".deps:first"; type = 3; break;
			case "暂不缺材料": cls = ".depsFin:first"; type = 3; break;
			case "少女级": str = "少"; type = 1; break;
			case "少女染/进": str = "少"; type = 2; break;
			case "公主级": str = "公"; type = 1;break;
			case "公主染/进": str = "公"; type = 2; break;
			case "店": str = "店"; type = 1;break;
			case "店染/进": str = "店"; type = 2; break;
			case "设计图": str = "设计图"; type = 1;break;
			case "设计图染/进": str = "设计图"; type = 2; break;
			case "活动": str = "活动"; type = 2; break;
			case "迷之屋限定": str = "迷,幻,迷/幻,云禅,昼夜,缥缈,昼夜/兑·时光,云禅/兑·卧云,缥缈/兑·翡翠"; type = -1; break;
			case "迷之屋限定染/进": str = "迷,幻,迷/幻,云禅,昼夜,缥缈,昼夜/兑·时光,云禅/兑·卧云,缥缈/兑·翡翠"; type = -2; break;
			case "3星": str = "3"; cls = ".star:first"; type = 1; break;
			case "4星": str = "4"; cls = ".star:first"; type = 1; break;
			case "5星": str = "5"; cls = ".star:first"; type = 1; break;
			case "赠送/签到": str = "送,签到"; type = 1; break;
			case "套装部件": cls = ".issuit:first"; type = 3; break;
			case "新品": cls = ".version:first"; str=lastVersion; type = 1; break;
		}
		 for(var i = 0 ; i < clothesDivList.length; i++){
			 if(type == 0){//清空
				$(clothesDivList[i]).show();
				continue;
			 }
			var ifhide = true;
			var strs = str.split(",");
			for(var j = 0; j < strs.length; j++){
				if(filterCompare($(clothesDivList[i]), type, cls, strs[j])){
					ifhide = false;
				}
				else{
					ifhide &= filterLoop($(clothesDivList[i]), type, cls, strs[j]);
				}
			}
			if(ifhide){
				$(clothesDivList[i]).hide();	
			}
		 }
}

function filterLoop(obj, type, cls, str){	
	if(filterCompare(obj, type, ".source:first", "定")
		|| filterCompare(obj, type, ".source:first", "进")){
		var id = obj.find(".source:first").text().replace(/(定|进)([0-9]+)[^0-9]*/, "$2");
		var $source = $("#clickable-" + obj.find(".category:first").text().split("-")[0] + id).parent();
		if(filterCompare($source, type, cls, str)){
			return false;
		}
		else{
			return filterLoop($source, type, cls, str);
		}
	}
	return true;
}

function filterCompare(obj, type, cls, str){
	if(str == "定" || str == "进"){
		if(type != 2 && type != -2){
			return false;
		}
		else{
			type = 2;
		}
	}
	if(type == 3){
		return obj.find(cls).text().length > 0;
	}
	if(type > 0){
		return obj.find(cls).text().indexOf(str) >= 0;
	}
	if(type < 0){
		return obj.find(cls).text() == str;
	}
}

function initNotice() {
	$("#update-info-2").html(clothesNotice);
	$("#update-info-3").html(levelNotice);
}

function init() {
	var mine = loadFromStorage();
	calcDependencies();
	drawFilter();
	drawTheme();
	drawImport();
	switchCate(category[0]);
	updateSize(mine);
	refreshShoppingCart();
	initEvent();
}

$(document).ready(function () {
	initNotice();
	init();
	menuFixed("clothes");
});
