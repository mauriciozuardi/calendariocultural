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
	
	//acompanha e direciona o carregamento das informações
	this.onJsonLoaded = function(loadedVarName){
		this.loadedRequests ++;
		if(loadedVarName == 'sites'){
			this.loadPulldownInfo();
			if(this.query){
				this.queryActivities();
			} else {
				this.timeline = new Timeline(this);
				this.timeline.init();
				this.onTimelineReady();
			} 
		} else if(loadedVarName == 'atividades'){
			this.agrupaAtividades();
		}
	}
}

PageManager.prototype.agrupaAtividades = function(){
	//prepara para listar os filhos
	for(var i in this.atividades){
		var a = this.atividades[i];
		a.filhos = [];
	}
	//lista-os
	for(var i in this.atividades){
		a.parent ? this.atividades[a.parent].filhos.push(a) : null;
	}
}

PageManager.prototype.onTimelineReady = function(){
	if(this.query){
		// console.log(this.query);
	} else {
		// console.log(this.timeline);
		// console.log(this.timeline.first.date);
		var f = this.timeline.dateToDv(this.timeline.first.date);
		var l = this.timeline.dateToDv(this.timeline.last.date);
		var dateQuery = '&sq=!((dvi<=' + f + ' and dvf<=' + f + ') or (dvi>=' + l + ' and dvf>=' + l + ')) and publicar==1';
		url = 'https://spreadsheets.google.com/feeds/list/' + this.sites[this.sId].key + '/2/public/basic?alt=json' + encodeURI(dateQuery);
		this.loadJsonToVar(url, 'atividades');
	}
}

// PageManager.prototype.loadActivities = function(){
// 	var urlAtividades = 'https://spreadsheets.google.com/feeds/list/' + this.sites[this.sId] + '/1/public/basic?alt=json&sq=publicar==1'
// 	this.loadJsonToVar(urlAtividades, 'pessoas');
// }

PageManager.prototype.queryActivities = function(){
	console.log('should request activities for query: ' + this.query);
}

PageManager.prototype.loadJsonToVar = function(url, vName){
	var context = {};
	context.instance = this;
	context.vName = vName;
	this.totalRequests ++;
	$.getJSON(url, $.proxy(PageManager.jsonToVar, context));
}

PageManager.prototype.addJsonToArray = function(url, arrName){
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
	this.pd = [];
	for(var s in this.sites){
		var url = 'https://spreadsheets.google.com/feeds/list/' + this.sites[s].key + '/3/public/basic?alt=json&sq=publicar==1'
		this.addJsonToArray(url, 'pd');
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
		var value = isNaN(value) ? value : parseFloat(value);
		if(arr[i].id){
			dados[arr[i].id] = arr[i];
		} else if(arr[i].nome) {
			dados[PageManager.stringToSlug(arr[i].nome)] = arr[i];
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