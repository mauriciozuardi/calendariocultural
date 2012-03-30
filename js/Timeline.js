function Timeline(caller){
	this.parent = caller;
	this.ONE_DAY_MS = 1000*60*60*24;
	this.OFFSET_DV2DATE = 2*60*60; //2h em segundos
	this.today = new Date();
	this.timelineStr = this.parent.sites[this.parent.sId].timeline;
}

Timeline.prototype.init = function(){
	// this.parent.query ? this.autoLabel() : this.labelsToDates();
	this.parent.query ? this.autoLabel() : this.parent.when ? this.whenLabel() : this.labelsToDates();
}

Timeline.prototype.whenLabel = function(){
	this.timeMarks = [];
	var epochs = this.parent.when.split(',');
	for(var i in epochs){
		var e = epochs[i];
		var date = new Date(parseInt(e));
		var mesLongo = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
		
		var timelineItem = {}
		timelineItem.label = (i == epochs.length - 1) ? ' ' : mesLongo[date.getMonth()] + ' ' + date.getFullYear();
		timelineItem.date = date;
		this.timeMarks.push(timelineItem);
	}
}

Timeline.prototype.autoLabel = function(){
	// console.log('autoLabel');
	//monta a timeline baseado nas atividades carregadas
	var datas = this.defineActivitiesRange();
	// console.log(['datas', datas]);
	
	var aI = datas.filhoMenor.datainicial.getFullYear();
	var aF = datas.filhoMaior.datafinal.getFullYear();
	var nA = aF - aI;
	var mI = datas.filhoMenor.datainicial.getMonth();
	var mF = datas.filhoMaior.datafinal.getMonth();
	var tI = datas.filhoMenor.datainicial.getTime();
	var tF = datas.filhoMaior.datafinal.getTime();
	var nT = tF - tI;
	var hI = datas.filhoMenor.datainicial.getHours();
	var hF = datas.filhoMaior.datafinal.getHours();
	var nH = hF - hI;
	var minI = datas.filhoMenor.datainicial.getMinutes();
	var minF = datas.filhoMaior.datafinal.getMinutes();
	
	if(nA > 0){
		//tem mais de um ano entre as datas
		var nM = (nA*12) - mI + mF;
	} else {
		//está tudo dentro do mesmo ano
		var nM = mF - mI;
		if(nM == 0){
			var dI = datas.filhoMenor.datainicial.getDate();
			var dF = datas.filhoMaior.datafinal.getDate();
			var nD = dF - dI;
		}
	}
	
	var mesCurto = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
	this.timeMarks = [];

	// console.log(nH);
	if(nD == 0 && nH > 1){
		// se tudo rola no mesmo dia, em horas diferentes
		for(var i=0; i<=nH+1; i++){
			var currentHour = hI + i;
			var timelineItem = {}
			timelineItem.date = new Date(tI + 1000*60*60*i);
			timelineItem.label = dI + " " + mesCurto[mI] + " " + aI + " às " + currentHour + ":00h";
			this.timeMarks.push(timelineItem);
			console.log(timelineItem.label);
		}
	} else if(nM == 0 && nD > 0 && nD <= 7){
		//se tudo rola na mesma semana
		for(var i=0; i<=nD+1; i++){
			var currentDay = dI + i;
			var timelineItem = {}
			timelineItem.date = new Date(aI,mI,currentDay);
			timelineItem.label = currentDay + " " + mesCurto[mI] + " " + aI;
			this.timeMarks.push(timelineItem);
			console.log(timelineItem.label);
		}
	} else {
		
		//se prepara para desenhar a timeline mostrando só os 12 primeiros meses, priorizando o futuro mas mostrando o máximo possível
		
		if(nM > 12){
			//confere quantos eventos passados deve pular para caber o máximo de eventos futuros
			
			//como saber se a data final é maior que hoje (ou seja, a atividade está acontecendo ainda)
			var dataMaiorOuIgualHoje = function(dataTestada){
				var today = new Date();
				return dataTestada.getTime() >= today.getTime() - ((today.getHours()-1) * 1000*60*60) - ((today.getMinutes()-1) * 1000*60) - ((today.getSeconds()) * 1000);
			}
			var dataAMaiorOuIgualB = function(dataA, dataB){
				return dataA.getTime() >= dataB.getTime() - ((dataB.getHours()-1) * 1000*60*60) - ((dataB.getMinutes()-1) * 1000*60) - ((dataB.getSeconds()) * 1000);
			}
			
			//ordena o array por data final
			datas.todas.sort(Timeline.ordemDataFinalAscendente);
			
			// //procura a primeira data ainda está rolando
			// for(var i in datas.todas){
			// 	var d = datas.todas[i];
			// 	if(dataMaiorOuIgualHoje(d.datafinal)){
			// 		console.log(d.datafinal);
			// 		//anota qual é a primeira data que deve, obrigatoriamente aparecer
			// 		primeira = d;
			// 		primeiraIndex = i;
			// 		break;
			// 	}
			// }
			
			//varre todas as datas de atividades que ainda estão rolando, procurando a que começa mais no passado
			var dataRolandoComInicioMaisAntigo = {}
			var epochDRCIMA = Infinity;
			for(var i in datas.todas){
				var d = datas.todas[i];
				if(dataMaiorOuIgualHoje(d.datafinal)){
					if(epochDRCIMA > d.datainicial.getTime()){
						dataRolandoComInicioMaisAntigo = d;
						epochDRCIMA = d.datainicial.getTime();
					}
				}
			}
						
			console.log(['dataRolandoComInicioMaisAntigo', dataRolandoComInicioMaisAntigo]);
			
			//anota data da atividade mais remota no futuro
			var ultima = datas.todas[datas.todas.length-1];
			console.log(['ultima', ultima]);
			
			//confere quantos meses tem entre a primeira e a última
			var aInicial = dataRolandoComInicioMaisAntigo.datainicial.getFullYear();
			var aFinal = ultima.datafinal.getFullYear();
			var mInicial = dataRolandoComInicioMaisAntigo.datainicial.getMonth();
			var mFinal = ultima.datafinal.getMonth();
			if(mFinal == 11){
				mFinal = 0;
				aFinal ++;
			} else {
				mFinal ++;
			}
			
			var nAnos = aFinal - aInicial;
			if(nAnos > 0){
				//tem mais de um ano entre as datas
				var nMeses = (nAnos*12) - mInicial + mFinal;
			} else {
				//está tudo dentro do mesmo ano
				var nMeses = mFinal - mInicial;
			}
			
			// console.log(['nMeses', nMeses]);
			
			// se tiver menos que 12 meses, inclui alguns do passado até interar
			if(nMeses < 12){
				// console.log(-12+nMeses);
				mInicial -= 12-nMeses;
				// console.log(mInicial);
				if(mInicial > -1){
					mInicial += 12;
					aInicial --;
				}
			}
			var primeiraTimeMarkDate = new Date(aInicial,mInicial,1);
			
			//apaga as atividades que estão fora do novo range de datas
			var primeiraTimeMarkDate = new Date(aInicial,mInicial,1);
			for(var s in this.parent.atividades){
				for(var i in this.parent.atividades[s]){
					var a = this.parent.atividades[s][i];
					!dataAMaiorOuIgualB(a.datafinal, primeiraTimeMarkDate) ? delete this.parent.atividades[s][i] : null;
				}
			}
		}
		
		if(nM <= 12){
			for(var i=0; i<=Math.min(12,nM+1); i++){
				//se o intervalo de meses cabe confortavelmente na tela média, mostra
				var currentMonth = (mI + i)%12;
				var currentYear = aI + Math.floor( (mI+i)/12 );
				var timelineItem = {}
				timelineItem.label = mesCurto[currentMonth] + " " + currentYear;
				timelineItem.date = new Date(currentYear,currentMonth,1);
				this.timeMarks.push(timelineItem);
			}
		} else {
			for(var i=0; i<=12; i++){
				//senão corta o passado e/ou o futuro longínquo até caber em 12
				var currentMonth = (mInicial + i)%12;
				var currentYear = aInicial + Math.floor( (mInicial+i)/12 );
				var timelineItem = {}
				timelineItem.label = mesCurto[currentMonth] + " " + currentYear;
				timelineItem.date = new Date(currentYear,currentMonth,1);
				this.timeMarks.push(timelineItem);
			}
		}
	}
}

