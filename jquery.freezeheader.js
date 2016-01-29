
function menuFixed(id) {
	$("#fixed-header").remove();
	var obj = document.getElementById(id);
	cloneHeaderRow($(obj));
	var header = $(obj).find(".table-head")[0];
	var _getHeight = header.offsetTop;

	window.onscroll = function () {
		changePos(_getHeight);
	}
}
function cloneHeaderRow(obj) {
	var header = $(obj.find('.table-head')[0]);
	var hdtablea = $('<div>');
	var tabela = $('<div class="table" style="margin: 0 0;"></div>');
	var atributos = obj.prop("attributes");

	$.each(atributos, function () {
		if (this.name != "id") {
			tabela.attr(this.name, this.value);
		}
	});

	tabela.append('<div class="table-head">' + header.html() + '</div>');

	hdtablea.append(tabela);
	hdtablea.width(header.width());
	hdtablea.height(header.height);
	
	for(var i  = 0; i<tabela.find(".table-td").length ;i++){
		$(tabela.find(".table-td")[i]).width($(header.find(".table-td")[i]).width() + 1 * $(header.find(".table-td")[i]).css("padding-left").replace("px","") + 1 * $(header.find(".table-td")[i]).css("padding-right").replace("px","")).css("display","inline-block");
	}
	
	hdtablea.css("visibility", "hidden");
	hdtablea.css("top", "0px");
	hdtablea.css("position", "fixed");
	hdtablea.css("z-index", "1000");
	hdtablea.attr("id", "fixed-header");
	obj.before(hdtablea);
	$(".gogogo-top").click(function () {
		goTop();
	});
}
function ReDrawcloneHeaderRow(){
	var obj = document.getElementById("clothes");
	var header = $($(obj).find(".table-head")[0]);
	for(var i  = 0; i < $("#fixed-header").find(".table-td").length ;i++){		
		$($("#fixed-header").find(".table-td")[i]).width($(header.find(".table-td")[i]).width()).css("display","inline-block");
	}
	$(".gogogo-top").click(function () {
		goTop();
	});
	var _getHeight = header.offset().top;

	window.onscroll = function () {
		changePos(_getHeight);
	}
}

function changePos(height) {
	var obj = document.getElementById("fixed-header");
	var end = document.getElementById("end");
	var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
	if (scrollTop < height || end.offsetTop < scrollTop) {
		obj.style.visibility = 'hidden';
	} else {
		obj.style.visibility = 'visible';
	}
}

(function ($) {
    var TABLE_ID = 0;
    $.fn.freezeHeader = function (params) {

        var copiedHeader = false;

        function freezeHeader(elem) {
            var idObj = elem.attr('id') || ('tbl-' + (++TABLE_ID));
            if (elem.length > 0) {

                var obj = {
                    id: idObj,
                    grid: elem,
                    container: null,
                    header: null,
                    divScroll: null,
                    openDivScroll: null,
                    closeDivScroll: null,
                    scroller: null
                };

                if (params && params.height !== undefined) {
                    obj.divScroll = '<div id="hdScroll' + obj.id + '" style="height: ' + params.height + '; overflow-y: scroll">';
                    obj.closeDivScroll = '</div>';
                }

                obj.header = obj.grid.find('.table-head');

                if (params && params.height !== undefined) {
                    if ($('#hdScroll' + obj.id).length == 0) {
                        obj.grid.wrapAll(obj.divScroll);
                    }
                }

                obj.scroller = params && params.height !== undefined
				   ? $('#hdScroll' + obj.id)
				   : $(window);

                obj.scroller.on('scroll', function () {

                    if ($('#hd' + obj.id).length == 0) {
                        obj.grid.before('<div id="hd' + obj.id + '"></div>');
                    }

                    obj.container = $('#hd' + obj.id);

                    if (obj.header.offset() != null) {
                        if (limiteAlcancado(obj, params)) {
                            if (!copiedHeader) {
                                cloneHeaderRow(obj);
                                copiedHeader = true;
                            }
                        }
                        else {

                            if (($(document).scrollTop() > obj.header.offset().top)) {
                                obj.container.css("position", "absolute");
                                obj.container.css("top", (obj.grid.find(".table-row:last").offset().top - obj.header.height()) + "px");
                            }
                            else {
                                obj.container.css("visibility", "hidden");
                                obj.container.css("top", "0px");
                                obj.container.width(0);
                            }
                            copiedHeader = false;
                        }
                    }

                });
            }
        }

        function limiteAlcancado(obj, params) {
            if (params && params.height !== undefined) {
                return (obj.header.offset().top <= obj.scroller.offset().top);
            }
            else {
                return ($(document).scrollTop() > obj.header.offset().top && $(document).scrollTop() < (obj.grid.height() - obj.header.height() - obj.grid.find(".table-row:last").height()) + obj.header.offset().top);
            }
        }

        function cloneHeaderRow(obj) {
            obj.container.html('');
            obj.container.val('');
            var tabela = $('<div class="table" style="margin: 0 0;"></div>');
            var atributos = obj.grid.prop("attributes");

            $.each(atributos, function () {
                if (this.name != "id") {
                    tabela.attr(this.name, this.value);
                }
            });

            tabela.append('<div class="table-head">' + obj.header.html() + '</div>');

            obj.container.append(tabela);
            obj.container.width(obj.header.width());
            obj.container.height(obj.header.height);
			
			
            obj.container.css("visibility", "visible");

            if (params && params.height !== undefined) {
                obj.container.css("top", obj.scroller.offset().top + "px");
                obj.container.css("position", "absolute");
            } else {
                obj.container.css("top", "0px");
                obj.container.css("position", "fixed");
            }
			obj.container.css("z-index", "1000");
        }

        return this.each(function (i, e) {
            freezeHeader($(e));
        });

    };
})(jQuery);
