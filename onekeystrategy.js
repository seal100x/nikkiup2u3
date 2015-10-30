
function showStrategy(){
	var $strategy = $("<div/>").addClass("strategy_info_div");
		
	var theme = allThemes[$("#theme").val()];
	var filters = clone(criteria);
	filters.own = true;
	filters.missing = true;
	
	var $title_eng = p("zhe li you yi duan hao li hai de english", "title_eng");
	$strategy.append($title_eng);
	
	var $title = p($("#theme").val(),"title");
	$strategy.append($title);
	
	var $author = p("作者: ......... & 黑的升华", "author");
	$strategy.append($author);
	
	var $skill_title = p("技能: ", "skill_title");
	$strategy.append($skill_title);
	
	if($("#skillInfo").text()){
		var $skill_ops = p($("#skillInfo").text().replace("公主", "        公主"), "skill_ops");
		$strategy.append($skill_ops);
	}
	else if($("#theme").val().indexOf("评选赛") < 0) {
		var $skill_ops = p("对手技能: ", "skill_ops");
		$strategy.append($skill_ops);		
	}
	
	var $skill_my = p("推荐携带: ", "skill_my");
	if($("#theme").val().indexOf("评选赛") >= 0){
		$skill_my = p("推荐携带: 微笑 飞吻 挑剔 沉睡", "skill_my");
	}
	$strategy.append($skill_my);
	
	var $criteria_title = p("属性-" + (uiFilter["balance"]?"均衡权重":"真实权重") + ": ", "criteria_title");
	$strategy.append($criteria_title);
	
	var $criteria = p(getStrCriteria(theme),"criteria");
	$strategy.append($criteria);
	
	var $tag = p(getstrTag(theme), "tag");
	$strategy.append($tag);
	
	if($("#hintInfo").text()){
		var $hint = p($("#hintInfo").text().replace("过关提示:",""), "hint", "过关提示: ", "hint_tiele");
		$strategy.append($hint);
	}
	else if($("#theme").val().indexOf("评选赛") < 0 && $("#theme").val().indexOf("联盟委托") < 0){
		var $hint = p("...............", "hint", "过关提示: ", "hint_tiele");
		$strategy.append($hint);
	}
	
	var accCount = 9;
	if(theme.bonus[0] && theme.bonus[0].base
		&& (theme.bonus[0].base == "S" || theme.bonus[0].base == "SS" || theme.bonus[0].base == "A")){
		accCount = 8;
	}
	
	var $clotheslist_title = p("推荐搭配: (推荐佩戴"+accCount+"件饰品)", "clotheslist_title");
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
			} else if (clothes[i].tmpScore > result[clothes[i].type.type][0].tmpScore) {//dead code
			//	result[clothes[i].type.type][3] = result[clothes[i].type.type][2];
				result[clothes[i].type.type][2] = result[clothes[i].type.type][1];
				result[clothes[i].type.type][1] = result[clothes[i].type.type][0];
				result[clothes[i].type.type][0] = clothes[i];
			} else if (!result[clothes[i].type.type][1] || clothes[i].tmpScore > result[clothes[i].type.type][1].tmpScore) {
			//	result[clothes[i].type.type][3] = result[clothes[i].type.type][2];
				result[clothes[i].type.type][2] = result[clothes[i].type.type][1];
				result[clothes[i].type.type][1] = clothes[i];				
			} else if (!result[clothes[i].type.type][2] || clothes[i].tmpScore > result[clothes[i].type.type][2].tmpScore) {
			//	result[clothes[i].type.type][3] = result[clothes[i].type.type][2];
				result[clothes[i].type.type][2] = clothes[i];				
			//} else if (!result[clothes[i].type.type][3] || clothes[i].tmpScore > result[clothes[i].type.type][3].tmpScore) {
			//	result[clothes[i].type.type][3] = clothes[i];				
			}
		}
	}
	for (var r in result){
		$strategy.append(p(getstrClothes(result[r]), "clothes", r, "clothes_category"));
	}

	$author_sign = $("<div/>").addClass("stgy_author_sign_div");
	$author_sign.append(p("这里有一个好厉害的作者签名！", "author_sign"));
	$author_sign.append($("<img/>").attr("src","sign.gif"));
	$author_sign.append(p("black sublimation", "author_sign_name"));	
	var d = new Date();
	$author_sign.append(p("奇迹暖暖一键攻略@黑的升华" + (1900+d.getYear()) + "-" + (d.getMonth() + 1) + "-" + d.getDate(), "author_sign"));
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

function getStrCriteria(theme){
	var strCriteria = "";
	theme.weight["simple"] >= 0 ? strCriteria += "简约" : strCriteria += "华丽";
	strCriteria += " : ";
	theme.weight["cute"] >= 0 ? strCriteria += "可爱" : strCriteria += "成熟";
	strCriteria += " : ";
	theme.weight["active"] >= 0 ? strCriteria += "活泼" : strCriteria += "优雅";
	strCriteria += " : ";
	theme.weight["pure"] >= 0 ? strCriteria += "清纯" : strCriteria += "性感";
	strCriteria += " : ";
	theme.weight["cool"] >= 0 ? strCriteria += "清凉" : strCriteria += "保暖";
	strCriteria += " ≈ ";
	
	if(uiFilter["balance"]){
		strCriteria += "1 : 1 : 1 : 1 : 1";
	}
	else{
		theme.weight["simple"] >= 0 ? strCriteria += theme.weight["simple"] : strCriteria += -theme.weight["simple"];
		strCriteria += " : ";
		theme.weight["cute"] >= 0 ? strCriteria += theme.weight["cute"] : strCriteria += -theme.weight["cute"];
		strCriteria += " : ";
		theme.weight["active"] >= 0 ? strCriteria += theme.weight["active"] : strCriteria += -theme.weight["active"];
		strCriteria += " : ";
		theme.weight["pure"] >= 0 ? strCriteria += theme.weight["pure"] : strCriteria += -theme.weight["pure"];
		strCriteria += " : ";
		theme.weight["cool"] >= 0 ? strCriteria += theme.weight["cool"] : strCriteria += -theme.weight["cool"];
	}
	return strCriteria;
}

function getstrTag(theme){
	var str = "";
	if(theme.bonus[0] && theme.bonus[0].tag){
		str+="有TAG[" + theme.bonus[0].tag + "], 加分约" + theme.bonus[0].base + " X " + theme.bonus[0].weight + "。";
		if(theme.bonus[1] && theme.bonus[1].tag){
			str+="有TAG[" + theme.bonus[1].tag + "], 加分约" + theme.bonus[1].base + " X " + theme.bonus[1].weight;
		}
	}
	return str;
}

function getstrClothes(result){
	 var str = " : " + result[0].name + "[" + removeNum(result[0].source) + "]" + "(" + result[0].tmpScore + ")";
	 if(result[1])
		str += " > " + result[1].name + "[" + removeNum(result[1].source) + "]" + "(" + result[1].tmpScore + ")";
	 if(result[2])
		str += " > " + result[2].name + "[" + removeNum(result[2].source) + "]" + "(" + result[2].tmpScore + ")";
	 if(result[3])
		str += " > " + result[3].name + "[" + removeNum(result[3].source) + "]" + "(" + result[3].tmpScore + ")";
	 return str;
}

function removeNum(str){
	if(str.indexOf("定")>=0 || str.indexOf("进")>=0)
		return str.replace(/[0-9]/g,"");
	else
		return str;
}

function initOnekey(){
	$("#onekey").click(function() {
		showStrategy();
	});
}