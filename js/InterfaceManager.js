function InterfaceManager(){
	
}

InterfaceManager.prototype.init = function(vars){
	this.drawHeader();
	this.drawContents();
	this.drawFooter();
}

InterfaceManager.prototype.drawHeader = function(){
	//escreve o HTML
	$('body').append("<div class='header'></div>");
	var html = "";
	html += "<img src='./img/content/" + this.dataManager.currentSite.logo + "' />";
	html += this.drawPullDowns();
	$('.header').html(html);
	
	var context = {}
	context.instance = this;
	var onPullDownChange = $.proxy(this.onPullDownChange, context);
	
	//aplica os controles
	$('.oque').change(onPullDownChange);
	$('.onde').change(onPullDownChange);
	$('.quem').change(onPullDownChange);
}

InterfaceManager.prototype.onPullDownChange = function(){
	var t = $(event.target);
	var v = t.val();
	
	if(v != 'o quê' && v != 'onde' && v != 'quem'){
		if(t.hasClass('oque')){
			var query = v;
		}
		if(t.hasClass('onde')){
			var query = this.instance.dataManager.pulldowns.onde[DataManager.stringToSlug(v)].id;
		}
		if(t.hasClass('quem')){
			var query = v;
		}
		//
		var newURL = window.location.href.toString().split(window.location.search)[0];
		newURL += '?q=' + encodeURI(query);
		console.log(newURL);
		// window.location = newURL;
	}
}

InterfaceManager.prototype.drawPullDowns = function(){	
	var html = ""
	//desenha o quê
	if(this.dataManager.pulldowns.oque._ordenado.length > 1 && !this.dataManager.currentSite.semoque){
		html += "<select class='oque'><option>o quê</option>";
		for(var i in this.dataManager.pulldowns.oque._ordenado){
			var label = this.dataManager.pulldowns.oque._ordenado[i].label;
			html += "<option>" + label + "</option>";
		}
		html += "</select>";
	}
	//desenha onde
	if(this.dataManager.pulldowns.onde._ordenado.length > 1 && !this.dataManager.currentSite.semonde){
		html += "<select class='onde'><option>onde</option>";
		for(var i in this.dataManager.pulldowns.onde._ordenado){
			var label = this.dataManager.pulldowns.onde._ordenado[i].label;
			html += "<option>" + label + "</option>";
		}
		html += "</select>";
	}
	//desenha quem
	if(this.dataManager.pulldowns.quem._ordenado.length > 1 && !this.dataManager.currentSite.semquem){
		html += "<select class='quem'><option>quem</option>";
		for(var i in this.dataManager.pulldowns.quem._ordenado){
			var label = this.dataManager.pulldowns.quem._ordenado[i].label;
			html += "<option>" + label + "</option>";
		}
		html += "</select>";
	}
	return html;
}

InterfaceManager.prototype.drawContents = function(){
	
}

InterfaceManager.prototype.drawFooter = function(){
	
}