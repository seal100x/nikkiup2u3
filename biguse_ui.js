function theadBiguse(isShoppingCart) {
	var $thead = $("<div>").addClass("table-head");
	$thead.append(td("分数", "score"));
	$thead.append(td("名称", "name"));
	$thead.append(td("图片", ""));
	$thead.append(td("部件大小", "area"));
	$thead.append(td("部件颜色", "color1"));
	$thead.append(td("搜索用颜色", "color2"));
	$thead.append(td("类别", "category"));
	$thead.append(td("编号", "th_number"));
	$td_nbsp = td("", "");
	if (!isShoppingCart) {
		$td_nbsp = td("回到顶部", "th_gotop");
		$td_nbsp.addClass("gogogo-top");
		$td_nbsp.click(function () {
			goTop();
		});
	}
	$thead.append(td("", ""));
	$thead.append($td_nbsp);
	
	return $thead;
}

function rowBiguse(piece, isShoppingCart, index) {
	var $row = $("<div>").addClass("table-row");
	var $lineTop = $row;
	//var $lineTop = $("<div>").addClass("table-line");
	$lineTop.append(td(piece.sumScore, 'score'));
	if (isShoppingCart) {
		$lineTop.append(td(piece.name, ''));
	} else {
		$lineTop.append(clothesNameTd(piece));
	}
	var csv = piece.toCsv();
	
	var $imagetd = td("点击查看", 'image');
	var typename = render(csv[0]);
	if(typename.indexOf("袜子-") >=0){
		typename = "袜子"
	}
	if(typename.indexOf("饰品-") >=0){
		typename = "饰品"
	}
	var typeid = typename.replace("发型","10").replace("连衣裙","20").replace("外套", "30").replace("上装", "40").replace("下装", "50").replace("袜子", "60").replace("鞋子", "70").replace("饰品", "80").replace("妆容", "90").replace("萤光之灵", "100");
	var longid = (render(csv[1]).length>3 ? typeid.replace("0","") : typeid) + render(csv[1]);
	$imagetd.click(function(){
		$("#imgModel").show();
		$("#imgModel").css("background-image", "url(http://seal100x.github.io/nikkiup2u3_img/" +  longid + ".png)");
		$("#imgInfo").text(piece.name);
	});
	$lineTop.append($imagetd);
	if(wardrobe2[longid]){
		$lineTop.append(td(wardrobe2[longid][0], "area"));
		
	var colortd1 = td("", "");
	colortd1.css("background", "rgb("+ wardrobe2[longid][1]+ ")");
		$lineTop.append(colortd1);
		
	var colortd2 = td( color[wardrobe2[longid][2]][1], "color_search");
	colortd2.css("background", "rgb("+ color[wardrobe2[longid][2]][0]+ ")").css("color","white");
		$lineTop.append(colortd2);
	}
	else if(piece.name != "总分"){
		$lineTop.append(td("尚未收录", "area"));
		$lineTop.append(td("尚未收录", "color1"));
		$lineTop.append(td("尚未收录", "color2"));
	}
	$lineTop.append(td(render(csv[0]), 'category'));
	$lineTop.append(td(render(csv[1]), 'id'));
	if (isShoppingCart) {
		if (piece.id) {
			$lineTop.append(td(removeShoppingCartButton(piece.type.type, index), 'icon'));
		}
	} else {
		$lineTop.append(td(shoppingCartButton(piece.type.mainType, piece.id, 1), 'icon'));
		$lineTop.append(td(shoppingCartButton(piece.type.mainType, piece.id, 2), 'icon'));
	}
	//$row.append($lineTop);
	return $lineTop;
}

function listBiguse(datas, isShoppingCart, index) {
	var $list = $("<div>").addClass("table-body");
	if (isShoppingCart) {
		$list.append(rowBiguse(index == 1 ? shoppingCart1.totalScore : shoppingCart2.totalScore, isShoppingCart));
	}
	for (var i in datas) {
		$list.append(rowBiguse(datas[i], isShoppingCart, index));
	}
	return $list;
}

