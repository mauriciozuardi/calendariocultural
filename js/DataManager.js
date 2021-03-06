var DEBUG = false;

function DataManager(caller){
	//INCLUIR NO INDEX.PHP: <script type="text/javascript" charset="utf-8"> var v="<?php echo $_GET['v']; ?>"; console.log(v);</script>
	this.parent = caller;
	this.totalRequests = 0;
	this.loadedRequests = 0;
}

DataManager.prototype.wrapUrlVars = function(vars){
	for(var i in vars){
		var vName = vars[i];
		this[vName] = window[vName];
		delete window[vName];
	}
}

DataManager.prototype.init = function(){
	//index.php?m=MAIN_KEY_HERE;
	this.mainKey = this.mk ? this.mk : "0AnLIuvvW8l93dHlLUV9EU1B0TmhmaTVJdVphanh2dXc"; //2.0
	// this.mainKey = this.mk ? this.mk : "0AnLIuvvW8l93dFFyT3FtWFpuMnUwVFRnOFVVTlpTVGc"; //2.1
	delete this.mk;
	
	this.balloonInfo = this.bi ? this.bi.split('|') : '';
	delete this.bi;
	
	this.sId = (this.sId == '') ? 's1' : this.sId;
	this.aguardandoConferirDependencias = true;
	this.nSitesOrganizados = 0;
	this.loadBasicInfo();
	
	// console.log(window.location.host);
	// console.log(window.location.pathname);
}

DataManager.prototype.loadBasicInfo = function(mainKey){
	var urlSites   = 'https://spreadsheets.google.com/feeds/list/' + this.mainKey + '/6/public/basic?alt=json&sq=publicar==1';
	var urlEspacos = 'https://spreadsheets.google.com/feeds/list/' + this.mainKey + '/4/public/basic?alt=json&sq=publicar==1';
	var urlPessoas = 'https://spreadsheets.google.com/feeds/list/' + this.mainKey + '/5/public/basic?alt=json&sq=publicar==1';
	
	this.loadJsonToVar(urlSites, 'sites');
	this.loadJsonToVar(urlEspacos, 'espacos');
	this.loadJsonToVar(urlPessoas, 'pessoas');
}

DataManager.prototype.onJsonLoaded = function(loadedVarName, preSID){
	//acompanha e direciona o carregamento das informações
	this.loadedRequests ++;
	// preSID ? console.log('> loaded ' + loadedVarName + '-' + preSID) : console.log('> loaded ' + loadedVarName);
	
	switch(loadedVarName){
		case 'sites':
			this.currentSite = this.sites[this.sId];
			this.updateSiteCount();
			this.loadPulldownInfo();
			if(this.query){
				this.loadQueryActivities();
			} else {
				this.loadActivitiesByDate();
			}
			this.trataValoresSites();
			break;
		case 'pds':
			if(this.pds && this.espacos && this.pulldownsEsperados == this.pds.length){
				this.organizaPullDowns();
				delete this.pds;
				delete this.pulldownsEsperados;
			}
		break;
		case 'preAtividades':
			if(this.preAtividadesEsperadas == this.preAtividades.length){
				// this.aguardandoConferirDependencias = true;
				this.organizaPreAtividades();
			}
			break;
		// case 'atividades':
		// 		this.confereDependencias();
		// 	break;
		case 'repescagem_' + preSID :
			if(this['repescagensEsperadas_' + preSID] == this['repescagem_' + preSID].length){
				// console.log('chegaram todas as repescagens de ' + preSID);
				// var n = this['repescagensEsperadas_' + preSID];
				this.totalDeRepescagensCarregadas ? this.totalDeRepescagensCarregadas ++ : this.totalDeRepescagensCarregadas = 1;
				this.incluiDependencias(preSID);
			}
		break;
		case 'espacos':
			if(this.pds && this.espacos && this.pulldownsEsperados == this.pds.length){
				this.organizaPullDowns();
				// delete this.pds;
				// delete this.pulldownsEsperados;
			}
		break;
		case 'pessoas':
			this.checkDataComplete();
		break;
		default:
		break;
	}
}

DataManager.prototype.updateSiteCount = function(){
	this.nSites = 0;
	for(var i in this.sites){
		this.nSites ++;
	}
}

