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

// for table use
function thead(score, isShoppingCart) {
	var ret = "<tr>";
	if (score) {
		ret += "<th class='score'>分数</th>";
	}

	ret += "<th class='name'>名称</th>\
	  <th class='category'>类别</th>\
	  <th class='th_number'>编号</th>\
	  <th>心级</th>\
	  <th>简约</th>\
	  <th>华丽</th>\
	  <th>可爱</th>\
	  <th>成熟</th>\
	  <th>活泼</th>\
	  <th>优雅</th>\
	  <th>清纯</th>\
	  <th>性感</th>\
	  <th>清凉</th>\
	  <th>保暖</th>\
	  <th class='th_tag'>特殊属性</th>\
	  <th class='th_from'>来源</th>"
	if (isShoppingCart)
		ret += "<th class='th_nbsp'></th>";
	else
		ret += "<th class='th_nbsp gotop' onclick='goTop()'></th>";
	return ret + "</tr>\n";
}

function tr(tds) {
	return "<tr>" + tds + "</tr>\n";
}

function td(data, cls) {
	return "<td class='" + cls + "'>" + data + "</td>";
}

function shoppingCartButton(type, id) {
	return "<button class='glyphicon glyphicon-shopping-cart btn btn-default' onClick='addShoppingCart(\"" + type + "\",\"" + id
	 + "\")'></button>";
}

function removeShoppingCartButton(detailedType) {
	return "<button class='glyphicon glyphicon-trash' onClick='removeShoppingCart(\"" + detailedType + "\")'></button>";
}

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

function toggleInventory(type, id, thisbtn) {
	var checked = !clothesSet[type][id].own;
	clothesSet[type][id].own = checked;
	$(thisbtn).next().val(checked ? 1 : 0);
	inputClotheNum(type, id, checked ? 1 : 0);
}

function inputClotheNum(type, id, num) {
	if (num == 0) {
		clothesSet[type][id].own = false;
		clothesSet[type][id].num = 0;
		$('#clickable-' + type + id).removeClass('own');
	} else if (num > 0) {
		clothesSet[type][id].own = true;
		clothesSet[type][id].num = num;
		$('#clickable-' + type + id).addClass('own');
	}
	saveAndUpdate();
}

function clickableTd(piece) {
	var name = piece.name;
	var type = piece.type.mainType;
	var id = piece.id;
	var own = piece.own;
	var deps = piece.getDeps('');
	var tooltip = '';
	var cls = 'name';
	var num = piece.num;
	if (deps && deps.length > 0) {
		tooltip = "tooltip='" + deps + "'";
		if (deps.indexOf('(缺)') > 0) {
			cls += ' deps';
		}
	}
	cls += own ? ' own' : '';
	return "<td id='clickable-" + (type + id) + "' class='" + cls
	 + "'><a href='#dummy' class='button' " + tooltip
	 + "onClick='toggleInventory(\"" + type + "\",\"" + id + "\",this)'>"
	 + name + "</a><input class='input_num " + (uiFilter["clothes_num"] == undefined ? "hide" : "") + "' value='" + num + "' oninput='inputClotheNum(\"" + type + "\",\"" + id + "\",this.value)'/></td>";
}

function row(piece, isShoppingCart) {
	var ret = "";
	ret += td(piece.tmpScore);
	if (isShoppingCart) {
		ret += td(piece.name, '');
	} else {
		ret += clickableTd(piece);
	}
	var csv = piece.toCsv();
	for (var i in csv) {
		ret += td(render(csv[i]), getStyle(csv[i]));
	}
	if (isShoppingCart) {
		// use id to detect if it is a fake clothes
		if (piece.id) {
			ret += td(removeShoppingCartButton(piece.type.type), '');
		}
	} else {
		ret += td(shoppingCartButton(piece.type.mainType, piece.id), '');
	}
	return tr(ret);
}

function render(rating) {
	if (rating.charAt(0) == '-') {
		return rating.substring(1);
	}
	return rating;
}

