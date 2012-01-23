function PageManager(){
	//INCLUIR NO INDEX.PHP: <script type="text/javascript" charset="utf-8"> var v="<?php echo $_GET['v']; ?>"; console.log(v);</script>
	this.totalRequests = 0;
	this.loadedRequests = 0;
	this.mainKey = "0AnLIuvvW8l93dDViZURvYkRGTFZldXpTbVIwNnlTOUE";
}

PageManager.prototype.wrapUrlVars = function(vars){
	for(var i in vars){
		var vName = vars[i];
		this[vName] = window[vName];
		delete window[vName];
	}
}

PageManager.prototype.init = function(){
	this.sId = (this.sId == '') ? 's1' : this.sId;
	this.loadBasicInfo();
}

PageManager.prototype.loadBasicInfo = function(mainKey){
	var urlSites   = 'https://spreadsheets.google.com/feeds/list/' + this.mainKey + '/6/public/basic?alt=json&sq=publicar==1';
	var urlEspacos = 'https://spreadsheets.google.com/feeds/list/' + this.mainKey + '/4/public/basic?alt=json&sq=publicar==1';
	var urlPessoas = 'https://spreadsheets.google.com/feeds/list/' + this.mainKey + '/5/public/basic?alt=json&sq=publicar==1';
	
	this.loadJsonToVar(urlSites, 'sites');
	this.loadJsonToVar(urlEspacos, 'espacos');
	this.loadJsonToVar(urlPessoas, 'pessoas');
}

PageManager.prototype.onJsonLoaded = function(loadedVarName){
	//acompanha e direciona o carregamento das informações
	this.loadedRequests ++;
	
	switch(loadedVarName){
		case 'sites':
			this.loadPulldownInfo();
			if(this.query){
				this.loadQueryActivities();
			} else {
				this.loadActivitiesByDate();
			}
			break;
		case 'pulldowns':
			this.organizaPullDowns();
		break;
		case 'atividades':
				this.confereDependencias();
			break;
		case 'repescagem':
			if(this.repescagensEsperadas == this.repescagem.length){
				this.incluiDependencias();
			}
		break;
		default:
		break;
	}
}

PageManager.prototype.incluiDependencias = function(){
	if(this.repescagem){
		for(var i in this.repescagem){
			var arrIndex = this.repescagem[i];
			for(var j in arrIndex){
				var obj = arrIndex[j];
				this.atividades[j] ? null : this.atividades[j] = obj;
			}
		}
	}
	delete this.repescagem;
	this.organizaAtividadesEmGrupos();
}

PageManager.prototype.confereDependencias = function(){
	//varre as atividades procurando se alguma tem parent
	this.pais = [];
	for(var i in this.atividades){
		var a = this.atividades[i];
		if(a.parent){
			var repetido = false;
			for(var p in this.pais){
				var pai = this.pais[p];
				if(pai == a.parent){ repetido = true; break }
			}
			if(!repetido){ this.pais.push(a.parent) }
		}
	}
	//se precisar, carrega de novo, buscando pelos pais agora
	if(this.pais.length > 0){
		this.repescagem = [];
		this.repescagensEsperadas = 0;
		for(var i in this.pais){
			var pai = this.pais[i];
			var url = 'https://spreadsheets.google.com/feeds/list/' + this.sites[this.sId].key + '/2/public/basic?alt=json&q=' + pai + '&sq=publicar==1';
			this.repescagensEsperadas ++;
			this.addJsonToArray(url, 'repescagem');
		}		
	} else {
		this.organizaAtividadesEmGrupos();
	}
}

PageManager.prototype.trataValoresDasAtividades = function(){
	this.datasInvalidas = {}
	var todasValidas = true;
	for(var i in this.atividades){
		//tenta transformar em data
		this.atividades[i].datainicial = new Date(this.atividades[i].datainicial);
		this.atividades[i].datafinal	 = new Date(this.atividades[i].datafinal);
		//confere se alguma é inválida
		var inv = 'Invalid Date';
		if(this.atividades[i].datainicial == inv || this.atividades[i].datafinal == inv){
			//marca na lista negra
			todasValidas = false;
			this.datasInvalidas[this.atividades[i].id] = this.atividades[i];
			//cria datas ok para não fuder o site
			this.atividades[i].datainicial = new Date();
			this.atividades[i].datafinal	 = new Date(Date.now() + 1);
		}
	}
	if(todasValidas){
		delete this.datasInvalidas;
	}
}

