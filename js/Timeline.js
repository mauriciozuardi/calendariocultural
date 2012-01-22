function Timeline(timelineStr){
	this.firstMoment = Date.now();
	this.timelineStr = timelineStr;
	this.timelineStr ? this.labelsToDates() : console.log('ERROR: no timeline defined.');
}

Timeline.prototype.labelsToDates = function(){
	var d = new Date();
	var year		= d.getFullYear();
	var month		= d.getMonth();
	var weekday = d.getDay();	
	var oneDayInMs = 1000*60*60*24;
	
	this.timeMarks = this.timelineStr.split(' | ');
	for(var i in this.timeMarks){
		var split = this.timeMarks[i].split('=');
		this.timeMarks[i] = {};
		this.timeMarks[i].label = split[0];
		this.timeMarks[i].date = split[1] ? split[1] : undefined;
	}
	
	this.first = this.timeMarks[0];
	this.last = this.timeMarks[this.timeMarks.length - 1];
	
	for(var i in this.timeMarks){
		switch (this.timeMarks[i].label){
			case "mês passado":
				// se for janeiro, mês passado é dezembro!
				if(month == 0){ month = 11; year -- } else { month -- }
				//armazena data
				this.timeMarks[i].date = new Date (year, month, 1, 0, 0, 0);
				break;
			case "último finde":
				//calcula a quantidade de dias até o próximo final de semana e define a data
				if(weekday > 0 && weekday < 6){
					//se não está no final de semana
					this.timeMarks[i].date = new Date (this.firstMoment - (oneDayInMs*(weekday+1)));
				} else if (weekday == 0){
					//se é domingo
					this.timeMarks[i].date = new Date (this.firstMoment - (oneDayInMs*8));
				} else if(weekday == 6){
					//se é sábado
					this.timeMarks[i].date = new Date (this.firstMoment - (oneDayInMs*7));
				}
				//zera o relógio
				this.timeMarks[i].date.setHours(0);
				this.timeMarks[i].date.setMinutes(0);
				this.timeMarks[i].date.setSeconds(0);
				break;
			case "ontem":
				this.timeMarks[i].date = new Date (this.firstMoment - oneDayInMs);
				//zera o relógio
				this.timeMarks[i].date.setHours(0);
				this.timeMarks[i].date.setMinutes(0);
				this.timeMarks[i].date.setSeconds(0);
				break;
			case "hoje":
				this.timeMarks[i].date = new Date (this.firstMoment);
				//zera o relógio
				this.timeMarks[i].date.setHours(0);
				this.timeMarks[i].date.setMinutes(0);
				this.timeMarks[i].date.setSeconds(0);
				break;
			case "amanhã":
				this.timeMarks[i].date = new Date (this.firstMoment + oneDayInMs);
				//zera o relógio
				this.timeMarks[i].date.setHours(0);
				this.timeMarks[i].date.setMinutes(0);
				this.timeMarks[i].date.setSeconds(0);
				break;
			case "próximo finde":
				//calcula a quantidade de dias até o próximo final de semana e define a data
				if(weekday == 6){
					this.timeMarks[i].date = new Date (this.firstMoment + (oneDayInMs*7));
				} else {
					this.timeMarks[i].date = new Date (this.firstMoment + (oneDayInMs*(6-weekday)));
				}
				//zera o relógio
				this.timeMarks[i].date.setHours(0);
				this.timeMarks[i].date.setMinutes(0);
				this.timeMarks[i].date.setSeconds(0);
				break;
			case "mês que vem":
				// se for dezembro, mês que vem é dezembro!
				if(month == 11){
					month = 0;
					year ++;
				} else {
					month ++;
				}
				//armazena
				this.timeMarks[i].date = new Date (year, month+1, 1, 0, 0, 0);
				break;
			default:
				//parte do princípio que a string refere-se a uma data (corretamente formatada) : "January 6, 1972 16:05:00"
				this.timeMarks[i].date = new Date (this.timeMarks[i].dateStr);
				break;
		}
	}
}