function getStyle(rating) {
	if (rating.charAt(0) == '-') {
		return 'negative';
	}
	switch (rating) {
	case "SS":
		return 'S';
	case "S":
		return 'S';
	case "A":
		return 'A';
	case "B":
		return 'B';
	case "C":
		return 'C';
	default:
		return "";
	}
}

function list(rows, isShoppingCart) {
	ret = "";
	if (isShoppingCart) {
		ret += row(shoppingCart.totalScore, isShoppingCart);
	}
	for (var i in rows) {
		ret += row(rows[i], isShoppingCart);
	}
	return ret;
}

function drawTable(data, div, isShoppingCart) {
	if ($('#' + div + ' table').length == 0) {
		if (isShoppingCart) {
			$('#' + div).html("<table id='tb_" + div + "'><thead></thead><tbody></tbody></table>");
		} else {
			$('#' + div).html("<table id='tb_" + div + "' class='mainTable'><thead></thead><tbody></tbody></table>");
		}
	}
	$('#' + div + ' table thead').html(thead(true, isShoppingCart));
	$('#' + div + ' table tbody').html(list(data, isShoppingCart));
	if (!isShoppingCart) {
		redrawThead();
	}
}

function redrawThead() {
	$('button.destoryFloat').text(global.floating ? '关闭浮动' : '打开浮动');
	$('th.top').html(global.floating ? "<a href='#filtersTop'>回到顶部</a>" : "");
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
		if(uiFilter["highscore"]){
			var highscore1 = $('#' + f + "1d778.active").length ? 1.778 : 1;
			var highscore2 = $('#' + f + "1d27.active").length ? 1.27 : 1;
			weight = weight * highscore1 * highscore2;
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
		console.log(rank);
	}
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

	if (currentCategory) {
		if (CATEGORY_HIERARCHY[currentCategory].length > 1) {
			$('input[name=category-' + currentCategory + ']:checked').each(function () {
				uiFilter[$(this).val()] = true;
			});
		} else {
			uiFilter[currentCategory] = true;
		}
	}
	refreshTable();
}

function refreshTable() {
	drawTable(filtering(criteria, uiFilter), "clothes", false);
}

function clone(obj) {
	var o;
	if (typeof obj == "object") {
		if (obj === null) {
			o = null;
		} else {
			if (obj instanceof Array) {
				o = [];
				for (var i = 0, len = obj.length; i < len; i++) {
					o.push(clone(obj[i]));
				}
			} else {
				o = {};
				for (var j in obj) {
					o[j] = clone(obj[j]);
				}
			}
		}
	} else {
		o = obj;
	}
	return o;
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
	var $hint = $("#hintInfo");
	$skill.empty();
	$hint.empty();
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
		if (currentLevel.hint) {
			var $hintInfo = $("<font>").text("过关提示:  ").addClass("hintInfo");
			$hint.append($hintInfo).append(currentLevel.hint);
		}

		info = log.join(" ");
	}
	$("#tagInfo").text(info);
}

function byCategoryAndScore(a, b) {
	var cata = category.indexOf(a.type.type);
	var catb = category.indexOf(b.type.type);
	return (cata - catb == 0) ? b.tmpScore - a.tmpScore : cata - catb;
}
function byCategory(a, b) {
	var cata = category.indexOf(a);
	var catb = category.indexOf(b);
	return cata - catb;
}

function byScore(a, b) {
	return b.tmpScore - a.tmpScore;
}

function byId(a, b) {
	var cata = category.indexOf(a.type.type);
	var catb = category.indexOf(b.type.type);
	return (cata - catb == 0) ? a.id - b.id : cata - catb;
}