DataManager.prototype.organizaPreAtividades = function(){
	//DEBUG
	// var nPreAtividades = this.preAtividades ? this.preAtividades.length : '*';
	// console.log('organizaPreAtividades ('+nPreAtividades+'):');
	// for(var i in this.preAtividades){
	// 	var nObj = 0;
	// 	for(var j in this.preAtividades[i]){
	// 		nObj ++;
	// 	}
	// 	console.log(nObj);
	// }
	
	//
	this.atividades = {};
	for(var i in this.preAtividades){
		var obj = this.preAtividades[i];
		// var DEBUG_ATIVIDADES = [];
		for(var j in obj){
			var a = obj[j];
			var lastSite = a.idSiteOriginal;
			// console.log(j);
			// console.log(lastSite);
			// lastSite == undefined ? console.log(['lastSite undefined for: ' + a.id, a]) : null;
			this.atividades[a.idSiteOriginal] ? null : this.atividades[a.idSiteOriginal] = {};
			this.atividades[a.idSiteOriginal][a.id] = a;
			
			// DEBUG_ATIVIDADES.push(a.id);
		}
		// console.log(DEBUG_ATIVIDADES);
		// console.log('chamando confereDependencias ' + lastSite);
		this.confereDependencias(lastSite);
	}
	// console.log(['organizei', this]);
}

DataManager.prototype.incluiDependencias = function(s){
	if(this['repescagem_' + s]){
		for(var i in this['repescagem_' + s]){
			var arrIndex = this['repescagem_' + s][i];
			for(var j in arrIndex){
				var obj = arrIndex[j];
				this.atividades[s][j] ? null : this.atividades[s][j] = obj;
			}
		}
	}
	// delete this['repescagem_' + s];
	this.organizaAtividadesEmGrupos(s);
}

DataManager.prototype.confereDependencias = function(s){
	//DEBUG
	var nPreAtividades = this.preAtividades ? this.preAtividades.length : '?';
	// console.log(['conferindo dependencias ' + s + '. Pré-Atividades:', nPreAtividades]);
	
	if(s){
		this.totalDeRepescagensEsperadas ? null : this.totalDeRepescagensEsperadas = 0;
		this.sitesSemDependencias ? null : this.sitesSemDependencias = 0;
		this.sitesComDependencias ? null : this.sitesComDependencias = 0;
	
		//varre as atividades procurando se alguma tem parent
		this.pais ? null : this.pais = {};
		this.pais[s] ? console.log('OPA! Já existe ' + s) : this.pais[s] = [];
		// console.log('criei this.pais.' + s);
		for(var i in this.atividades[s]){
			var a = this.atividades[s][i];
			// // maneira antiga de determinar a paternidade
			// if(a.parent){
			// 	var repetido = false;
			// 	for(var p in this.pais[s]){
			// 		var pai = this.pais[s][p];
			// 		if(pai == a.parent){ repetido = true; break }
			// 	}
			// 	if(!repetido){ this.pais[s].push(a.parent) }
			// }
			
			//nova forma de checar se é pai - adotada para o caso de só o pai ser carregado
			a.havechildren ? this.pais[s].push(a.id) : null;
		}
		//se precisar, carrega de novo, buscando pelos pais agora
		if(this.pais[s].length > 0){
			this.sitesComDependencias ++;
			this['repescagem_' + s] ? null : this['repescagem_' + s] = [];
			this['repescagensEsperadas_' + s] ? null : this['repescagensEsperadas_' + s] = 0;
			this.totalDeRepescagensEsperadas ++;
			for(var i in this.pais[s]){
				var pai = this.pais[s][i];
				var url = 'https://spreadsheets.google.com/feeds/list/' + this.sites[s].key + '/2/public/basic?alt=json&q=' + pai + '&sq=publicar==1';
				this['repescagensEsperadas_' + s] ++;
				this.addJsonToArray(url, 'repescagem_' + s, s);
			}		
		} else {
			this.organizaAtividadesEmGrupos(s);
			this.sitesSemDependencias ++;
			if(this.sitesSemDependencias + this.sitesComDependencias == this.nSitesParaChecar && !this.totalDeRepescagensCarregadas){
				this.totalDeRepescagensCarregadas = 0;
			}
			// console.log(s + ': sem dependencias');
			//checa o carregamento geral
			this.confereDependenciasGeral() ? this.aguardandoConferirDependencias = false : null;
		}		
		
		// var checkGeral = this.confereDependenciasGeral();
		// if(checkGeral){
		// 	console.log('checkGeral OK!');
		// 	this.aguardandoConferirDependencias = false;
		// } else {
		// 	console.log('checkGeral falhou');
		// }
		this.checkDataComplete();
	} else {
		console.log('ERRO: confereDependencias(' + s + ') undefined');
	}
}

