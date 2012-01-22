function Timeline(caller){
	this.parent = caller;
	this.ONE_DAY_MS = 1000*60*60*24;
	this.today = new Date();
	this.timelineStr = this.parent.sites[this.parent.sId].timeline;
	this.timelineStr ? this.labelsToDates() : this.autoLabel();
}

Timeline.prototype.autoLabel = function(date){
	//monta a timeline baseado nas atividades carregadas
	console.log('autoLabel!');
	
	//avisa que terminou
	try { this.parent.onTimelineReady() } catch(err) { console.log(err) };
}

Timeline.prototype.zeraRelogio = function(date){
	date.setHours(0);
	date.setMinutes(0);
	date.setSeconds(0);
}

Timeline.prototype.labelsToDates = function(){
	var year		= this.today.getFullYear();
	var month		= this.today.getMonth();
	var weekday = this.today.getDay();

	this.timeMarks = this.timelineStr.split(' | ');
	for(var i in this.timeMarks){
		var split = this.timeMarks[i].split('=');
		this.timeMarks[i] = {};
		this.timeMarks[i].label = split[0];
		this.timeMarks[i].date = split[1] ? split[1] : null;
	}

	this.first = this.timeMarks[0];
	this.last = this.timeMarks[this.timeMarks.length - 1];

	for(var i in this.timeMarks){
		switch (this.timeMarks[i].label){
			case "mês passado":
				// se for janeiro, mês passado é dezembro!
				if(month == 0){ month = 11; year -- } else { month -- }
				this.timeMarks[i].date = new Date (year, month, 1, 0, 0, 0);
				break;
			case "último finde":
				if(weekday > 0 && weekday < 6){
					//se não está no final de semana
					this.timeMarks[i].date = new Date (this.today.getTime() - (this.ONE_DAY_MS*(weekday+1)));
				} else if (weekday == 0){
					//se é domingo
					this.timeMarks[i].date = new Date (this.today.getTime() - (this.ONE_DAY_MS*8));
				} else if(weekday == 6){
					//se é sábado
					this.timeMarks[i].date = new Date (this.today.getTime() - (this.ONE_DAY_MS*7));
				}
				this.zeraRelogio(this.timeMarks[i].date);
				break;
			case "ontem":
				this.timeMarks[i].date = new Date (this.today.getTime() - this.ONE_DAY_MS);
				this.zeraRelogio(this.timeMarks[i].date);
				break;
			case "hoje":
				this.timeMarks[i].date = new Date (this.today.getTime());
				this.zeraRelogio(this.timeMarks[i].date);
				break;
			case "amanhã":
				this.timeMarks[i].date = new Date (this.today.getTime() + this.ONE_DAY_MS);
				this.zeraRelogio(this.timeMarks[i].date);
				break;
			case "próximo finde":
				if(weekday == 6){
					this.timeMarks[i].date = new Date (this.today.getTime() + (this.ONE_DAY_MS*7));
				} else {
					this.timeMarks[i].date = new Date (this.today.getTime() + (this.ONE_DAY_MS*(6-weekday)));
				}
				this.zeraRelogio(this.timeMarks[i].date);
				break;
			case "mês que vem":
				// se for dezembro, mês que vem é dezembro!
				if(month == 11){ month = 0; year ++ } else { month ++ }
				this.timeMarks[i].date = new Date (year, month, 1, 0, 0, 0);
				break;
			default:
				//parte do princípio que a string refere-se a uma data (corretamente formatada) : "January 6, 1972 16:05:00"
				this.timeMarks[i].date = new Date (this.timeMarks[i].date);
				break;
		}
	}
	
	//avisa que terminou
	try { this.parent.onTimelineReady() } catch(err) { console.log(err) };
}