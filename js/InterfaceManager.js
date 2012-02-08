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
	InterfaceManager.selectActivity(destaque);
	
	//carrega o fundo
	$('.bg').addClass('bgcover');
	var imgName = destaque.imagens ? './img/content/' + destaque.imagens.split('\n')[0] : './img/interface/default-bg.png';
	var imgURL = encodeURI(imgName);
	$('.bg').smartBackgroundImage(imgURL, 'bg');
	
	//desenha a timeline
	this.drawTimeline();
	
	//desenha as atividades
	this.drawActivities();
	
}

InterfaceManager.prototype.drawTimeline = function(){
	//cria o HTML básico
	var timeline = this.dataManager.timeline.timeMarks;
	for(var i in timeline){
		var html = "<div class='line l" + i + "'><span><span class='bullet'>|</span>" + timeline[i].label.replace(/ /g, '&nbsp;') + "</span></div>";
		$('.timeline').append(html);
	}
	
	//inclui a linha tracejada (now)
	$('.timeline-now').html("<div class='line t'></div>");
	
	//atualiza a tela
	this.updateScreen();
}

InterfaceManager.prototype.drawActivities = function(){
	var atividades = this.dataManager.atividades;
	//cria um array com todas as atividades (para poder ordenar)
	var sorted = [];
	for(var s in atividades){
		for(var a in atividades[s]){
			var obj = atividades[s][a];
			sorted.push(obj);
		}
	}
	
	//define como deve ordenar
	if(this.dataManager.currentSite.ordem && !this.dataManager.query){
		//se tem algo especificado no cadastro do site e não é um resultado de busca
		switch(this.dataManager.currentSite.ordem.toLowerCase()){
			case 'inversa':
				sorted.sort(InterfaceManager.ordemDataInicialAscendente);
			break;
			case 'alfabetica':
				sorted.sort(InterfaceManager.ordemAlfabeticaNome);
			break;
			case 'alfabética':
				sorted.sort(InterfaceManager.ordemAlfabeticaNome);
			break;
			default:
				console.log('ERRO: Ordem desconhecida. Usando ordem default.');
			break;
		}
	} else if(this.dataManager.query){
		//em páginas de busca, usar ordem inversa
		sorted.sort(InterfaceManager.ordemDataInicialAscendente);
	} else {
		//senão, default (data inicial)
		sorted.sort(InterfaceManager.ordemDataInicialDescendente);
	}
		
	//percorre o array criando o HTML
	for(var i in sorted){
		var a = sorted[i];
		a.idComposto = a.idSiteOriginal + '-' + a.id;
		var id = a.idComposto;
		var labelTxt = a.nome;
		var past = (a.datafinal.getTime() < Date.now() && this.dataManager.currentSite.passadorelevante == '0') ? " past" : "";
		
		//cria o DIV com id com a bolinha, range e label dentro
		var html = "<div data-id='" + id + "' class='event " + id + past +"'><span data-id='" + id + "' class='range'><span data-id='" + id + "' class='dot" + past + "'></span></span><span class='label'>" + labelTxt + "<img src='./img/interface/nano-balloon.gif' class='nano' /></span></div>";
		$('.activities').append(html);
		
		//aplica as classes baseado no status
		var p = $.proxy(InterfaceManager.updateHTMLClass, a); p(this.dataManager.timeline.timeMarks);
		
		//aplica os cliques
		var id = a.idSiteOriginal + '-' + a.id;
		var range = $('div.' + id + ' .range');
		var label = $('div.' + id + ' .label');
		range.click($.proxy(InterfaceManager.dotOrRangeClicked, a));
		label.click($.proxy(InterfaceManager.labelClicked, a));
	}
	
	//aplica o mouse over nos labels
	$('.label').mouseover(function(event){
		$(event.target).addClass('over');
	});
	
	$('.label').mouseout(function(event){
		$(event.target).removeClass('over');
	});
}

InterfaceManager.dotOrRangeClicked = function(event){
	//define o elemento do HTML
	var e = $(event.target);
	var id = this.idComposto;
	
	//altera o apontamento para dot se tiver clicado em range
	if(e.hasClass('range')){
		e = $('div.' + id + ' .dot');
		InterfaceManager.rangeClicked(e, this)
	} else {
		InterfaceManager.dotClicked(e, this);
	}
}

InterfaceManager.dotClicked = function(e, atividade){
	InterfaceManager.selectActivity(atividade);
	// mostraInfo();
}

InterfaceManager.rangeClicked = function(e, atividade){
	InterfaceManager.selectActivity(atividade);
	// mostraInfo();
}

InterfaceManager.selectActivity = function(atividade){
	var atividades = atividade.context.dataManager.atividades;
	//percorre todas as atividades procurando a atividade que veio como parâmetro
	for(var s in atividades){
		for(var a in atividades[s]){
			var obj = atividades[s][a];
			//se for a atividade que procuramos
			if(obj == atividade){
				//se tem só uma letra - ou seja, não estava previamente selecionado, selecione
				if(obj.visual.length == 1){
					obj.visual += 's';
					//atualiza o dataManager
					atividade.context.dataManager.atividadeSelecionada = atividade;
				}
			} else {	
				//tem mais que uma letra - estava selecionado - pega só a primeira (tira a seleção)
				if(obj.visual.length > 1){
					obj.visual = obj.visual.substr(0,1);
				}
			}
			//atualiza o visual
			var p = $.proxy(InterfaceManager.updateHTMLClass, obj);
			p(obj.context.dataManager.timeline.timeMarks);
		}
	}
}