DataManager.prototype.trataValoresDasAtividades = function(s){
	//trata a data
	this.datasInvalidas ? null : this.datasInvalidas = {};
	var todasValidas = true;
	for(var i in this.atividades[s]){
		var a = this.atividades[s][i];
		//tenta transformar em data
		a.datainicial = new Date(a.datainicial);
		a.datafinal	 = new Date(a.datafinal);
		//confere se alguma é inválida
		var inv = 'Invalid Date';
		if(a.datainicial == inv || a.datafinal == inv){
			//marca na lista negra
			todasValidas = false;
			this.datasInvalidas[s + '-' + a.id] = a;
			//cria datas fake para não fuder o site
			a.datainicial = (a.parent && a.parent.datainicial != inv) ? a.datainicial = a.parent.datainicial : new Date();
			a.datafinal	 = (a.parent && a.parent.datafinal != inv) ? a.datafinal = a.parent.datafinal : new Date(Date.now() + 1);
		}
		
		//confere se data inicial é menor que final
		a.datainicial.getTime() > a.datafinal.getTime() ? alert('ERRO: ' + a.id + ' tem data inicial menor que final.') : null;
		
		//anota o contexto
		a.context = this.parent;
		
		//vê se já passou
		a.isPast = (a.datafinal.getTime() < Date.now() && this.currentSite.passadorelevante == '0') ? true : false;
		
		//preenche o visual default se não tiver nenhum
		a.visual ? null : a.visual = 'p';		
	}
	if(todasValidas){
		delete this.datasInvalidas;
	}
	//anota o contexto
	this.context = this.parent;
}

DataManager.prototype.trataValoresSites = function(){
	//varre os sites
	for(var i in this.sites){
		var s = this.sites[i];
		//trata footercontent, transformando uma string num objeto
		if(s.footercontent){
			var footercontent = {};
			var parts = s.footercontent.split('\n•••\n\n');
			for(var j in parts){
				var arr = parts[j].split('\n•\n');
				arr[0] != '' ? footercontent[arr[0]] = arr[1] : null;
			}
			this.sites[i].footercontent = footercontent;
		}
	}
}

DataManager.prototype.organizaAtividadesEmGrupos = function(s){
	// console.log('organizando ' + s);
	//parse dos valores
	this.trataValoresDasAtividades(s);
	
	//prepara para receber os dependentes
	for(var i in this.atividades[s]){
		this.atividades[s][i].nDependentes = 0;
		this.atividades[s][i].dependentes = {};
		// console.log(this.atividades[s][i].id);
	}
	//move os dependentes para a atividade principal;
	for(var i in this.atividades[s]){
		var a = this.atividades[s][i];
		// console.log(a.id);
		for(var j in this.pais[s]){
			var p = this.pais[s][j];
			// a.parent ? console.log(a.parent + ":" + p + " = " + a.id) : null;
			// console.log([p, this.atividades[s][p]]);
			if(a.parent == p && this.atividades[s][p] && this.atividades[s][i]){
				this.atividades[s][p].dependentes[a.id] = a;
				this.atividades[s][p].nDependentes ++;
				// console.log([p, this.atividades[s][p], this.atividades[s][i].id]);
				delete this.atividades[s][i];
				
				//remove o isPast se o pai não for past
				// this.atividades[s][p].isPast ? null : this.atividades[s][p].dependentes[a.id].isPast = false;
			}
		}
	}
	//exclui os dependentes se não tiver nenhum
	for(var i in this.atividades[s]){
		if(this.atividades[s][i].nDependentes == 0){
			delete this.atividades[s][i].dependentes;
		}
		// console.log(this.atividades[s][i].id);
	}
	
	//ajusta o range de todos os pais, baseado nos filhos
	for(var i in this.pais[s]){
		var a = this.atividades[s][this.pais[s][i]];
		// a ? null : console.log(['Atividade '+this.pais[s][i]+' inválida. Pais:', this.pais[s]]);
		Timeline.defineParentRange(a);
		//vê se já passou
		a.isPast = (a.datafinal.getTime() < Date.now() && this.currentSite.passadorelevante == '0') ? true : false;
	}
	
	
	//DEBUG
	var nPais = this.pais[s] ? this.pais[s].length : '*';
	// console.log(['ORGANIZEI ' + s.toUpperCase() + ' (' + nPais + '):', this.pais[s]])
	// for(var i in this.atividades[s]){
	// 	console.log(this.atividades[s][i].id);
	// }
	// console.log('---');

	// console.log('DEBUG START');
	// for(var i in this.atividades){
	// 	for(var j in this.atividades[i]){
	// 		console.log(i + j);
	// 	}
	// }
	// console.log('DEBUG END');
	
	this.nSitesOrganizados ++;
	
	//checa o carregamento geral
	this.confereDependenciasGeral() ? this.aguardandoConferirDependencias = false : null;
	this.checkDataComplete();
	// this.confereDependenciasGeral();
}

