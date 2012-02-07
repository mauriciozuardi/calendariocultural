var DEBUG = false;

function DataManager(caller){
	//INCLUIR NO INDEX.PHP: <script type="text/javascript" charset="utf-8"> var v="<?php echo $_GET['v']; ?>"; console.log(v);</script>
	this.parent = caller;
	this.totalRequests = 0;
	this.loadedRequests = 0;
	this.mainKey = "0AnLIuvvW8l93dDViZURvYkRGTFZldXpTbVIwNnlTOUE";
}

DataManager.prototype.wrapUrlVars = function(vars){
	for(var i in vars){
		var vName = vars[i];
		this[vName] = window[vName];
		delete window[vName];
	}
}

DataManager.prototype.init = function(){
	this.sId = (this.sId == '') ? 's1' : this.sId;
	this.loadBasicInfo();
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
				this.organizaPreAtividades();
			}
			break;
		// case 'atividades':
		// 		this.confereDependencias();
		// 	break;
		case 'repescagem_' + preSID :
			if(this['repescagensEsperadas_' + preSID] == this['repescagem_' + preSID].length){
				console.log('chegaram todas as repescagens de ' + preSID);
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
	this.atividades = {};
	for(var i in this.preAtividades){
		var obj = this.preAtividades[i];
		for(var j in obj){
			var a = obj[j];
			var lastSite = a.idSiteOriginal;
			lastSite == undefined ? console.log(['lastSite undefined for: ' + a.id, a]) : null;
			this.atividades[a.idSiteOriginal] ? null : this.atividades[a.idSiteOriginal] = {};
			this.atividades[a.idSiteOriginal][a.id] = a;
		}
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
	if(s){
		this.totalDeRepescagensEsperadas ? null : this.totalDeRepescagensEsperadas = 0;
		this.sitesSemDependencias ? null : this.sitesSemDependencias = 0;
		this.sitesComDependencias ? null : this.sitesComDependencias = 0;
	
		//varre as atividades procurando se alguma tem parent
		this.pais = {};
		this.pais[s] = [];
		for(var i in this.atividades[s]){
			var a = this.atividades[s][i];
			if(a.parent){
				var repetido = false;
				for(var p in this.pais[s]){
					var pai = this.pais[s][p];
					if(pai == a.parent){ repetido = true; break }
				}
				if(!repetido){ this.pais[s].push(a.parent) }
			}
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
			this.confereDependenciasGeral();
			console.log(s + ': sem dependencias');
			this.checkDataComplete();
		}		
	} else {
		console.log('ERRO: confereDependencias(s) undefined');
	}
}

DataManager.prototype.trataValoresDasAtividades = function(s){
	this.datasInvalidas ? null : this.datasInvalidas = {};
	var todasValidas = true;
	for(var i in this.atividades[s]){
		//tenta transformar em data
		this.atividades[s][i].datainicial = new Date(this.atividades[s][i].datainicial);
		this.atividades[s][i].datafinal	 = new Date(this.atividades[s][i].datafinal);
		//confere se alguma é inválida
		var inv = 'Invalid Date';
		if(this.atividades[s][i].datainicial == inv || this.atividades[s][i].datafinal == inv){
			//marca na lista negra
			todasValidas = false;
			this.datasInvalidas[s + '-' + this.atividades[s][i].id] = this.atividades[s][i];
			//cria datas ok para não fuder o site
			this.atividades[s][i].datainicial = new Date();
			this.atividades[s][i].datafinal	 = new Date(Date.now() + 1);
		}
	}
	if(todasValidas){
		delete this.datasInvalidas;
	}
}

DataManager.prototype.organizaAtividadesEmGrupos = function(s){
	//parse dos valores
	this.trataValoresDasAtividades(s);
	
	//prepara para receber os dependentes
	for(var i in this.atividades[s]){
		this.atividades[s][i].nDependentes = 0;
		this.atividades[s][i].dependentes = {};
	}
	//move os dependentes para a atividade principal;
	for(var i in this.atividades[s]){
		var a = this.atividades[s][i];
		for(var j in this.pais[s]){
			var p = this.pais[s][j];
			// a.parent ? console.log(a.parent + ":" + p + " = " + a.id) : null;
			if(a.parent == p){
				this.atividades[s][p].dependentes[a.id] = a;
				this.atividades[s][p].nDependentes ++;
				delete this.atividades[s][i];
			}
		}
	}
	//exclui os dependentes se não tiver nenhum
	for(var i in this.atividades[s]){
		if(this.atividades[s][i].nDependentes == 0){
			delete this.atividades[s][i].dependentes;
		}
	}
	
	//ajusta o range de todos os pais, baseado nos filhos
	for(var i in this.pais[s]){
		var a = this.atividades[s][this.pais[s][i]];
		Timeline.defineParentRange(a);
	}
	
	this.confereDependenciasGeral();
}

DataManager.prototype.confereDependenciasGeral = function(){
	// SE O TOTAL DE REPESCAGENS CHEGOU ..
	this.nSitesParaChecar = this.currentSite.ondebuscar ? this.currentSite.ondebuscar.split(', ').length : this.nSites;
	this.temDependencias = (this.sitesSemDependencias != this.nSitesParaChecar);
	this.carregouTodasDependencias = (this.totalDeRepescagensCarregadas == this.totalDeRepescagensEsperadas);
	
	if(!this.temDependencias || (this.temDependencias && this.carregouTodasDependencias)){
		//se precisou esperar carregar as coisas da busca
		if(this.query){
			this.timeline = new Timeline(this);
			// console.log('init timeline : by query');
			this.timeline.init();
			this.onTimelineReady();
		} else {
			this.checkDataComplete();
		}
		// console.log('\\o/');
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
					var label = this.espacos[onde].nome.replace(/\n/g, '')
					var slug = DataManager.stringToSlug(label);
					if(!this.pulldowns.onde[onde] && this.espacos && this.espacos[onde]){
						this.pulldowns.onde[slug] = {};
						this.pulldowns.onde[slug].id = onde;
						this.pulldowns.onde[slug].label = label;
					}
				}
			} else {
				console.log(a.id + ' não tem onde.');
			}
			
			//quem
			if(a.quem){
				var quems = a.quem.split(', ');
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
	if(this.query){
		delete this.timeline.timelineStr;
		this.checkDataComplete();
	} else {
		var f = this.timeline.dateToDv(this.timeline.first.date);
		var l = this.timeline.dateToDv(this.timeline.last.date);
		var dateQuery = '&sq=!((dvi<=' + f + ' and dvf<=' + f + ') or (dvi>=' + l + ' and dvf>=' + l + ')) and publicar==1';
		url = 'https://spreadsheets.google.com/feeds/list/' + this.sites[this.sId].key + '/2/public/basic?alt=json' + dateQuery;
		url = encodeURI(url);
		// this.loadJsonToVar(url, 'atividades');
		this.preAtividades = [];
		this.preAtividadesEsperadas = 1;
		this.addJsonToArray(url, 'preAtividades', this.currentSite.id);
	}
}

DataManager.prototype.checkDataComplete = function(){
	if(this.atividades && this.sites && this.pessoas && this.espacos && this.pulldowns && this.totalRequests == this.loadedRequests && !this.completedBefore){
		this.completedBefore = true;
		this.onDataComplete();
	}
}

DataManager.prototype.onDataComplete = function(){
	this.parent.dataManager = this;
	this.parent.init();
	this.query ? console.log(['Init done. QUERY.', this]) : console.log(['Init done.', this]);
	console.log(['Atividades', this.atividades]);
}

DataManager.prototype.loadActivitiesByDate = function(){
	this.timeline = new Timeline(this);
	// console.log('init timeline : by date');
	this.timeline.init();
	this.onTimelineReady();
}

DataManager.prototype.loadQueryActivities = function(){
	this.preAtividades = [];
	this.preAtividadesEsperadas = 0;
	if(this.currentSite.ondebuscar){
		var sites = this.currentSite.ondebuscar.split(', ');
		for (var i in sites){
			console.log('Alguns. Chamando ' + sites[i]);
			url = 'https://spreadsheets.google.com/feeds/list/' + this.sites[sites[i]].key + '/2/public/basic?alt=json&q=' + this.query;
			url = encodeURI(url);
			// console.log(url);
			this.preAtividadesEsperadas ++;
			this.addJsonToArray(url, 'preAtividades', sites[i]);
		}
	} else {
		for(var i in this.sites){
			var preSID = this.sites[i].id;
			console.log('Todos. Chamando ' + preSID);
			url = 'https://spreadsheets.google.com/feeds/list/' + this.sites[preSID].key + '/2/public/basic?alt=json&q=' + this.query;
			url = encodeURI(url);
			// console.log(url);
			this.preAtividadesEsperadas ++;
			this.addJsonToArray(url, 'preAtividades', preSID);
		}
	}
}

DataManager.prototype.loadJsonToVar = function(url, vName){
	// console.log(vName);
	var context = {};
	context.instance = this;
	context.vName = vName;
	this.totalRequests ++;
	$.getJSON(url, $.proxy(DataManager.jsonToVar, context));
}

DataManager.prototype.addJsonToArray = function(url, arrName, preSID){
	var context = {};
	context.instance = this;
	context.arrName = arrName;
	context.preSID = preSID;
	// console.log(context)
	this.totalRequests ++;
	$.getJSON(url, $.proxy(DataManager.jsonToArrayElement, context));
}

DataManager.jsonToVar = function(json){
	this.instance[this.vName] = DataManager.listToObj(json);
	this.instance.onJsonLoaded(this.vName);
}

DataManager.jsonToArrayElement = function(json){
	var obj = DataManager.listToObj(json);
	var objLength = 0;
	for(var i in obj){
		objLength ++;
	}
	
	if(objLength > 0){
		this.instance.incluiSiteDeOrigem(obj, this.preSID);
		// this.arrName.substr(0,11) == 'repescagem_' ? console.log([this.arrName, this]) : null;
		this.instance[this.arrName].push(obj);		
	} else {
		this.instance.preAtividadesEsperadas --;
		console.log([this.arrName + ': retorno vazio', json]);
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

DataManager.listToObj = function(json){
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