function filterTopAccessories(filters) {
	filters['own'] = true;
	var accCate = CATEGORY_HIERARCHY['饰品'];
	for (var i in accCate) {
		filters[accCate[i]] = true;
	}
	var result = {};
	for (var i in clothes) {
		if (matches(clothes[i], {}, filters)) {
			clothes[i].calc(filters);
			if (!result[clothes[i].type.type]) {
				result[clothes[i].type.type] = clothes[i];
			} else if (clothes[i].tmpScore > result[clothes[i].type.type].tmpScore) {
				result[clothes[i].type.type] = clothes[i];
			}
		}
	}
	var toSort = [];
	for (var c in result) {
		toSort.push(result[c]);
	}
	toSort.sort(byScore);
	var total = 0;
	var i;
	for (i = 0; i < toSort.length; i++) {
		realScoreBefore = accScore(total, i);
		realScore = accScore(total + toSort[i].tmpScore, i + 1);
		if (realScore < realScoreBefore) {
			break;
		}
		total += toSort[i].tmpScore;
	}
	return toSort.slice(0, i);
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
	var result = {};
	for (var i in clothes) {
		if (matches(clothes[i], {}, filters)) {
			clothes[i].calc(filters);
			if (!result[clothes[i].type.type]) {
				result[clothes[i].type.type] = clothes[i];
			} else if (clothes[i].tmpScore > result[clothes[i].type.type].tmpScore) {
				result[clothes[i].type.type] = clothes[i];
			}
		}
	}
	if(result["上装"].tmpScore + result["下装"].tmpScore > result["连衣裙"].tmpScore){
		delete result["连衣裙"];
	}
	else{
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
		result.sort(byCategoryAndScore);
	} else {
		result.sort(byId);
	}

	if (filters.toplevel) {
		var size = 10;
		if (result[0].type.mainType == "饰品")
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
	var myClothesNum = $("#myClothesNum").val();
	if (myClothes.indexOf('|') > 0) {
		loadNew(myClothes, myClothesNum);
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

function drawFilter() {
	out = "<ul class='nav nav-tabs nav-justified' id='categoryTab'>";
	for (var c in CATEGORY_HIERARCHY) {
		out += '<li id="' + c + '"><a href="#dummy" onClick="switchCate(\'' + c + '\')">' + c + '&nbsp;&nbsp;<span class="badge">0</span></a></li>';
	}
	out += "</ul>";
	for (var c in CATEGORY_HIERARCHY) {
		out += '<div id="category-' + c + '">';
		if (CATEGORY_HIERARCHY[c].length > 1) {
			// draw a select all checkbox...
			out += "<label><input type='checkbox' id='all-" + c + "' onClick='toggleAll(\"" + c + "\")' checked>全选</label><br/>";
			// draw sub categories
			for (var i in CATEGORY_HIERARCHY[c]) {
				out += "<label style='width:180px'><input type='checkbox' name='category-" + c + "' value='" + CATEGORY_HIERARCHY[c][i]
				 + "'' id='" + CATEGORY_HIERARCHY[c][i] + "' onClick='onChangeUiFilter()' checked />" + CATEGORY_HIERARCHY[c][i] + "</label>\n";
			}
		}
		out += '</div>';
	}
	$('#category_container').html(out);
}

var currentCategory;
function switchCate(c) {
	currentCategory = c;
	$("ul#categoryTab li").removeClass("active");
	$("#category_container div").removeClass("active");
	$("#" + c).addClass("active");
	$("#category-" + c).addClass("active");
	onChangeUiFilter();
}

function changeFilter() {
	$("#theme")[0].options[0].selected = true;
	currentLevel = null;
	onChangeCriteria();
}

function changeTheme() {
	currentLevel = null;
	global.additionalBonus = null;
	var theme = $("#theme").val();
	if (allThemes[theme]) {
		setFilters(allThemes[theme]);
	}
	onChangeCriteria();
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
	$("#myClothesNum").val(mine.serializeNum());
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

function initEvent() {
	$("#tb_clothes").freezeHeader();
	$("#show_history").click(function () {
		$("#update_history").show();
		$("#show_history").hide();
		return false;
	});
	$("#advanced_options").click(function () {
		$("#advanced_options_span").show();
		$("#advanced_options").hide();
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
	initOnekey();
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
	onChangeCriteria();
}
$(document).ready(function () {
	init()
});