PageManager.prototype.organizaAtividadesEmGrupos = function(){
	//parse dos valores
	this.trataValoresDasAtividades();
	
	//prepara para receber os dependentes
	for(var i in this.atividades){
		this.atividades[i].nDependentes = 0;
		this.atividades[i].dependentes = {};
	}
	//move os dependentes para a atividade principal;
	for(var i in this.atividades){
		var a = this.atividades[i];
		for(var j in this.pais){
			var p = this.pais[j];
			// a.parent ? console.log(a.parent + ":" + p + " = " + a.id) : null;
			if(a.parent == p){
				this.atividades[p].dependentes[a.id] = a;
				this.atividades[p].nDependentes ++;
				delete this.atividades[i];
			}
		}
	}
	//exclui os dependentes se não tiver nenhum
	for(var i in this.atividades){
		if(this.atividades[i].nDependentes == 0){
			delete this.atividades[i].dependentes;
		}
	}
	
	//ajusta o range de todos os pais, baseado nos filhos
	for(var i in this.pais){
		var a = this.atividades[this.pais[i]];
		Timeline.defineParentRange(a);
	}
	
	
	//se precisou esperar carregar as coisas da busca
	if(this.query){
		this.timeline = new Timeline(this);
		this.timeline.init();
		this.onTimelineReady();
	} else {
		console.log(['Init done. Site timeline.', this]);
	}
}

PageManager.prototype.organizaPullDowns = function(){
	
}

PageManager.prototype.onTimelineReady = function(){
	if(this.query){
		delete this.timeline.timelineStr;
		console.log(['Init done. Query timeline.', this]);
	} else {
		var f = this.timeline.dateToDv(this.timeline.first.date);
		var l = this.timeline.dateToDv(this.timeline.last.date);
		var dateQuery = '&sq=!((dvi<=' + f + ' and dvf<=' + f + ') or (dvi>=' + l + ' and dvf>=' + l + ')) and publicar==1';
		url = 'https://spreadsheets.google.com/feeds/list/' + this.sites[this.sId].key + '/2/public/basic?alt=json' + dateQuery;
		url = encodeURI(url);
		this.loadJsonToVar(url, 'atividades');	
	}
}

PageManager.prototype.loadActivitiesByDate = function(){
	this.timeline = new Timeline(this);
	this.timeline.init();
	this.onTimelineReady();
}

PageManager.prototype.loadQueryActivities = function(){
	url = 'https://spreadsheets.google.com/feeds/list/' + this.sites[this.sId].key + '/2/public/basic?alt=json&q=' + this.query;
	url = encodeURI(url);
	this.loadJsonToVar(url, 'atividades');
}

PageManager.prototype.loadJsonToVar = function(url, vName){
	// console.log(vName);
	var context = {};
	context.instance = this;
	context.vName = vName;
	this.totalRequests ++;
	$.getJSON(url, $.proxy(PageManager.jsonToVar, context));
}

PageManager.prototype.addJsonToArray = function(url, arrName){
	// console.log(arrName);
	var context = {};
	context.instance = this;
	context.arrName = arrName;
	this.totalRequests ++;
	$.getJSON(url, $.proxy(PageManager.jsonToArrayElement, context));
}

PageManager.jsonToVar = function(json){
	this.instance[this.vName] = PageManager.listToObj(json);
	this.instance.onJsonLoaded(this.vName);
}

PageManager.jsonToArrayElement = function(json){
	this.instance[this.arrName].push(PageManager.listToObj(json));
	this.instance.onJsonLoaded(this.arrName);
}

PageManager.prototype.loadPulldownInfo = function(mainKey){
	if(this.sites[this.sId].ondebuscar){
		console.log('devo buscar em ' + this.sites[this.sId].ondebuscar);
	} else {
		//busca em todos os sites
		this.pulldowns = [];
		for(var s in this.sites){
			var url = 'https://spreadsheets.google.com/feeds/list/' + this.sites[s].key + '/3/public/basic?alt=json&sq=publicar==1'
			this.addJsonToArray(url, 'pulldowns');
		}
	}
}

PageManager.listToObj = function(json){
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
			colunas[j][1] = colunas[j][1] ? colunas[j][1].replace(/•≈/g, '\n') : undefined;
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
			dados[PageManager.stringToSlug(arr[i].nome)] = obj;
		}
	}
	return dados;
}

PageManager.stringToSlug = function(str) {
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