DataManager.prototype.confereDependenciasGeral = function(){
	// SE O TOTAL DE REPESCAGENS CHEGOU ..
	if(this.query){
		this.nSitesParaChecar = this.currentSite.ondebuscar ? this.currentSite.ondebuscar.split(', ').length : this.nSites;
		this.nSitesParaChecar -= this.nSitesParaDescontar ? this.nSitesParaDescontar : 0;		
	} else {
		this.nSitesParaChecar = 1;
	}
	// this.temDependencias = (this.sitesSemDependencias != this.nSitesParaChecar);
	this.temDependencias = (this.sitesComDependencias > 0 || this.sitesSemDependencias != this.nSitesParaChecar);
	this.carregouTodasDependencias = (this.totalDeRepescagensCarregadas == this.totalDeRepescagensEsperadas);
	
	if(!this.temDependencias || (this.temDependencias && this.carregouTodasDependencias)){
		// console.log('PASSOU no check geral.');
		return true;
		// //se precisou esperar carregar as coisas da busca
		// if(this.query){
		// 	this.timeline = new Timeline(this);
		// 	this.timeline.init();
		// 	this.onTimelineReady();
		// } else {
		// 	this.checkDataComplete();
		// }
		// // console.log('\\o/');
	} else {
		var problem = "";
		problem += (this.temDependencias && this.carregouTodasDependencias) ? "" : "não carregou todas as dependencias"
		console.log('Check G:  ' + problem);
		return false;
	}
}

DataManager.prototype.organizaPullDowns = function(){ //<-- SÓ DEPOIS Q CARREGAR OS ESPAÇOS
	this.pulldowns = {};
	this.pulldowns.oque = {};
	this.pulldowns.onde = {};
	this.pulldowns.quem = {};
	for(var i in this.pds){
		var obj = this.pds[i];
		for(var j in obj){
			var a = obj[j];
			
			//oque (tipo)
			if(a.tipo){
				var tipos = a.tipo.split(', ');
				for(var t in tipos){
					var tipo = tipos[t];
					var slug = DataManager.stringToSlug(tipo);
					if(!this.pulldowns.oque[slug]){
						this.pulldowns.oque[slug] = {};
						this.pulldowns.oque[slug].id = slug;
						this.pulldowns.oque[slug].label = tipo;
					}
				}
			} else {
				console.log(a.id + ' não tem tipo.');
			}
			
			//onde
			if(a.onde){
				var ondes = a.onde.split(', ');
				for(var o in ondes){
					var onde = ondes[o];
					if(this.espacos[onde]){
						var label = this.espacos[onde].nome.replace(/\n/g, '')
						var slug = DataManager.stringToSlug(label);
						if(!this.pulldowns.onde[onde] && this.espacos && this.espacos[onde]){
							this.pulldowns.onde[slug] = {};
							this.pulldowns.onde[slug].id = onde;
							this.pulldowns.onde[slug].label = label;
						}						
					} else {
						// console.log('ERRO: ' + onde + ' não existe.');
						alert('ERRO: ' + onde + ' não existe.');
					}
				}
			} else {
				console.log(a.id + ' não tem onde.');
			}
			
			//quem
			if(a.quem){
				var quems = a.quem.split('\n');
				for(var q in quems){
					var quem = quems[q];
					var slug = DataManager.stringToSlug(quem);
					if(!this.pulldowns.quem[slug]){
						this.pulldowns.quem[slug] = {};
						this.pulldowns.quem[slug].id = slug;
						this.pulldowns.quem[slug].label = quem;
					}
				}
			} else {
				DEBUG ? console.log(a.id + ' não tem quem.') : null;
			}
		}
	}
	
	//ordena o quê
	this.pulldowns.oque._ordenado = [];
	for(var i in this.pulldowns.oque){
		this.pulldowns.oque._ordenado.push(this.pulldowns.oque[i]);
	}
	this.pulldowns.oque._ordenado.pop(); //< não sei pq, mas o último elemento do for era um array com os objetos! O excluo.
	this.pulldowns.oque._ordenado.sort(this.alphaSortOque);
	
	//ordena onde
	this.pulldowns.onde._ordenado = [];
	for(var i in this.pulldowns.onde){
		this.pulldowns.onde._ordenado.push(this.pulldowns.onde[i]);
	}
	this.pulldowns.onde._ordenado.pop();
	this.pulldowns.onde._ordenado.sort(this.alphaSortOnde);
	
	//ordena quem
	this.pulldowns.quem._ordenado = [];
	for(var i in this.pulldowns.quem){
		this.pulldowns.quem._ordenado.push(this.pulldowns.quem[i]);
	}
	this.pulldowns.quem._ordenado.pop();
	this.pulldowns.quem._ordenado.sort(this.alphaSortQuem);
	
	//
	this.checkDataComplete();
}

