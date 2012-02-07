function InterfaceManager(){
	
}

InterfaceManager.prototype.init = function(vars){
	this.drawHeader();
	this.drawContents();
	this.drawFooter();
	this.updateScreen();
	var context = this;
	$(window).resize($.proxy(this.updateScreen, context));
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
	$('body').append("<div class='timeline'></div>");
	$('body').append("<div class='timeline-now'></div>");
	$('body').append("<div class='contents'></div>");
	$('.contents').append("<div class='activities'></div>");
	
	//define os destaques
	this.defineDestaques();
	
	//seleciona um destaque
	this.sorteiaDestaque();
	var destaque = this.dataManager.destaqueSelecionado;
	
	//carrega o fundo
	$('.bg').addClass('bgcover');
	var imgName = destaque.imagens ? './img/content/' + destaque.imagens.split('\n')[0] : './img/interface/default-bg.png';
	var imgURL = encodeURI(imgName);
	$('.bg').smartBackgroundImage(imgURL, 'bg');
	
	//desenha a timeline
	this.drawTimeline();
	
	//desenha as atividades
	
}

InterfaceManager.prototype.drawTimeline = function(){
	//cria o HTML básico
	var timeline = this.dataManager.timeline.timeMarks;
	for(var i in timeline){
		var html = "<div class='line l" + i + "'><span><span class='bullet'>|</span>" + timeline[i].label.replace(/ /g, '&nbsp;') + "</span></div>";
		$('.timeline').append(html);
	}
	//atualiza a tela
	this.updateScreen();
}

InterfaceManager.prototype.resizeTimeline = function(){
	
}

InterfaceManager.prototype.defineDestaques = function(){
	var data = this.dataManager;
	data.destaques = [];
	
	//procura destaques editoriais
	for(var s in data.atividades){
		for(var a in data.atividades[s]){
			var obj = data.atividades[s][a];
			if(obj.visual == 'g'){
				data.destaques.push(obj);
			}
		}
	}
	
	//Se não tiver nenhum, procura por estrelas (todos os 5 estrelas, depois todos os 4, 3, 2, 1 e nenhuma).
	//Inclui todos com a maior pontuação encontrada. Ex: todos os 3 estrela, se não tiver nenhum 5 ou 4.
	if(data.destaques.length < 1){
		var encontreiCandidato = false;
		for(var e = 5; e >= 0; e--){
			for(var s in data.atividades){
				for(var a in data.atividades[s]){
					var obj = data.atividades[s][a];
					var nEstrelas = obj.estrelas ? obj.estrelas : 0;
					if(nEstrelas >= e){
						encontreiCandidato = true;
						data.destaques.push(obj);
					}
				}
			}
			if(encontreiCandidato){ break }
		}
	}
}

InterfaceManager.prototype.sorteiaDestaque = function(){
	var data = this.dataManager;
	data.indexDestaqueSelecionado = Math.floor(Math.random() * data.destaques.length);
	data.destaqueSelecionado = data.destaques[data.indexDestaqueSelecionado];
}

InterfaceManager.prototype.drawFooter = function(){
	//escreve o HTML básico
	$('body').append("<div class='footer'></div>");
	$('.footer').append("<div class='content-info'></div>");
	$('.footer').append("<div class='site-info'></div>");
	
	//preenche o site-info
	// –DEIXAR DINAMICO–
	// –TRATAR LINKS–
	$('.footer .site-info').html("<p><a href'#'>sobre</a> // <a href='#'>equipe</a> // <a href='#'>contato@calendariocultural.com.br</a> // <a href='#'>+55 (11) 9934.0987</a> // <a href='#'>home</a><img src='./img/interface/logo-h2r.png' alt='Logo h2r' /></p>");
	
	//preenche o content-info
	var destaque = this.dataManager.destaqueSelecionado;
	// –CONTINUAR–
}

InterfaceManager.prototype.updateScreen = function(){
	var w = $(window).width();
	var h = $(window).height();
	var ct = $('.header').height(); // contents top
	var ch = h - $('.header').height() - $('.footer').height(); // contents height
	
	//ajusta a estrutura principal da página
	$('.bg').css('width', w);
	$('.bg').css('height', h);
	$('.contents').css('width', w);
	$('.contents').css('height', ch);
	$('.contents').css('top', ct);
	// $('.contents .activities').css('width', w);
	// $('.contents .activities').css('height', ch);
	$('.footer').css('width', w);
	
	//ajusta a altura das linhas da timeline
	$('.line').css('height', h);
	
	//ajusta a posição x das timeMarks
	var safeMargin = 30;
	var timeline = this.dataManager.timeline.timeMarks;
	for(var i in timeline){
		//define
		var str = '.line.l' + i;
		var element = $(str);
		var tw = Math.max(960, w);
		var step = ((tw - (2*safeMargin))/timeline.length);
		var position = Math.floor(safeMargin + i * step + (step/2));
		//armazena
		// timeline[i].position = position;
		//aplica
		element.css('left', position);
	}
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