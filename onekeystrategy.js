
function showStrategy(){
	var $strategy = $("<div/>").addClass("strategy_info_div");
		
	var theme = allThemes[$("#theme").val()];
	var filters = clone(criteria);
	filters.own = true;
	filters.missing = true;
	
	var $title = p($("#theme").val() == "custom" ? "....." : $("#theme").val(),"title");
	$strategy.append($title);
	
	var $author = p("配装器一键攻略@黑的升华", "author");
	$strategy.append($author);
	
	var $skill_title = p("技能: ", "skill_title");
	$strategy.append($skill_title);
	
	if($("#skillInfo").text()){
		var $skill_ops = p($("#skillInfo").text().replace("公主", "        公主"), "skill_ops");
		$strategy.append($skill_ops);
	}
	else if($("#theme").val().indexOf("竞技场") < 0) {
		var $skill_ops = p("对手技能: ", "skill_ops");
		$strategy.append($skill_ops);		
	}
	
	var $skill_my = p("推荐携带: ", "skill_my");
	if($("#theme").val().indexOf("竞技场") >= 0){
		$skill_my = p("推荐携带: 微笑 飞吻 挑剔 沉睡", "skill_my");
	}
	$strategy.append($skill_my);
	
	var $criteria_title = p("属性-" + (uiFilter["balance"] ? "均衡权重" : "真实权重") + ": ", "criteria_title");
	$strategy.append($criteria_title);
	
	var $criteria = p(getStrCriteria(filters),"criteria");
	$strategy.append($criteria);
	
	var $tag = p(getstrTag(filters), "tag");
	$strategy.append($tag);
	
	if($("#hintInfo").text()){
		var $hint = p($("#hintInfo").text().replace("过关提示:",""), "hint", "过关提示: ", "hint_tiele");
		$strategy.append($hint);
	}
	else if($("#theme").val().indexOf("竞技场") < 0 && $("#theme").val().indexOf("联盟委托") < 0){
		var $hint = p("本关暂无过关提示, 若出现F, 请参考失败后大喵的衣服提示, 或不穿外套进行尝试", "hint", "过关提示: ", "hint_tiele");
		$strategy.append($hint);
	}
	if($("#categoryFInfo").text()){
		var $F = p($("#categoryFInfo").text().replace("","").replace("会导致", "  |  会导致"), "hint", "", "");
		// $strategy.append($F);
	}
		
	var $clotheslist_title = p("推荐搭配: ", "clotheslist_title");
	$strategy.append($clotheslist_title);
	
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
		if (matches(clothes[i], {}, filters)) {
			clothes[i].calc(filters);
			if (!result[clothes[i].type.type]) {
				result[clothes[i].type.type] = new Object()
				result[clothes[i].type.type][0] = clothes[i];
			} else if (clothes[i].sumScore > result[clothes[i].type.type][0].sumScore) {
				result[clothes[i].type.type][3] = result[clothes[i].type.type][2];
				result[clothes[i].type.type][2] = result[clothes[i].type.type][1];
				result[clothes[i].type.type][1] = result[clothes[i].type.type][0];
				result[clothes[i].type.type][0] = clothes[i];
			} else if (!result[clothes[i].type.type][1] || clothes[i].sumScore > result[clothes[i].type.type][1].sumScore) {
				result[clothes[i].type.type][3] = result[clothes[i].type.type][2];
				result[clothes[i].type.type][2] = result[clothes[i].type.type][1];
				result[clothes[i].type.type][1] = clothes[i];				
			} else if (!result[clothes[i].type.type][2] || clothes[i].sumScore > result[clothes[i].type.type][2].sumScore) {
				result[clothes[i].type.type][3] = result[clothes[i].type.type][2];
				result[clothes[i].type.type][2] = clothes[i];				
			} else if (!result[clothes[i].type.type][3] || clothes[i].sumScore > result[clothes[i].type.type][3].sumScore) {
				result[clothes[i].type.type][3] = clothes[i];				
			}
		}
	}
	var typeList = [];
	var resultList = [];
	for (var r in result){
		if(r.indexOf("饰品") >= 0){
			for(var c in result[r]){
				resultList.push(result[r][c]);				
			}
			typeList.push(r);
			delete result[r];
		}
	}
	typeList.sort(byCategory);
	resultList.sort(byScore);
	
	for (var c in category){
		var name = category[c];
		if(name.indexOf("饰品")>=0)
			continue;
		$strategy.append(p(getstrClothes(result[name]), "clothes", name, "clothes_category"));
	}
	
	var accCount = 20;
	if(filters.bonus && filters.bonus[0] && filters.bonus[0].param
		&& filters.bonus[0].param.indexOf("S") >= 0 ){
		accCount = 8;
	}
	$strategy.append(p("————————————饰品(推荐佩戴" + accCount + "件)————————————", "divide"));
		
	for (var t in typeList){
		var accList = [];
		for (var i = 0; i < resultList.length-2; i++){
			if (resultList[i] && resultList[i].type.type == typeList[t]){
				accList.push(resultList[i]);
			}
		}
		if(accList.length > 0)
			$strategy.append(p(getstrClothes(accList), "clothes", typeList[t], "clothes_category"));
	}

	$author_sign = $("<div/>").addClass("stgy_author_sign_div");
	var d = new Date();
	$author_sign.append(p("nikkiup2u3 One Key Strategy@Black Sublimation", "author_sign_name"));
	$author_sign.append(p("generate in " + (1900+d.getYear()) + "-" + (d.getMonth() + 1) + "-" + d.getDate() + " " + d.getHours() + ":" + d.getMinutes(), "author_sign_name"));
	$strategy.append($author_sign);
	
	$("#StrategyInfo").empty().append($strategy);
}