DataManager.prototype.alphaSortOque = function(a,b){
	var sA = a.id;
	var sB = b.id;
	if (sA < sB) {return -1}
	if (sA > sB) {return 1}
	return 0;
}

DataManager.prototype.alphaSortOnde = function(a,b){
	if(a.label && b.label){
		var sA = DataManager.stringToSlug(a.label);
		var sB = DataManager.stringToSlug(b.label);
		if (sA < sB) {return -1}
		if (sA > sB) {return 1}
	}
	return 0;
}

DataManager.prototype.alphaSortQuem = function(a,b){
	var sA = a.id;
	var sB = b.id;
	if (sA < sB) {return -1}
	if (sA > sB) {return 1}
	return 0;
}

DataManager.prototype.onTimelineReady = function(){
	// console.log('TIMELINE READY');
	if(this.query){
		delete this.timeline.timelineStr;
		this.checkDataComplete();
	} else if(this.when){
		
		var w = this.when.split(',');
		var dI = new Date(parseInt(w[0]));
		var dF = new Date(parseInt(w[1]));
		// console.log(dI);
		// console.log(dF);
		var f = this.timeline.dateToDv(dI);	//first
		var l = this.timeline.dateToDv(dF); //last
		// console.log([f, l])
		var dateQuery = '&sq=!((dvi<=' + f + ' and dvf<=' + f + ') or (dvi>=' + l + ' and dvf>=' + l + ')) and publicar==1';
		// var dateQuery = '&sq=!((dvi<=' + f + ' and dvf<=' + f + ') or (dvi>=' + l + ' and dvf>=' + l + ') or tempai!=0) and publicar==1';
		url = 'https://spreadsheets.google.com/feeds/list/' + this.sites[this.sId].key + '/2/public/basic?alt=json' + dateQuery;
		url = encodeURI(url);
		// this.loadJsonToVar(url, 'atividades');
		this.preAtividades ? null : this.preAtividades = [];
		this.preAtividadesEsperadas ? null : this.preAtividadesEsperadas = 1;
		this.addJsonToArray(url, 'preAtividades', this.currentSite.id);
		// console.log(url);		
		
	} else {
		var f = this.timeline.dateToDv(this.timeline.first.date);
		var l = this.timeline.dateToDv(this.timeline.last.date);
		isNaN(f) ? console.log(['ERRO: f isNaN', this.timeline.first.date]) : null;
		isNaN(l) ? console.log(['ERRO: l isNaN', this.timeline.last.date]) : null;
		var dateQuery = '&sq=!((dvi<=' + f + ' and dvf<=' + f + ') or (dvi>=' + l + ' and dvf>=' + l + ')) and publicar==1';
		url = 'https://spreadsheets.google.com/feeds/list/' + this.sites[this.sId].key + '/2/public/basic?alt=json' + dateQuery;
		url = encodeURI(url);
		// this.loadJsonToVar(url, 'atividades');
		this.preAtividades ? null : this.preAtividades = [];
		this.preAtividadesEsperadas ? null : this.preAtividadesEsperadas = 1;
		this.addJsonToArray(url, 'preAtividades', this.currentSite.id);
		// console.log(url);
	}
}

