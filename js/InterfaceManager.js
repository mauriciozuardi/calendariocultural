function InterfaceManager(){
	
}

InterfaceManager.prototype.init = function(vars){
	this.drawHeader();
	this.drawContents();
	this.drawFooter();
	this.updateScreen();
	$(window).resize(this.updateScreen);
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
		console.log(window.location.href);
		console.log(window.location.search);
		
		var newURL = window.location.search != '' ? window.location.href.toString().split(window.location.search)[0] : window.location.href;
		newURL += '?q=' + encodeURI(query);
		// console.log(newURL);
		window.location = newURL;
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
	//escreve o HTML básico
	$('body').append("<div class='bg'></div>");
	$('body').append("<div class='contents'></div>");
	$('.contents').append("<div class='timeline'></div>");
	$('.contents').append("<div class='activities'></div>");
	
	//seleciona um destaque
	
	//carrega o fundo
	$('.bg').addClass('bgcover');
	var imgName = 'cafesuplicy_1andre_vaca.jpg';
	var imgURL = './img/content/' + encodeURI(imgName);
	$('.bg').smartBackgroundImage(imgURL, 'bg');
	// $('.bg').css('background-color', 'red');
	
	//desenha a timeline
	
	//desenha as atividades
	
	//atualiza info
	
}

InterfaceManager.prototype.drawFooter = function(){
	//escreve o HTML básico
	$('body').append("<div class='footer'></div>");
	$('.footer').append("<div class='content-info'></div>");
	$('.footer').append("<div class='site-info'></div>");
	
	//preenche o site-info
	$('.footer .site-info').html("<p><a href'#'>sobre</a> // <a href='#'>equipe</a> // <a href='#'>contato@calendariocultural.com.br</a> // <a href='#'>+55 (11) 9934.0987</a> // <a href='#'>home</a><img src='./img/interface/logo-h2r.png' alt='Logo h2r' /></p>");
	
	//preenche o content-info
	
}

InterfaceManager.prototype.updateScreen = function(){
	var w = $(window).width();
	var h = $(window).height();
	var ct = $('.header').height(); // contents top
	var ch = h - $('.header').height() - $('.footer').height(); // contents height
	
	$('.bg').css('width', w);
	$('.bg').css('height', h);
	$('.contents').css('width', w);
	$('.contents').css('height', ch);
	$('.contents').css('top', ct);
	// $('.contents .timeline').css('width', w);
	// $('.contents .timeline').css('height', ch);
	// $('.contents .activities').css('width', w);
	// $('.contents .activities').css('height', ch);
	$('.footer').css('width', w);
}

$.fn.smartBackgroundImage = function(url, callerID){
	var t = this;
	//create an img so the browser will download the image:
	$('<img />')
	.attr('src', url)
	.load(function(){ //attach onload to set background-image
		t.each(function(){
			console.log(url + ' CARREGOU');
			// if(callerID){
			// 	switch(callerID){
			// 		case 'bg':
			// 			checkAndFadeIn(url);
			// 		break;
			// 		default:
			// 			null
			// 		break;
			// 	}
			// }
			$(this).css('backgroundImage', 'url('+url+')' );
		});
	});
	return this;
}