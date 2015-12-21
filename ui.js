
function thead(isShoppingCart) {
	var $thead = $("<div>").addClass("table-head");
	$thead.append(td("分数", "score"));
	$thead.append(td("名称", "name"));
	$thead.append(td("类别", "category"));
	$thead.append(td("编号", "th_number"));
	$thead.append(td("心级", ""));
	$thead.append(td("简约", ""));
	$thead.append(td("华丽", ""));
	$thead.append(td("可爱", ""));
	$thead.append(td("成熟", ""));
	$thead.append(td("活泼", ""));
	$thead.append(td("优雅", ""));
	$thead.append(td("清纯", ""));
	$thead.append(td("性感", ""));
	$thead.append(td("清凉", ""));
	$thead.append(td("保暖", ""));
	$thead.append(td("特殊属性", "th_tag"));
	$thead.append(td("来源", "th_from"));
	$td_nbsp = td("", "th_nbsp");
	if (!isShoppingCart) {
		$td_nbsp.addClass("gogogo-top");
		$td_nbsp.click(function () {
			goTop();
		});
	}
	$thead.append($td_nbsp);
	return $thead;
}

function td(data, cls) {
	return $("<div>").addClass(cls).addClass("table-td").append(data);
}

function row(piece, isShoppingCart) {
	var $row = $("<div>").addClass("table-row");
	var $lineTop = $row;
	//var $lineTop = $("<div>").addClass("table-line");
	$lineTop.append(td(piece.tmpScore));
	if (isShoppingCart) {
		$lineTop.append(td(piece.name, ''));
	} else {
		$lineTop.append(clothesNameTd(piece));
	}
	var csv = piece.toCsv();
	for (var i in csv) {
		$lineTop.append(td(render(csv[i]), getStyle(csv[i])));
	}
	if (isShoppingCart) {
		if (piece.id) {
			$lineTop.append(td(removeShoppingCartButton(piece.type.type), ''));
		}
	} else {
		$lineTop.append(td(shoppingCartButton(piece.type.mainType, piece.id), ''));
	}
	//$row.append($lineTop);
	return $lineTop;
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
		return 'SS';
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

function list(datas, isShoppingCart) {
	var $list = $("<div>").addClass("table-body");
	for (var i in datas) {
		$list.append(row(datas[i], isShoppingCart));
	}
	return $list;
}

function clothesNameTd(piece) {
	var cls = "name";
	var deps = piece.getDeps('');
	var tooltip = '';
	if (deps && deps.length > 0) {
		tooltip = "tooltip='" + deps + "'";
		if (deps.indexOf('(缺)') > 0) {
			cls += ' deps';
		}
	}
	cls += piece.own ? ' own' : '';

	var $clothesNameA = $("<a>").attr("href", "#").addClass("button");
	$clothesNameA.text(name);
	$clothesNameA.addClass(tooltip);
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

function shoppingCartButton(type, id) {
	$shoppingCartButton = $("<button>").addClass("glyphicon glyphicon-shopping-cart btn btn-default");
	$shoppingCartButton.click(function () {
		shoppingCart.put(clothesSet[type][id]);
		refreshShoppingCart();
	});
	return $shoppingCartButton;
}

function removeShoppingCartButton(detailedType) {
	$removeShoppingCartButton = $("<button>").addClass('glyphicon glyphicon-trash');
	$removeShoppingCartButton.click(function () {
		shoppingCart.remove(detailedType);
		refreshShoppingCart();
	});
	return $removeShoppingCartButton;
}

function drawTable(data, divId, isShoppingCart) {
	var $table = $('#' + divId);
	$table.empty();
	$table.append(thead(isShoppingCart));
	$table.append(list(data, isShoppingCart));
}