DataManager.prototype.checkDataComplete = function(){
	// console.log('checking data ..');
	
	// //DEBUG
	// console.log('checkDataComplete START');
	// for(var i in this.atividades){
	// 	for(var j in this.atividades[i]){
	// 		console.log(i + j);
	// 	}
	// }
	// console.log('checkDataComplete END');
		
	//checa tudo
	if(this.atividades && this.sites && this.pessoas && this.espacos && this.pulldowns && this.totalRequests == this.loadedRequests && !this.completedBefore && this.timeline && !this.aguardandoConferirDependencias && this.nSitesOrganizados == this.nSitesParaChecar){
		// console.log('complete with timeline');
		this.completedBefore = true;
		this.onDataComplete();
	} else if(this.atividades && this.sites && this.pessoas && this.espacos && this.pulldowns && this.totalRequests == this.loadedRequests && !this.completedBefore && !this.timeline && this.nSitesOrganizados == this.nSitesParaChecar){
		// console.log('ALMOST complete. Creating timeline.');
		this.timeline = new Timeline(this);
		this.timeline.init();
		//checa o carregamento geral
		this.confereDependenciasGeral() ? this.aguardandoConferirDependencias = false : null;
		this.checkDataComplete();
		// this.completedBefore = true;
		// this.onDataComplete();
	} else {
		// var whatsMissing = "";
		// whatsMissing += this.atividades ? "" : " atividades";
		// whatsMissing += this.sites ? "" : " sites";
		// whatsMissing += this.pessoas ? "" : " pessoas";
		// whatsMissing += this.espacos ? "" : " espacos";
		// whatsMissing += this.pulldowns ? "" : " pulldowns";
		// whatsMissing += this.totalRequests == this.loadedRequests ? "" : " requests";
		// whatsMissing += !this.completedBefore ? "" : " alreadyCompleted";
		// whatsMissing += this.timeline ? "" : " timeline";
		// whatsMissing += !this.aguardandoConferirDependencias ? "" : " aguardandoConferirDependencias";
		// whatsMissing += this.nSitesOrganizados == this.nSitesParaChecar ? "" : " faltaOrganizar";
		
		var whatsMissing = [];
		this.atividades ? null : whatsMissing.push("atividades");
		this.sites ? null : whatsMissing.push("sites");
		this.pessoas ? null : whatsMissing.push("pessoas");
		this.espacos ? null : whatsMissing.push("espacos");
		this.pulldowns ? null : whatsMissing.push("pulldowns");
		this.totalRequests == this.loadedRequests ? null : whatsMissing.push("requests");
		this.completedBefore ? whatsMissing.push("alreadyCompleted") : null;
		this.timeline ? null : whatsMissing.push("timeline");
		this.aguardandoConferirDependencias ? whatsMissing.push("aguardandoConferirDependencias") : null;
		this.nSitesOrganizados == this.nSitesParaChecar ? null : whatsMissing.push("faltaOrganizar");
		
		//libera para os casos onde tem when
		if(this.when && this.atividades && this.sites && this.pessoas && this.espacos && this.pulldowns && this.totalRequests == this.loadedRequests && !this.completedBefore && this.timeline){
			console.log(['NENHUM RESULTADO', this]);
			
			//cria atividade Dummy
			this.sites.s0 = {};
			this.sites.s0.esconderbio = '0';
			this.atividades.s0 = {};
			this.atividades.s0.a0000 = {};
			var a = this.atividades.s0.a0000;
			a.id = 'a0000';
			a.idSiteOriginal = 's0';
			a.nome = 'Nenhuma atividade encontrada';
			a.sobre = 'A busca que você fez não retornou nenhum resultado.</br>Clique aqui para voltar, ou faça uma nova busca nos filtros acima.';
			a.context = this.parent;
			console.log(a.context);
			a.visual = 'p';
			var epochs = this.when.split(',');
			// var epochMedio = Math.round((parseInt(epochs[0]) + parseInt(epochs[1]))/2);
			// a.datainicial = new Date(epochMedio);
			// a.datafinal = new Date(epochMedio+1);
			a.datainicial = new Date(parseInt(epochs[0]));
			a.datafinal = new Date(parseInt(epochs[1]));
			a.subsite = window.location.pathname;
			
			//prossegue
			this.completedBefore = true;
			this.onDataComplete();
		} else {
			console.log('Check DC: ' + whatsMissing);			
		}
	}
}

