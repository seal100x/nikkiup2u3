var timeIndex = initTime();
function initTime(){
	var d = new Date();
	time_zone = -d.getTimezoneOffset()/60;
    offset = 8 - time_zone;

	var date = new Date();
	var d;
	if((date.getDay() > 2 || date.getDay() == 2 && date.getHours() > 5) 
		&& (date.getDay() < 6 || date.getDay() == 6 && date.getHours() < 5)){
		d = 6 - date.getDay();
	}
	else{
		if(date.getDay() > 5)
			d = 9 - date.getDay();
		else
			d = 2 - date.getDay();
	}
	var h = d * 24 - date.getHours() - 1 + 5 - offset;
	var m = 60 - date.getMinutes() - 1;
	var s = 60 - date.getSeconds();
	
	return h * 3600 + m * 60 + s;	
};
setTime();
setInterval(setTime, 1000); 
function setTime() {
	var hour = parseInt(timeIndex / 3600);
	var minutes = parseInt((timeIndex % 3600) / 60); 
	var seconds = parseInt(timeIndex % 60);
	hour = hour < 10 ? "0" + hour : hour;
	minutes = minutes < 10 ? "0" + minutes : minutes;
	seconds = seconds < 10 ? "0" + seconds : seconds;
	if(hour < 36)
		$("#showTime").html("<red>" + hour + ":" + minutes + ":" + seconds + "</red>");
	else
		$("#showTime").html(hour + ":" + minutes + ":" + seconds);
	timeIndex--;
}