Timeline.ordemDataFinalAscendente = function(a,b){
	return a.datafinal - b.datafinal;
}

Timeline.prototype.defineActivitiesRange = function(){
	var datas = {};
	datas.menor = 1.7976931348623157E+10308; //infinito
	datas.maior = 0;
	datas.todas = [];

	for(var s in this.parent.atividades){
		for(var i in this.parent.atividades[s]){
			var a = this.parent.atividades[s][i];
			//guarda qualquer uma
			var d = {}
			d.datainicial = new Date(a.datainicial.getTime());
			d.datafinal = new Date(a.datafinal.getTime());
			datas.todas.push(d);
			//guarda os recordistas
			(a.datainicial.getTime() < datas.menor) ? datas.filhoMenor = a : null;
			(a.datafinal.getTime() > datas.maior) ? datas.filhoMaior = a : null;
			//atualiza a maior e a menor
			datas.menor = Math.min(a.datainicial.getTime(), datas.menor);
			datas.maior = Math.max(a.datafinal.getTime(), datas.maior);
		}
	}
	
	return datas;
}

Timeline.defineParentRange = function(parent){
	var datas = {};
	datas.menor = 1.7976931348623157E+10308; //infinito
	datas.maior = 0;
	
	// console.log(parent);
	for(var i in parent.dependentes){
		var dependente = parent.dependentes[i];
		//guarda os recordistas
		(dependente.datainicial.getTime() < datas.menor) ? datas.filhoMenor = dependente : null;
		(dependente.datafinal.getTime() > datas.maior) ? datas.filhoMaior = dependente : null;
		//atualiza a maior e a menor
		datas.menor = Math.min(dependente.datainicial.getTime(), datas.menor);
		datas.maior = Math.max(dependente.datafinal.getTime(), datas.maior);
	}

	// //DEBUG
	// a.filhoMenor = datas.filhoMenor;
	// a.filhoMaior = datas.filhoMaior;	
	
	//armazena as novas datas
	parent.datainicial = new Date(datas.menor);
	parent.datafinal   = new Date(datas.maior);
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
	// console.log('labelsToDates');
	if(this.timelineStr){
		var year		= this.today.getFullYear();
		var month		= this.today.getMonth();
		var weekday = this.today.getDay();

		this.timeMarks = this.timelineStr.split(' | ');
		// console.log(this.timelineStr);
		for(var i in this.timeMarks){
			var split = this.timeMarks[i].split('=');
			this.timeMarks[i] = {};
			this.timeMarks[i].label = split[0];
			this.timeMarks[i].date = split[1] ? split[1] : null;
			// console.log(this.timeMarks[i].date);
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
	} else {
		console.log('ERROR: no timelineStr defined.');
	}
}