DataManager.prototype.trataParticipantes = function(){
	
	/////// FASE 2 ///////
	//16. Quando esconderBio for SIM, importar dados das atividades filhas da tabela PESSOAS.
	// Helena preencheria:
	// - id
	// - nome 
	// - parent
	// 
	// Sistema preencheria:
	// - tipo = 'participante'
	// - visual, onde, data inicial e data final = do parent
	// - sobre = bio
	// - imagem = imagem da pessoa
	// - crédito (incluir na tabela) = credito da pessoa
	// - horário = do parent
	
	for(var s in this.atividades){
		for(var i in this.atividades[s]){
			var a = this.atividades[s][i];
			if(this.sites[s] && this.sites[s].esconderbio && a.dependentes){
				for(var j in a.dependentes){
					var d = a.dependentes[j];
					var pai = a;
					var pessoa = this.pessoas[DataManager.stringToSlug(d.nome)];
					if(pai && pessoa){				
						//hardcoded
						d.tipo = 'participante';
						d.visual = 'p';

						//pega infos do pai
						d.datainicial = pai.datainicial ? pai.datainicial : new Date();
						d.datafinal = pai.datafinal ? pai.datafinal : new Date();
						d.dvi = pai.dvi ? pai.dvi : this.timeline.dateToDv(new Date());
						d.dvf = pai.dvf ? pai.dvf : this.timeline.dateToDv(new Date());
						pai.onde ? d.onde = pai.onde : console.log('ERRO: Pai de ' + d.id + ' não tem ONDE cadastrado');
						pai.horario ? d.horario = pai.horario : null;

						//pega infos da pessoa
						d.sobre = pessoa.bio ? pessoa.bio : 'CADASTRAR BIO';
						d.imagens = pessoa.imagem ? pessoa.imagem : '../interface/default-img.png';
						d.credito = pessoa.credito ? pessoa.credito : 'arquivo pessoal';
						pessoa.site ? d.site = pessoa.site : null;
						
						// d.pai = pai;
						// d.pessoa = pessoa;

						console.log(['MEXI (' + d.id + ') ' + d.nome, d]);
					}	else {
						!pai ? console.log('WARNING: ' + d.id + ' não tem PARENT.') : null;
						!pessoa ? console.log('WARNING: ' + d.nome + ' (' + d.id + ') não cadastrado no GERAL > PESSOAS.') : null;

						// !pai ? alert('WARNING: ' + d.id + ' não tem PARENT.') : null;
						// !pessoa ? alert('WARNING: ' + d.nome + ' (' + d.id + ') não cadastrado no GERAL > PESSOAS.') : null;
					}
				}
			} else {
				if(a.tipo && a.tipo.toLowerCase() == 'participante'){
					console.log(['ERRO', a.id + ' não tem PARENT.', a]);
					// alert(['ERRO: ' + a.id + ' não tem PARENT.']);
				} else {
					// console.log(['WARNING', a.id + ' não tem PARENT.', a]);
					// alert(['WARNING: ' + a.id + ' não tem PARENT.']);
				}
			}
		}
	}
}

DataManager.prototype.onDataComplete = function(){
	// //DEBUG
	// console.log('onDataComplete START');
	// for(var i in this.atividades){
	// 	for(var j in this.atividades[i]){
	// 		console.log(i + j);
	// 	}
	// }
	// console.log('onDataComplete END');
	
	this.trataParticipantes();
	this.parent.dataManager = this;
	this.parent.init();
	this.query ? console.log(['Init done. QUERY.', this]) : console.log(['Init done.', this]);
	// console.log(['Atividades', this.atividades]);
}

DataManager.prototype.loadActivitiesByDate = function(){
	this.timeline = new Timeline(this);
	this.timeline.init();
	this.onTimelineReady();
}

DataManager.prototype.loadQueryActivities = function(){
	this.preAtividades ? null : this.preAtividades = [];
	this.preAtividadesEsperadas ? null : this.preAtividadesEsperadas = 0;
	// this.preAtividades = [];
	// this.preAtividadesEsperadas = 0;
	if(this.currentSite.ondebuscar){
		var sites = this.currentSite.ondebuscar.split(', ');
		// console.log(['sites', sites]);
		for (var i in sites){
			// console.log('Alguns. Chamando ' + sites[i]);
			url = 'https://spreadsheets.google.com/feeds/list/' + this.sites[sites[i]].key + '/2/public/basic?alt=json&q=' + this.query + '&sq=publicar==1';
			url = encodeURI(url);
			// console.log(url);
			this.preAtividadesEsperadas ++;
			this.addJsonToArray(url, 'preAtividades', sites[i]);
		}
	} else {
		for(var i in this.sites){
			var preSID = this.sites[i].id;
			// console.log('Todos. Chamando ' + preSID);
			url = 'https://spreadsheets.google.com/feeds/list/' + this.sites[preSID].key + '/2/public/basic?alt=json&q=' + this.query + '&sq=publicar==1';
			url = encodeURI(url);
			// console.log(url);
			this.preAtividadesEsperadas ++;
			this.addJsonToArray(url, 'preAtividades', preSID);
		}
	}
}