function clothesNameTd(piece) {
	var cls = "name table-td";
	var deps = piece.getDeps('   ', 1);
	var tooltip = '';
	if (deps && deps.length > 0) {
		tooltip = deps;
		if (deps.indexOf('需') > 0) {
			cls += ' deps';
		}
	}
	cls += piece.own ? ' own' : '';

	var $clothesNameA = $("<a>").attr("href", "#").addClass("button");
	$clothesNameA.text(piece.name);
	if(tooltip != ''){
		$clothesNameA.attr("tooltip",tooltip);
		
	}
	$clothesNameA.click(function () {
		toggleInventory(piece.type.mainType, piece.id, this);
		return false;
	});
	var $clothesNameTd = $("<div>");
	$clothesNameTd.attr("id", "clickable-" + (piece.type.mainType + piece.id));
	$clothesNameTd.addClass(cls);
	$clothesNameTd.append($clothesNameA);
	return $clothesNameTd;
}

function shoppingCartButton(type, id, index) {
	$shoppingCartButton = $("<button>").addClass("btn btn-default").text(index == 1 ? "A" : "B");
	var tShoppingCart = index == 1 ? shoppingCart1 : shoppingCart2;
	$shoppingCartButton.click(function () {
		tShoppingCart.put(clothesSet[type][id]);
		refreshShoppingCartBiguse();
	});		
	return $shoppingCartButton;
}

function removeShoppingCartButton(detailedType, index) {
	$removeShoppingCartButton = $("<button>").addClass('glyphicon glyphicon-trash btn btn-xs btn-default');
	var tShoppingCart = index == 1 ? shoppingCart1 : shoppingCart2;
	$removeShoppingCartButton.click(function () {
		tShoppingCart.remove(detailedType);
		refreshShoppingCartBiguse();
	});
	return $removeShoppingCartButton;
}

function refreshShoppingCartBiguse() {
	shoppingCart1.calc(criteria);
	shoppingCart2.calc(criteria);
	drawTable(shoppingCart1.toList(byCategoryAndScore), "shoppingCart1", true, 1);
	drawTable(shoppingCart2.toList(byCategoryAndScore), "shoppingCart2", true, 2);
	var socreA = 1 * $("#shoppingCart1 .table-row:first .score").text();
	var scoreB = 1 * $("#shoppingCart2 .table-row:first .score").text();
	if(socreA >= scoreB * 0.9 && socreA <= scoreB * 1.1){
		$("#advise").text("当前两种搭配分值过于接近, 建议去询问群里的小伙伴后再选择");
	}
	else{
		var info = "搭配A:" + socreA + "分, 搭配B: " + scoreB + "分, 当前搭配情况下选择   [" + (socreA > scoreB ? "A" : "B") + "]    ";
		$("#advise").text(info);
	}
}

function drawTable(data, divId, isShoppingCart, index) {
	if(divId != "shoppingCart"){
		var $table = $('#' + divId);
		$table.empty();
		$table.append(theadBiguse(isShoppingCart));
		$table.append(listBiguse(data, isShoppingCart, index));
		return;
	}
	var $table = $('#' + divId + "1");
	$table.empty();
	$table.append(theadBiguse(isShoppingCart));
	$table.append(listBiguse([], isShoppingCart, 1));
	var $table2 = $('#' + divId + "2");
	$table2.empty();
	$table2.append(theadBiguse(isShoppingCart));
	$table2.append(listBiguse([], isShoppingCart, 2));		
}


function initAutoComplete(){
var match = function(query, done){
			var result = {
				suggestions : []
			};
			for (var i in clothes) {
				if (clothes[i].name.indexOf(query) >= 0) {
					result.suggestions.push({"value" : clothes[i].name , "data" : clothes[i]});
				}
			}
			done(result);
		} 
	$('#autocomplete1').autocomplete({
		lookup: match,
		onSelect: function (suggestion) {
			shoppingCart1.put(clothesSet[suggestion.data.type.mainType][suggestion.data.id]);
			refreshShoppingCartBiguse();
		}
	});
	$('#autocomplete2').autocomplete({
		lookup: match,
		onSelect: function (suggestion) {
			shoppingCart2.put(clothesSet[suggestion.data.type.mainType][suggestion.data.id]);
			refreshShoppingCartBiguse();
		}
	});
	$('#imgInfo').click(function () {
		$("#imgModel").hide();
	});
}

$(document).ready(function () {
	initAutoComplete();
});
