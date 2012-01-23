function Timeline(caller){
	this.parent = caller;
	this.ONE_DAY_MS = 1000*60*60*24;
	this.OFFSET_DV2DATE = 2*60*60; //2h em segundos
	this.today = new Date();
	this.timelineStr = this.parent.sites[this.parent.sId].timeline;
}

Timeline.prototype.init = function(){
	this.timelineStr ? this.labelsToDates() : this.autoLabel();
}

Timeline.prototype.autoLabel = function(){
	//monta a timeline baseado nas atividades carregadas
	console.log('autoLabel!');
	
	for(var a in this.parent.atividades){
		var datas = this.defineRange(a);		
	}

	
	// var aI = datas.menor.getFullYear();
	// var aF = datas.maior.getFullYear();
	// var dA = aF - aI;
	// var mI = datas.menor.getMonth();
	// var mF = datas.maior.getMonth();
	// 
	// if(dA > 0){
	// 	//tem mais de um ano entre as datas
	// 	var nM = (dA*12) - mI + mF;
	// } else {
	// 	//está tudo dentro do mesmo ano
	// 	var nM = mF - mI;
	// }
	// 
	// // console.log(nM);
	// var mesCurto = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
	// timeline = [];
	// 
	// for(var i=0; i<=nM+1; i++){
	// 	var currentMonth = (mI + i)%12;
	// 	var currentYear = aI + Math.floor( (mI+i)/12 );
	// 	// var mostraAno = (i==0 || currentMonth == 0) ? " " + currentYear : "";
	// 	var mostraAno = " " + currentYear;
	// 	var timelineItem = {}
	// 	timelineItem.date = new Date(currentYear,currentMonth,1);
	// 	timelineItem.htmlLabel = mesCurto[currentMonth] + mostraAno;
	// 	timeline.push(timelineItem);
	// }
	// // console.log("Mostrando eventos entre [" + datas.menor.toString() + "] e [" + datas.maior.toString() + "]")
	
}

Timeline.prototype.defineRange = function(id){
	var datas = {};
	
	var a = this.parent.atividades[id];
	if(!a.filhos){
		//se não tem pai, assume que as datas estão corretasa
		datas.menor = this.parent.atividades[id].datainicial;
		datas.maior = this.parent.atividades[id].datafinal;
	} else {
		//confere entre todos os filhos, a maior e a menor data
		//define extremos (absurdos) iniciais
		datas.menor = 1.7976931348623157E+10308; //infinito
		datas.maior = 0;
		for(var f in a.filhos){
			//guarda os recordistas
			(f.datainicial.getTime() < datas.menor) ? datas.filhoMenor = f : null;
			(f.datafinal.getTime() > datas.maior) ? datas.filhoMaior = f : null;
			//atualiza a maior e a menor
			datas.menor = Math.min(f.datainicial.getTime(), datas.menor);
			datas.maior = Math.max(f.datafinal.getTime(), datas.maior);	
		}
		//converte os epochs em datas
		datas.menor = new Date(datas.menor);
		datas.maior = new Date(datas.maior);
	}
	
	return datas;
}

Timeline.dvToDate = function(dv){
	return new Date((this.OFFSET_DV2DATE + parseInt(dv))*1000);
}

Timeline.prototype.dateToDv = function(date){
	return Math.round(date.getTime()/1000 - this.OFFSET_DV2DATE);
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
}