InterfaceManager.updateHTMLClass = function(timeline){
	var id = this.idComposto;
	var div = $('div.' + id);
	var dot = $('div.' + id + ' .dot');
	var range = $('div.' + id + ' .range');
	var label = $('div.' + id + ' .label');
	// var ml = 0;
	
	switch (this.visual){
		//pequeno
		case "p":
			if(dot.hasClass('selected'))		dot.removeClass('selected');
			if(dot.hasClass('big'))					dot.removeClass('big');
			if(!range.hasClass('mini'))			range.addClass('mini');
			if(!label.hasClass('mini'))			label.addClass('mini');
		break;
		
		//pequeno e selecionado
		case "ps":
			if(!dot.hasClass('selected'))		dot.addClass('selected');
			if(dot.hasClass('big'))					dot.removeClass('big');
			if(!range.hasClass('mini'))			range.addClass('mini');
			if(!label.hasClass('mini'))			label.addClass('mini');
			// mudaFundo(this.id);
		break;
		
		//grande
		case "g":
			if(dot.hasClass('selected'))		dot.removeClass('selected');
			if(!dot.hasClass('big'))				dot.addClass('big');
			if(range.hasClass('mini'))			range.removeClass('mini');
			if(label.hasClass('mini'))			label.removeClass('mini');
		break;
		
		//grande e selecionado
		case "gs":
			if(!dot.hasClass('selected'))		dot.addClass('selected');
			if(!dot.hasClass('big'))				dot.addClass('big');
			if(range.hasClass('mini'))			range.removeClass('mini');
			if(label.hasClass('mini'))			label.removeClass('mini');
			// mudaFundo(this.id);
		break;
	}
	
	//posiciona
	var t = Date.now();
	var t0 = this.datainicial.getTime();
	var t1 = this.datafinal.getTime();
	
	var COMP_DOT_BIG = 5 - dot.outerWidth(false)/2;
	var COMP_DOT = 1;
	var FINE_TUNING = dot.hasClass('big') ? COMP_DOT_BIG : COMP_DOT;
	
	// //posiciona o começo do evento
	var x0 = InterfaceManager.timeToPosition(t0, timeline) + FINE_TUNING;
	div.css('margin-left', x0);
	
	//posiciona o fim do evento
	var x1 = InterfaceManager.timeToPosition(t1, timeline) + FINE_TUNING;
	
	var rangeEnd = x1-x0;
	var length = rangeEnd + dot.outerWidth(false);	//compensa o tamanho da bolinha
	range.css('width', length);
	
	//posiciona a bolinha, representando o progresso geral do evento
	t = (t < t0) ? t0 : t;
	t = (t > t1) ? t1 : t;
	var x = InterfaceManager.timeToPosition(t, timeline) + FINE_TUNING - x0;
	dot.css('margin-left', x);
	
	//posiciona o label
	var ml = parseInt(dot.css('margin-left')) + dot.outerWidth(false) + 7;
	//aplica
	label.css('margin-left', ml);
}

InterfaceManager.ordemDataInicialDescendente = function(a,b){
	return b.datainicial - a.datainicial;
}

InterfaceManager.ordemDataInicialAscendente = function(a,b){
	return a.datainicial - b.datainicial;
}

InterfaceManager.ordemAlfabeticaNome = function(a,b){
	var sA = DataManager.stringToSlug(a.nome);
	var sB = DataManager.stringToSlug(b.nome);
	if (sA < sB) {return -1}
	if (sA > sB) {return 1}
	return 0;
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
		timeline[i].position = position;
		//aplica
		element.css('left', position);
	}
	
	//ajusta a linha tracejada
	var position = InterfaceManager.timeToPosition(Date.now(), this.dataManager.timeline.timeMarks);
	$('.line.t').css('left', position);
}

InterfaceManager.timeToPosition = function(t, timeline){
	if(t > timeline[timeline.length-1].date.getTime()){
		//se t for maior que a última marca da timeline
		return $(window).width() + 50;
	} else if(t == timeline[timeline.length-1].date.getTime()){
			//se t for igual a ultima marca
			return timeline[timeline.length-1].position + 1;
	} else if(t < timeline[0].date.getTime()){
		//se t for menor que a primeira marca da timeline
		return -50;
	} else if(t == timeline[0].date.getTime()){
			//se t for igual a primeira marca da timeline
			return timeline[0].position + 1;
	} else {
		//t está entre alguma das marcas
		//identifica o intervalo
		var t0, t1, index;
		for(var i=0; i < timeline.length-1; i++){
			t0 = timeline[i].date.getTime();
			t1 = timeline[i+1].date.getTime();
			if(t >= t0 && t < t1){
				index = i;
				break;
			}
		}
		//posiciona t
		var x0 = timeline[index].position;
		var x1 = timeline[index+1].position - 1;
		var xRange = x1 - x0;
		var timeRange = t1 - t0;
		var t0a1 = (t-t0)/timeRange;
		var ml = x0 + (xRange * t0a1);
		//retorna
		return Math.round(ml);
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