DataManager.prototype.loadJsonToVar = function(url, vName){
	console.log(['JsontoVar: ' + vName, url]);
	var context = {};
	context.instance = this;
	context.vName = vName;
	this.totalRequests ++;
	$.getJSON(url, $.proxy(DataManager.jsonToVar, context));
}

DataManager.prototype.addJsonToArray = function(url, arrName, preSID){
	console.log(['JsontoArray: ' + arrName, url]);
	var context = {};
	context.instance = this;
	context.arrName = arrName;
	context.preSID = preSID;
	this.totalRequests ++;
	$.getJSON(url, $.proxy(DataManager.jsonToArrayElement, context));
}

DataManager.jsonToVar = function(json){
	this.instance[this.vName] = DataManager.listToObj(json, this.vName);
	this.instance.onJsonLoaded(this.vName);
}

DataManager.jsonToArrayElement = function(json){
	var obj = DataManager.listToObj(json, this.arrName);
	var objLength = 0;
	for(var i in obj){
		objLength ++;
	}
	
	if(objLength > 0){
		this.instance.incluiSiteDeOrigem(obj, this.preSID);
		this.instance[this.arrName].push(obj);		
	} else {
		this.instance.preAtividadesEsperadas --;
		this.instance.nSitesParaDescontar = this.instance.nSitesParaDescontar ? this.instance.nSitesParaDescontar + 1 : 1;
		console.log([this.arrName + ': retorno vazio (' + this.preSID + ')', json]);
	}

	this.instance.onJsonLoaded(this.arrName, this.preSID);
}

DataManager.prototype.incluiSiteDeOrigem = function(objPrincipal, idSiteOriginal){
	for(var i in objPrincipal){
		var o = objPrincipal[i];
		o.idSiteOriginal = idSiteOriginal;
	}
}

DataManager.prototype.loadPulldownInfo = function(mainKey){
	this.pds = [];
	this.pulldownsEsperados = 0;
	if(this.currentSite.ondebuscar){
		//busca só nos sites listados
		var sites = this.currentSite.ondebuscar.split(', ');
		for(var s in sites){
			var url = 'https://spreadsheets.google.com/feeds/list/' + this.sites[sites[s]].key + '/3/public/basic?alt=json&sq=publicar==1';
			this.pulldownsEsperados ++;
			this.addJsonToArray(url, 'pds', this.sites[sites[s]].id);
		}
	} else {
		//busca em todos os sites listados na planilha geral (mainKey);
		for(var s in this.sites){
			var url = 'https://spreadsheets.google.com/feeds/list/' + this.sites[s].key + '/3/public/basic?alt=json&sq=publicar==1';
			this.pulldownsEsperados ++;
			this.addJsonToArray(url, 'pds', s);
		}
	}
}

DataManager.listToObj = function(json, debugInfo){
	 // console.log([debugInfo, json]);
	//IMPORTANTE: PRIMEIRA COLUNA (da sheet q o json representa) NÃO É PROCESSADA pois ela vira título quando usamos list.
	var entry = json.feed.entry;
	var arr = [];
	//varre as entries, parseando a string
	for(var i in entry){
		var obj = {}
		var string = entry[i].content.$t;
		var colunas = string.split(', ');
		for(var j in colunas){
			colunas[j] = colunas[j].split(': ');
			colunas[j][1] = colunas[j][1] ? colunas[j][1].replace(/¥Ω/g, ',') : undefined;
			colunas[j][1] = colunas[j][1] ? colunas[j][1].replace(/¢£/g, ':') : undefined;
			// colunas[j][1] = colunas[j][1] ? colunas[j][1].replace(/•≈/g, '\n') : undefined;
			obj[colunas[j][0]] = colunas[j][1];
		}
		arr.push(obj);
	}
	//converte o array num objeto com os ids(ou nomes) como identificador
	var dados = {};
	for(var i in arr){
		var obj = arr[i];
		if(arr[i].id){
			dados[arr[i].id] = obj;
		} else if(arr[i].nome) {
			dados[DataManager.stringToSlug(arr[i].nome)] = obj;
		}
	}
	return dados;
}

DataManager.stringToSlug = function(str) {
  str = str.replace(/^\s+|\s+$/g, ''); // trim
  str = str.toLowerCase();
  
  // remove accents, swap ñ for n, etc
  var from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;";
  var to   = "aaaaeeeeiiiioooouuuunc------";
  for (var i=0, l=from.length ; i<l ; i++) {
    str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
  }

  str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
    .replace(/\s+/g, '-') // collapse whitespace and replace by -
    .replace(/-+/g, '-'); // collapse dashes

  return str;
}