function p(text, cls, text2, cls2){
	var $p = $("<p/>").text(text).addClass("stgy_" + cls);
	if(text2){
		$p.prepend($("<span/>").text(text2).addClass("stgy_" + cls2));
	}
	return $p;
}

function ifCriteriaHighLow(theme){
	var a,b,c,d,e;
	theme.weight["simple"] >= 0 ? a = theme.weight["simple"] : a = -theme.weight["simple"];
	theme.weight["cute"] >= 0 ? b = theme.weight["cute"] : b = -theme.weight["cute"];
	theme.weight["active"] >= 0 ? c = theme.weight["active"] : c = -theme.weight["active"];
	theme.weight["pure"] >= 0 ? d = theme.weight["pure"] : d = -theme.weight["pure"];
	theme.weight["cool"] >= 0 ? e = theme.weight["cool"] : e = -theme.weight["cool"];
	var avg = (a+b+c+d+e)/5;
	var fangcha = (avg-a)*(avg-a) + (avg-b)*(avg-b) + (avg-c)*(avg-c) + (avg-d)*(avg-d) + (avg-e)*(avg-e);
}

function getStrCriteria(filters){
	var strCriteria = "";
	filters["simple"] >= 0 ? strCriteria += "简约" : strCriteria += "华丽";
	strCriteria += " : ";
	filters["cute"] >= 0 ? strCriteria += "可爱" : strCriteria += "成熟";
	strCriteria += " : ";
	filters["active"] >= 0 ? strCriteria += "活泼" : strCriteria += "优雅";
	strCriteria += " : ";
	filters["pure"] >= 0 ? strCriteria += "清纯" : strCriteria += "性感";
	strCriteria += " : ";
	filters["cool"] >= 0 ? strCriteria += "清凉" : strCriteria += "保暖";
	strCriteria += " ≈ ";
	filters["simple"] >= 0 ? strCriteria += filters["simple"] : strCriteria += -filters["simple"];
	strCriteria += " : ";
	filters["cute"] >= 0 ? strCriteria += filters["cute"] : strCriteria += -filters["cute"];
	strCriteria += " : ";
	filters["active"] >= 0 ? strCriteria += filters["active"] : strCriteria += -filters["active"];
	strCriteria += " : ";
	filters["pure"] >= 0 ? strCriteria += filters["pure"] : strCriteria += -filters["pure"];
	strCriteria += " : ";
	filters["cool"] >= 0 ? strCriteria += filters["cool"] : strCriteria += -filters["cool"];
	
	return strCriteria;
}

function getstrTag(filters){
	var str = "";
	
	if(filters.bonus && filters.bonus[0] && filters.bonus[0].tagWhitelist){
		str+="本关有TAG[" + filters.bonus[0].tagWhitelist + "]，加分约" + filters.bonus[0].param;
		if(filters.bonus[1] && filters.bonus[1].tagWhitelist){
			str+="，TAG[" + filters.bonus[1].tagWhitelist + "], 加分约" + filters.bonus[1].param;
		}
	}
	return str;
}

function getstrClothes(result){
	if(result.length == 0)
		return " : 无";
	 var str = " : " + result[0].name + "「" + result[0].sumScore + " " + removeNum(result[0].source) + "」";
	 if(result[1])
		str += " > " + result[1].name + "「" + result[1].sumScore + " " + removeNum(result[1].source) + "」";
	 if(result[2])
		str += " > " + result[2].name + "「" + result[2].sumScore + " " + removeNum(result[2].source) + "」";
	 if(result[3])
		str += " > " + result[3].name + "「" + result[3].sumScore + " " + removeNum(result[3].source) + "」";
	 return str;
}

function removeNum(str){
	if(str.indexOf("定")>=0 || str.indexOf("进")>=0)
		str = str.replace(/[0-9]/g,"");
	str = str.replace("联盟小铺", "盟");
	str = str.replace("设计图", "设");
	str = str.replace("元素重构", "重构");
	str = str.replace("评选赛商店", "评选赛");
	return str;
}

function initOnekey(){
	$("#onekey").click(function() {
		showStrategy();
	});
}