function chooseAccessories() {
	refreshShoppingCartBiguse();
}


function switchCate(c) {
	currentCategory = c;
	$("ul#categoryTab li").removeClass("active");
	$("#category_container div").removeClass("active");
	$("#" + c).addClass("active");
	$("#category-" + c).addClass("active");
	onChangeUiFilter();
	changeFrontFilterDiv(c);
	return false;
}

function changeFrontFilterDiv(c){
	$("#front_filter_div").empty();
	for(var co in color){
		if(co.indexOf(c) >=0){
			var $btn = $("<button>").addClass("btn btn-xs btn-default front_filter_option_biguse").attr("type", "button").text(color[co][1]);
			$("#front_filter_div").append($btn);
		}
	}
	
	//前台筛选
	$(".front_filter_option_biguse").click(function(){
		filterClotherHTMLBiguse(this);
		 return false;
	});
}
	
	
function filterClotherHTMLBiguse(btn){
	var clothesDivList = $("#clothes .table-body .table-row");
	var str = $(btn).text();
	 for(var i = 0 ; i < clothesDivList.length; i++){
		 if($(clothesDivList[i]).find(".color_search:first").text().indexOf(str) < 0){
			$(clothesDivList[i]).hide();
		 }
		 else{
			 $(clothesDivList[i]).show();
		 }
	 }
}