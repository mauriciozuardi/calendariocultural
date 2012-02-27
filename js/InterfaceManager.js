function InterfaceManager(){
	this.bgLoadControl = {}
	this.bgLoadControl.actualURL = "";
	this.bgLoadControl.URLtoShow = "";
}

InterfaceManager.prototype.init = function(){
	this.ballonVars ? null : this.ballonVars = {};
	this.ballonVars.showedBalloon = false;
	
	this.drawHeader();
	this.drawFooter();
	this.drawContents();
	this.updateScreen();
	
	var context = this;
	$(window).resize($.proxy(this.updateScreen, context));
	$(window).scroll($.proxy(this.updateScreen, context));
	
	//aplica controle fixos do balloon
	$('#slideshow-controls .previous').click($.proxy(this.prevSlideImg, context));
	$('#slideshow-controls .next').click($.proxy(this.nextSlideImg, context));
	
	this.updateScreen();
	
	//tentativa um pouco menos tosca de resolver o bug do content-info
	var laterUpdate = function(){
		im.updateScreen();
	}
	setTimeout(laterUpdate, 500);
	
	//força todos os links abrirem em blank
	$("a[href^='http:']").attr('target','_blank');
}

InterfaceManager.prototype.drawHeader = function(){
	//escreve o HTML
	$('body').append("<div class='header'></div>");
	var html = "";
	html += "<img src='./img/" + this.dataManager.currentSite.id + "/" + this.dataManager.currentSite.logo + "' />";
	html += this.drawPullDowns();
	// html += this.dataManager.query ? "<button type='submit' class='back'>voltar</button>" : "";
	html += this.dataManager.query ? "<a href='" + window.location.pathname + "'>home</a>" : "";
	
	$('.header').html(html);
	
	this.dataManager.query ? $('.quem').addClass('backButtonPresent') : null;
	
	var context = {}
	context.instance = this;
	var onPullDownChange = $.proxy(this.onPullDownChange, context);
	
	//aplica os controles
	$('.oque').change(onPullDownChange);
	$('.onde').change(onPullDownChange);
	$('.quem').change(onPullDownChange);
	$('.back').click(function(){
		history.go(-1);
	});
}

InterfaceManager.prototype.onPullDownChange = function(event){
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
		var newURL = window.location.search != '' ? window.location.href.toString().split(window.location.search)[0] : window.location.href;
		newURL += '?q=' + encodeURI(query);
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
	$('body').append(InterfaceManager.balloonStructure);
	$('body').append("<div class='scroller'></div>");
	$('body').append("<div class='bg'></div>");
	$('body').append("<div class='timeline'></div>");
	$('body').append("<div class='timeline-now'></div>");
	$('body').append("<div class='contents'></div>");
	$('.contents').append("<div class='activities'></div>");
	$('.bg').addClass('bgcover');
	
	//define os destaques
	this.defineDestaques();
	
	//seleciona um destaque
	this.sorteiaDestaque();
	InterfaceManager.selectActivity(this.dataManager.destaqueSelecionado);
	
	//abre um dos links do footer qdo abrir o site
	(this.dataManager.currentSite.footerlinkaberto && !this.dataManager.query) ? InterfaceManager.desenhaContentInfoFromFooter(this.dataManager.currentSite.footerlinkaberto) : null;
	
	//desenha a timeline
	this.drawTimeline();
	
	//desenha as atividades
	this.drawActivities();
}

InterfaceManager.balloonStructure = function(){
	return "<div id='balloon'><div id='balloon-tip' class='balloon tip'></div><div id='balloon-top' class='balloon top'></div><div id='balloon-body'><div id='slideshow-controls'><div class='previous'></div><div class='next'></div></div><div id='slideshow'></div><div id='mini-balloon'><div id='mini-ballon-tip' class='mini balloon tip'></div><div id='mini-balloon-body'></div></div><div id='mini-balloon-footer'><div id='twitter'></div><div id='facebook'></div><!-- <div id='opine'><p>Opine:</p><div id='estrelas-opine'><div class='estrela e1'></div><div class='estrela e2'></div><div class='estrela e3'></div><div class='estrela e4'></div><div class='estrela e5'></div></div></div> --></div><div id='cross'></div></div></div>";
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
	if(this.dataManager.currentSite.ordem){
		//se tem algo especificado no cadastro do site, tanto site qto busca listam da mma forma
		switch(this.dataManager.currentSite.ordem.toLowerCase()){
			case 'inversa':
				var siteSearch = InterfaceManager.ordemDataInicialAscendente;
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
	} else if(!this.dataManager.currentSite.ordem && this.dataManager.query){
		//em páginas de busca, usar ordem normal
		sorted.sort(InterfaceManager.ordemDataInicialDescendente);
	} else if(!this.dataManager.currentSite.ordem){
		//senão, default (data inicial)
		sorted.sort(InterfaceManager.ordemDataInicialDescendente);
	}
		
	//percorre o array criando o HTML
	for(var i in sorted){
		var a = sorted[i];
		a.idComposto = a.idSiteOriginal + '-' + a.id;
		var id = a.idComposto;
		var labelTxt = a.nome;
		var past = a.isPast && !this.dataManager.query ? ' past' : '';
		var icon = a.subsite ? "<img src='./img/interface/nano-seta.gif' class='nano' />" : "<img src='./img/interface/nano-balloon.gif' class='nano' />";
		
		//cria o DIV com id com a bolinha, range e label dentro
		var html = "<div data-id='" + id + "' class='event " + id + past +"'><span data-id='" + id + "' class='range'><span data-id='" + id + "' class='dot" + past + "'></span></span><span class='label" + past + "'>" + labelTxt + icon + "</span></div>";
		$('.activities').append(html);
		
		//aplica as classes baseado no status
		var p = $.proxy(InterfaceManager.updateHTMLClass, a); p(this.dataManager.timeline.timeMarks, true);
		
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

InterfaceManager.labelClicked = function(event){
	InterfaceManager.selectActivity(this);
	InterfaceManager.fechaInfo();
	
	if(this.subsite){
		window.open(this.subsite, '_BLANK');
	} else {
		this.context.abreBalloon(this);
	}
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
	InterfaceManager.fechaBaloon();
	InterfaceManager.selectActivity(atividade);
	InterfaceManager.mostraInfo();
}

InterfaceManager.rangeClicked = function(e, atividade){
	InterfaceManager.fechaBaloon();
	InterfaceManager.selectActivity(atividade);
	InterfaceManager.mostraInfo();
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
			p(obj.context.dataManager.timeline.timeMarks, false);
		}
	}
}

InterfaceManager.updateHTMLClass = function(timeline, leaveBg){
	var id = this.idComposto;
	var div = $('div.' + id);
	var dot = $('div.' + id + ' .dot');
	var range = $('div.' + id + ' .range');
	var label = $('div.' + id + ' .label');
	
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
			leaveBg ? null : InterfaceManager.mudaFundo(this);
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
			leaveBg ? null : InterfaceManager.mudaFundo(this);
		break;
	}
	
	//posiciona
	InterfaceManager.posicionaAtividade(this, timeline);
}

InterfaceManager.posicionaAtividade = function(a, timeline){
	var id = a.idComposto;
	var div = $('div.' + id);
	var dot = $('div.' + id + ' .dot');
	var range = $('div.' + id + ' .range');
	var label = $('div.' + id + ' .label');
	var labelImg = $('div.' + id + ' .label img');
	
	var t = Date.now();
	var t0 = a.datainicial.getTime();
	var t1 = a.datafinal.getTime();
	
	var COMP_DOT_BIG = -12;
 	var COMP_DOT = -4;
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
	// var invertLabel = (Date.now() > a.datainicial.getTime() + (a.datafinal.getTime() - a.datainicial.getTime())/2) && !a.isPast ? true : false;
	// ml -= invertLabel ? label.outerWidth(false) - 13 : 0;
	//aplica
	label.css('margin-left', ml);
	// invertLabel ? labelImg.css('margin-left', dot.outerWidth(false) + 13) : null;
}

InterfaceManager.mudaFundo = function(a){
	//MUDA O BG
	var imgName = a.imagens ? './img/' + a.idSiteOriginal + '/' + a.imagens.split('\n')[0] : './img/interface/default-bg.png';
	var imgURL = encodeURI(imgName.replace(/ /g, "").replace(/\n/g, ""));
	a.context.carregaBg(imgURL);

	//MUDA O NOME E O TEXTO
	var nameParts = a.nome ? a.nome.split(' // ') : ['sem nome'];
	var sinopse = a.sobre ? InterfaceManager.autoSinopse(a.sobre) : '-';
	var credito = a.credito ? a.credito.split(', ')[0] : 'sem crédito';
	var remendo = "";
	var html = "<h1>" + nameParts[0];
	if(nameParts.length > 1){
		html += "<em> // " + nameParts[1] + "</em>";
		remendo = "style='opacity:.6'";
	}
	html += "</h1>";
	html += "<h2>&nbsp;</h2>";
	html += a.subsite ? "<img src='./img/interface/micro-seta.gif' " + remendo + " />" : "<img src='./img/interface/micro-balloon.png' " + remendo + "/>";
	// html += "<image class='icon' src='./img/interface/micro-balloon.png'" + remendo + "/>";
	html += "<image class='fechar' src='./img/interface/fechar.png'" + remendo + "/>";
	html += "<p>" + sinopse + "</p>";
	html += "<h4>" + credito + "</h4>";
	$('.content-info').html(html);
	
	//ativa os cliques da area de info
	$('.content-info h1').click(InterfaceManager.infoClicked);
	$('.content-info .icon').click(InterfaceManager.infoClicked);
	$('.content-info p').click(InterfaceManager.infoClicked);
	$('.content-info .fechar').click(InterfaceManager.fechaInfo);
	
	//força todos os links abrirem em blank
	$("a[href^='http:']").attr('target','_blank');
}
InterfaceManager.infoClicked = function(){
	InterfaceManager.fechaInfo();
	im.abreBalloon(im.dataManager.atividadeSelecionada);
}

InterfaceManager.fechaInfo = function(){
	$('.content-info').addClass('closed');
	im.updateScreen();
}

InterfaceManager.mostraInfo = function(){
	$('.content-info').removeClass('closed');
	im.updateScreen();
}

InterfaceManager.autoSinopse = function(bigText){
	//cropa o texto tentando não cortar frases no meio
	var PHRASE_SNAP_FACTOR = .2;
	var IDEAL_SINOPSE_CHAR_COUNT = 425;
	
	if(bigText.length < IDEAL_SINOPSE_CHAR_COUNT * (1 + PHRASE_SNAP_FACTOR)){
		return bigText;
	} else {
		var frases = bigText.split('. ');
		var novoTexto = "";
		var i = 0;
		//aumenta até estar dentro da faixa mínima
		while (novoTexto.length < IDEAL_SINOPSE_CHAR_COUNT * (1 - PHRASE_SNAP_FACTOR)){
			novoTexto += frases[i] + ". "; i++;
		}
		//confere se não passou da faixa máxima
		if(novoTexto.length > IDEAL_SINOPSE_CHAR_COUNT * (1 + PHRASE_SNAP_FACTOR)){
			novoTexto = novoTexto.substr(0, IDEAL_SINOPSE_CHAR_COUNT) + "...";
		}
		return novoTexto;
	}
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
	
	//procura os destaques que não estão no passado
	this.procuraDestaques();
	
	//se não encontrar, pega uns velhos mesmo ..
	if(data.destaques.length < 1){
		this.procuraDestaques(true);
	}
	
	//erro
	data.destaques.length < 1 ? console.log('ERRO: nenhum destaque viável') : null;
}

InterfaceManager.prototype.procuraDestaques = function(incluirPassado){
	var data = this.dataManager;
	incluirPassado = incluirPassado ? incluirPassado : false;
	
	//procura destaques editoriais
	for(var s in data.atividades){
		for(var a in data.atividades[s]){
			var obj = data.atividades[s][a];
			if(!incluirPassado && !obj.isPast && obj.visual == 'g'){
				data.destaques.push(obj);
			} else if(obj.visual == 'g' && incluirPassado){
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
					if(!incluirPassado && !obj.isPast && nEstrelas >= e){
						encontreiCandidato = true;
						data.destaques.push(obj);
					} else if(nEstrelas >= e && incluirPassado){
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
	var data = this.dataManager;
	var footer = data.currentSite.footer ? data.currentSite.footer : 'sobre // equipe // contato@calendariocultural.com.br // +55 (11) 9934.0987 // home';
	var html = "";
	
	//separa as partes do rodapé
	var separador = ' // ';
	footer = footer.split(separador);
	// console.log(footer);
	
	//procura por emails, telefones ou links externos. Não achou nada, verifica se é um link interno.
	for(var i in footer){
		var part = footer[i];
		if(part.substr(0,7) == 'http://'){
			//é link externo
			// console.log(InterfaceManager.txtToHTML(part));
			html += InterfaceManager.txtToHTML(part);
		} else if(part.substr(0,1) == '+'){
			//é telefone
			// console.log('tel:' + part.replace(/[ \(\)\.]/g, ''));
			html += "<a href='tel:" + part.replace(/[ \(\)\.]/g, '') + "'>" + part + "</a>";
		} else if(part.indexOf('@') != -1){
			//é email
			// console.log('mailto:' + part);
			html += "<a href='mailto:" + part + "'>" + part + "</a>";
		} else {
			if(data.currentSite.footercontent && data.currentSite.footercontent[part]){
				//é link interno
				// console.log('link interno: ' + part);
				html += "<span class='fake-link footer-info-link'>" + part + "</span>";
			} else if(part == 'home'){
				html += "<a href='" + window.location.pathname + "'>home</a>";
			} else {
				//não é link
				// console.log('texto: ' + part);
				html += part;
			}
		}
		html += separador;
	}
	
	html = html.substr(0, html.length - separador.length); //exclui o último separador
	html = "<p>" + html + "<img src='./img/interface/logo-h2r.png' /></p>";
	$('.footer .site-info').html(html);
	$('.footer-info-link').click(function(event){InterfaceManager.abreFooterInfoLink(event)})
}

InterfaceManager.abreFooterInfoLink = function(event){
	InterfaceManager.fechaBaloon();
	var titulo = $(event.target).text();
	InterfaceManager.desenhaContentInfoFromFooter(titulo);
}

InterfaceManager.desenhaContentInfoFromFooter = function(titulo){
	var conteudo = im.dataManager.currentSite.footercontent[titulo].replace(/\n/g, '<br />');
	
	var html = "";
	html += "<h1>" + titulo + "</h1>";
	html += "<h2>&nbsp;</h2>";
	// html += a.subsite ? "<img src='./img/interface/micro-seta.gif' " + remendo + " />" : "<img src='./img/interface/micro-balloon.png' " + remendo + "/>";
	html += "<image class='icon' src='./img/interface/micro-balloon.png' style='opacity:0'/>"
	html += "<image class='fechar' src='./img/interface/fechar.png'/>";
	html += "<p>" + conteudo + "</p>"
	html += "<h4> </h4>";
	
	$('.content-info').html(html);
	InterfaceManager.mostraInfo();
	im.updateScreen();
	
	//ativa os cliques da area de info
	// $('.content-info h1').click(InterfaceManager.infoClicked);
	// $('.content-info .icon').click(InterfaceManager.infoClicked);
	// $('.content-info p').click(InterfaceManager.infoClicked);
	$('.content-info .fechar').click(InterfaceManager.fechaInfo);
	
	//força todos os links abrirem em blank
	$("a[href^='http:']").attr('target','_blank');
}

InterfaceManager.prototype.updateScreen = function(){
	//ajusta os min-width em função do header
	var mw = 60 + $('.header img').width() + $('.oque').outerWidth(true) + $('.onde').outerWidth(true) + $('.quem').outerWidth(true);
	$('.header').css('min-width', mw);
	$('.bg').css('min-width', mw);
	$('.contents').css('min-width', mw);
	$('.timeline').css('min-width', mw);
	$('.timeline-now').css('min-width', mw);
	$('.contents .activities').css('min-width', mw);
	$('.content-info').css('min-width', mw);
	$('.footer').css('min-width', mw);	
	$('.footer .site-info').css('min-width', mw);
	
	var MARGIN_TOP = 55;
	var w = $(window).width();
	var h = $(window).height();
	var ct = $('.header').height() + MARGIN_TOP + $(window).scrollTop(); // contents top
	var ch = h - $('.header').height() - $('.footer').height() - MARGIN_TOP; // contents height
	
	var at = $('.header').height() + MARGIN_TOP;
	var ah = $('.contents .activities').height() + $('.footer').height();
	
	//ajusta a estrutura principal da página
	$('.bg').css('width', w);
	$('.bg').css('height', h);
	$('.contents').css('width', w);
	$('.contents').css('height', ch);
	$('.contents').css('top', ct);
	$('.footer').css('width', w);
	
	$('.scroller').css('width', w/2);
	$('.scroller').css('height', ah);
	$('.scroller').css('top', at);
	$('.contents .activities').css('top', -$(window).scrollTop());
	
	//ajusta a altura das linhas da timeline
	$('.line').css('height', h);
	
	//ajusta a posição x das timeMarks
	var safeMargin = 30;
	var timeline = this.dataManager.timeline.timeMarks;
	for(var i in timeline){
		//define
		var str = '.line.l' + i;
		var element = $(str);
		var tw = Math.max(mw, w);
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
	
	//reposiciona as atividades
	var atividades = this.dataManager.atividades;
	for(var s in atividades){
		for(var a in atividades[s]){
			var obj = atividades[s][a];
			InterfaceManager.posicionaAtividade(obj, timeline);
		}
	}
	
	//recentraliza o balloon
	var bt = Math.max((h - $('#balloon').height())/2, $('.header').height()+1);
	var bl = (w - $('#balloon').width())/2;
	$('#balloon').css('top', bt);
	$('#balloon').css('left', bl);
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

InterfaceManager.prototype.checkAndFadeIn = function(loadedURL){
	if(loadedURL == this.bgLoadControl.URLtoShow){
		//mostra
		$('.bg').fadeIn(500, function() {
		});
		this.bgLoadControl.actualURL = loadedURL;
	} else {
		//espera pq a outra já deve estar sendo carregada, usuário clicou mais rápido que o loading
	}
}

InterfaceManager.prototype.carregaBg = function(imgURL){
	if(this.bgLoadControl.actualURL != imgURL){
		this.bgLoadControl.URLtoShow = imgURL;
		$('.bg').fadeOut(500, function() {
			$('.bg').smartBackgroundImage(imgURL, 'bg');
		});
	}
}

$.fn.smartBackgroundImage = function(url, callerID){
	var t = this;
	//create an img so the browser will download the image:
	$('<img />')
	.attr('src', url)
	.load(function(){ //attach onload to set background-image
		t.each(function(){
			if(callerID){
				switch(callerID){
					case 'bg':
						im.checkAndFadeIn(url); // apelei, precisei usar o nome da instancia do InterfaceManager (im)
					break;
					default:
						null
					break;
				}
			}
			$(this).css('backgroundImage', 'url('+url+')' );
		});
	});
	return this;
}

InterfaceManager.prototype.abreBalloon = function(a, idOnde){
	var html;
			
	//BALLOON TOP
	var onde;
	!a.onde ? console.log(a.id + ' não tem onde cadastrado.') : !idOnde ? idOnde = a.onde.split(', ')[0] : "";	
	a.context.desenhaBalloonTop(a, idOnde);

	//SLIDESHOW
	html = "";
	var imgs = a.imagens ? a.imagens.split('\n') : ['default-img.png'];
	var creditos = a.credito ? a.credito.split(', ') : [''];
	var folder = a.imagens ? a.idSiteOriginal : 'interface';

	//escreve o HTML
	html += "<div id='slideshow-imgs'>";
	for(var i in imgs){
		if(imgs[i] != ''){
			var credito = (creditos.length == 1) ? creditos[0] : creditos[i];
			credito != '' ? credito = '<span>' + credito + '</span>' : null;
			html += "<div class='bgcover slideshow-img' style='background-image: url(./img/" + folder + "/" + encodeURI(imgs[i]) + ")'><h5>" + credito + "</h5></div>";
		} else {
			//remove as imagens fantasmas (\n a mais no cadastro)
			imgs.splice(i,1);
		}
	}
	html += "</div>";
	
	//atualiza as variáveis de controle do
	this.ballonVars.slideshow ? null : this.ballonVars.slideshow = {};
	this.ballonVars.slideshow.IMG_WIDTH = 324; //width
	this.ballonVars.slideshow.showingImgIndex = 0; //showing img index
	this.ballonVars.slideshow.nImgs = imgs.length; //n images
	this.updateSlideshowControls();
	$('#slideshow').html(html);

	//MINI-BALLOON - INFO DA ATIVIDADE
	var di = a.datainicial;
	var df = a.datafinal;
	var sobre = a.sobre ? a.sobre : '(cadastrar sinopse da atividade)';
	
	//procura links dentro do texto e escreve o HTML correto, tb substitui \n por <br />.
	sobre = InterfaceManager.txtToHTML(sobre);
	
	//inclui o form se existir
	(a.formtxt || a.formupload) ? sobre = InterfaceManager.insertForm(a, sobre) : null;

	html = "";
	html += "<h2>" + a.tipo + "</h2>";
	html += InterfaceManager.desenhaEstrelas(a.estrelas);
	html += "<h1>" + a.nome + "</h1>";
	html += a.horario ? "<p><b>" + a.horario + "</b></p>" : "<p><b>" + InterfaceManager.dataHelena(di, df) + "</b></p>"; 
	html += "<div id='sinopse'>";
	html += "<p>" + sobre + "</p>";
	html += "</div>";
	
	//vê se existe quem cadastrado na atividade e se ele existe na lista de pessoas
	var quem = a.quem ? a.quem.split(', ')[0] : null;
	if(quem){
		if(this.dataManager.pessoas[DataManager.stringToSlug(quem)]){
			quem = this.dataManager.pessoas[DataManager.stringToSlug(quem)];
		} else {
			console.log('WARNING: ' + quem.toUpperCase() + ' não existe.');
		}
	} else {
		console.log('WARNING: ' + a.id + ' não tem QUEM cadastrado.');
		quem = {};
	}
	
	//vê se o quem tem biografia
	if(quem.bio && this.dataManager.currentSite.esconderbio == '0'){
		html += "<div id='bio' class='hidden'></div>";
		html += "<p><span class='fake-link'>Biografia</span>";
		html += quem.site ?  " // <a href='" + quem.site + "' target='_BLANK'>" + quem.site.replace('http://', '') + "</a></p>" : "</p>";			
	} else {
		html += quem.site ? "<p><a href='" + quem.site + "' target='_BLANK'>" + quem.site.replace('http://', '') + "</a></p>" : "";
	}
	
	$('#mini-balloon-body').html(html);
	//Aplica click se existir bio
	var c = {}; c.context = this; c.quem = quem;
	quem.bio ? $('#mini-balloon-body .fake-link').click($.proxy(InterfaceManager.abreBio, c)) : null;
	
	//MINI-BALLOON-FOOTER
	html = "";
	html += "<div id='twitter'><img src='./img/interface/btn_tweet.png'/></div>";
	// html += "<div id='facebook'><img src='./img/interface/btn_like.png'/></div>";
	html += "<div id='facebook'><a name='fb_share'></a><script src='http://static.ak.fbcdn.net/connect.php/js/FB.Share' type='text/javascript'></script></div>";
	// html += "<a name='fb_share'></a><script src='http://static.ak.fbcdn.net/connect.php/js/FB.Share' type='text/javascript'></script>";
	// html += "<a name='fb_share' type='icon' share_url='http://calendariocultural.com.br/pensamentoereflexao'><script src='http://static.ak.fbcdn.net/connect.php/js/FB.Share' type='text/javascript'></script>";
	// html += "	<div id='opine'><p>Opine:</p><div id='estrelas-opine'><div class='estrela e1'></div><div class='estrela e2'></div><div class='estrela e3'></div><div class='estrela e4'></div><div class='estrela e5'></div></div></div>";
	
	$('#mini-balloon-footer').html(html);
	InterfaceManager.updateMiniBalloonFooter(true, (quem.bio ? true : false));
	$('#twitter').click(function(event){ InterfaceManager.abreSocial(event,'t', a);});
	// $('#facebook').click(function(event){InterfaceManager.abreSocial(event,'f', a);});
	
	//CROSS
	//reseta o HTML pré-existente (para o caso do balloon anterior ter preenchido o cross)
	$('#cross').html("");
	
	//descobre quem é a atividade principal (pai)
	var crossList = [];
	if(a.parent){
		var pai = this.dataManager.atividades[a.idSiteOriginal][a.parent];
	} else if(a.dependentes){
		var pai = a;
	}
	
	//inclui pai e filhos na lista de cross
	if(pai){
		crossList.push(pai);
		for(var i in pai.dependentes){
			crossList.push(pai.dependentes[i]);
		}		
	}
	
	//monta o cross
	if(crossList.length > 0){
		//ordena por datainicial
		crossList.sort(InterfaceManager.ordemDataInicialAscendente);
		for(var i in crossList){
			var atividade = crossList[i];
			var nameParts = atividade.nome.split(' // ');
			var img = atividade.imagens ? atividade.idSiteOriginal + '/' + atividade.imagens.split('\n')[0] : 'interface/default-img.png';
			
			//clareia si mesma
			var cssClass = atividade != a ? '' : ' selected';

			html = "";
			html += "<div id='cross-" + i + "' class='balloon cross" + cssClass + "' style='background-color:rgba(255,255,255,1)'>";
			html += "<div class='bgcover cross-img" + cssClass + "' style='background-image: url(./img/" + encodeURI(img) + ");'></div>";
			html += "<div class='reticencias" + cssClass + "' style='background-image: url(./img/interface/reticencias.png);'></div>";
			html += "<h2>" + atividade.tipo + "</h2>";
			html += "<h1>" + nameParts[0];
			html += nameParts[1] ? "<em> // " + nameParts[1] + "</em></h1>" : "</h1>";
			html += "</div>";
			$('#cross').append(html);
			
			// coloca o clique em todas, menos si mesma
			if(atividade != a){
				var str = "#cross-" + i;
				var c = {};
				c.context = this;
				c.a = atividade;
				var f = $.proxy(InterfaceManager.abreBalloonCross, c);
				$(str).click(f);
			}
		}
	}
	
	//mostra
	var callback = function(){
		im.ballonVars.showedBalloon = true;
	}
	
	var update = function(){
		this.updateScreen();
		$('#balloon').fadeIn(250, callback);
		// console.log('era: ' + this.ballonVars.showedBalloon);
		// var bt = $('#balloon').css('top') + $(window).scrollTop();
		// setTimeout(function(){$('#balloon').css('top', $(window).scrollTop());}, 1);
	}
	setTimeout($.proxy(update, this), 10);
	
	//força todos os links abrirem em blank
	$("a[href^='http:']").attr('target','_blank');
}

InterfaceManager.abreBalloonCross = function(){
	this.context.abreBalloon(this.a);
}

InterfaceManager.prototype.desenhaBalloonTopViaNome = function(a, nomeOnde){
	for(var i in this.dataManager.espacos){
		var e = this.dataManager.espacos[i];
		if(DataManager.stringToSlug(e.nome) == DataManager.stringToSlug(nomeOnde)){
			this.desenhaBalloonTop(a, e.id);
			break;
		}
	}
}

InterfaceManager.prototype.desenhaBalloonTop = function(a, idOnde){
	//confere se o onde selecionado existe
	if(!this.dataManager.espacos[idOnde]){
		console.log(idOnde + ' não existe.');
		return false;
	} else {
		var e = this.dataManager.espacos[idOnde];
	}
	
	var imgEspaco = e.imagem ? 'content/' + encodeURI(e.imagem.replace(/ /g, "").replace(/\n/g, "")) : 'interface/default-thumb.png';
	
	//confere se a atividade tem espaços cadastrados
	if(!a.onde){
		console.log(a + ' não tem espaços cadastrados.');
		return false;
	} else {
		var todosEspacosAtividade = a.onde.split(', ');
		var nomeEspaco = "";
	}
	
	//cria o pulldown se existir mais de um espaço cadastrado para a atividade
	if(todosEspacosAtividade.length > 1){
		var opcoes = "";
		for (var i in todosEspacosAtividade){
			opcoes += "<option>" + this.dataManager.espacos[todosEspacosAtividade[i]].nome + "</option>";
		}
		nomeEspaco += "<select class='todosEspacos'><option>+</option>" + opcoes + "</select>";
	}
	
	//tira a última '/' da url do site
	e.site ? (e.site.substr(e.site.length -1, e.site.length) == "/" ? e.site = e.site.substr(0, e.site.length -1) : null) : null;
	
	//cria o título com o nome do espaço, já com link
	nomeEspaco += e.site ? "<a href='" + e.site + "' target='_BLANK'>" + e.nome + "</a>" : e.nome;
	
	var nLinhas = 0;
	
	var linha1 = ""; //rua, bairro, cidade e mapa
	linha1 += e.mapa ? "<a href='" + e.mapa + "' target='_BLANK'>" : "";
	
	var partesEndereco = [];
	e.endereco ? partesEndereco.push(e.endereco) : null;
	e.bairro ? partesEndereco.push(e.bairro.split(', ')[0]) : null;
	e.cidade ? partesEndereco.push(e.cidade) : null;
	var separador = " // ";
	for(var i in partesEndereco){
		linha1 += partesEndereco[i] + separador;
	}
	linha1 = linha1.substr(0, linha1.length - separador.length); // capa o último separador
	linha1 += e.mapa ? "<img src='./img/interface/pin.gif' class='pin' /></a>" : "";
	linha1 != "" ? nLinhas ++ : null;
	
	
	var linha2 = ""; //fone, email e site
	if(e.fone){
		var fone = e.fone.replace(/\./g, ''); //exclui "."
		fone = fone.split(" "); //depois divide entre código de pais, área e telefone
		linha2 += "<a href='tel:+" + fone[0] + "-" + fone[1] + "-" + fone[2] + "'>" + e.fone + "</a>";
	}

	if(e.email){
		linha2 += e.fone && (e.email || e.site) ? separador : "";
		if(e.email.substr(0,7) == 'http://'){
			linha2 += "<a href='" + e.email + "' target='_BLANK'>contato</a>";
		} else {
			linha2 += "<a href='mailto:" + e.email + "' target='_BLANK'>" + e.email + "</a>";
		}
	}
	
	linha2 += ((e.fone || e.email) && e.site) ? separador : "";
	linha2 += e.site ? "<a href='" + e.site + "' target='_BLANK'>" + e.site.replace('http://', '') + "</a>" : "";
	linha2 != "" ? nLinhas ++ : null;
	
	var linha3 = ""; //horário de funcionamento (opcional?)
	linha3 += e.horario ? e.horario.replace(/\n/g, ' // ') : "";
	linha3 != "" ? nLinhas ++ : null;
	
	var html = "";
	html += "<div class='bgcover thumb-espaco' style='background-image: url(./img/" + encodeURI(imgEspaco) + ");'></div><img src='./img/interface/fechar.png' class='fechar'/>";
	html += "<div id='txt-block'><h1>" + nomeEspaco + "</h1><p class='first-p'>" + linha1 + "</p><p>" + linha2 + "</p>";
	html += "</p>" + linha3 + "</p>";
	html += "</div>";
	
	//escreve o HTML
	$('#balloon-top').html(html);
	
	//compensa o visual qdo tem só duas linhas
	if(nLinhas == 2){
		$('#balloon-top h1').css('margin-top', 18);
		$('#balloon-top .todosEspacos').css('margin-top', -2);
	}
	
	//aplica os cliques
	$('#balloon-top .fechar').click(InterfaceManager.fechaBaloon);
	var f = $.proxy(this.desenhaBalloonTopViaNome, this);
	$('.todosEspacos').change(function(){f(a, $(this).val());});
}

InterfaceManager.prototype.updateSlideshowControls = function(){
	if(this.ballonVars.slideshow.nImgs > 1){
		if(this.ballonVars.slideshow.showingImgIndex == 0){
			$('#slideshow-controls .next').css('display', 'block');
			$('#slideshow-controls .previous').css('display', 'none');
		} else if(this.ballonVars.slideshow.showingImgIndex == this.ballonVars.slideshow.nImgs-1){
			$('#slideshow-controls .next').css('display', 'none');
			$('#slideshow-controls .previous').css('display', 'block');
		} else {
			$('#slideshow-controls .next').css('display', 'block');
			$('#slideshow-controls .previous').css('display', 'block');	
		}
	} else {
		$('#slideshow-controls .next').css('display', 'none');
		$('#slideshow-controls .previous').css('display', 'none');
	}
}

InterfaceManager.desenhaEstrelas = function(nEstrelas){
	if(nEstrelas){
		var n = Math.round(parseFloat(nEstrelas));
		var str = "<div id='estrelas'>";
		for(var i=1; i<=5; i++){
			str += i <= n ? "<img src='./img/interface/estrela-amarela.png'/>" : "<img src='./img/interface/estrela-cinza.png'/>"
		}
		str += "</div>";
	} else {
		var str = "";
	}
	return str;
}

InterfaceManager.dataHelena = function(di, df){
	var str = "";
	// var semana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab" ];
	// var mesCurto = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
	var mesLongo = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
	var mesInicial = di.getMonth();
	var mesFinal = df.getMonth();
	var anoInicial = di.getFullYear();
	var anoFinal = df.getFullYear();
	var horaComZero = function(n){
		return (n<10) ? "0" + n : n;
	}

	if(anoInicial == anoFinal){
		if(mesInicial == mesFinal){
			//De 12 a 20 de Outubro
			str = "De " +horaComZero(di.getDate())+ " até " +horaComZero(df.getDate())+ " de " +mesLongo[mesInicial] + " de " + anoFinal;
		} else {
			//De 12 de Jan. a 15 de Out.
			str = "De " +horaComZero(di.getDate())+ " de " +mesLongo[mesInicial]+ " até " +horaComZero(df.getDate())+ " de " +mesLongo[mesFinal]+ " de " + anoFinal;
		}
	} else {
		//De 10 de Dez. 2011 a 15 Fev. 2012
		str = "De " +horaComZero(di.getDate())+ " de " +mesLongo[mesInicial]+ " " +anoInicial+ " até " +horaComZero(df.getDate())+ " de " +mesLongo[mesFinal]+ " de " + anoFinal;
	}
	return str;
}

InterfaceManager.prototype.nextSlideImg = function(){	
	if(this.ballonVars.slideshow.showingImgIndex < this.ballonVars.slideshow.nImgs-1){
		var element = $('#slideshow-imgs');
		var ml = parseInt(element.css('margin-left'));
		ml -= this.ballonVars.slideshow.IMG_WIDTH;
		element.css('margin-left', ml);
		this.ballonVars.slideshow.showingImgIndex ++;
		this.updateSlideshowControls();
	}
}

InterfaceManager.prototype.prevSlideImg = function(){
	if(this.ballonVars.slideshow.showingImgIndex > 0){
		var element = $('#slideshow-imgs');
		var ml = parseInt(element.css('margin-left'));
		ml += this.ballonVars.slideshow.IMG_WIDTH;
		element.css('margin-left', ml);
		this.ballonVars.slideshow.showingImgIndex --;
		this.updateSlideshowControls();
	}
}

InterfaceManager.txtToHTML = function(txt){
	// procura links num dos formatos abaixo:
	// http://mnmo.com.br
	// http://mnmo.com.br :: [clique aqui]
	// Sempre começando com 'http://'. A parte opcional, vai virar o label do link, sem os [].
	// 
	// var paragrafos = txt.split('\n');
	// var html = '';
	// 
	// for(var p in paragrafos){
	// 	var palavras = paragrafos[p].split(' ');
	// 
	// 	for(var i=0; i<palavras.length; i++){
	// 		var part = palavras[i];
	// 		if(part.substr(0,7) == 'http://'){
	// 
	// 			//é um link
	// 			var nextPart = palavras[i+1];
	// 			var labelStart = palavras[i+2];
	// 			
	// 			if(nextPart == '::' && labelStart.substr(0,1) == '[' && labelStart.substr(labelStart.length-1, 1) == ']'){
	// 				//tem custom label - de uma palavra só. Ex: [regulamento]
	// 				i += 2;
	// 				labelStart = labelStart.substr(1, labelStart.length-2); //tira os []
	// 				var link = part;
	// 				var ponto = '';
	// 				//confere se tem um ponto final colado no fim do link
	// 				if(link.substr(link.length - 1, 1) == '.'){
	// 					link = link.substr(0, link.length-1); //tira o ponto do link
	// 					ponto = '.'; //anota para incluir o ponto de volta no texto
	// 				}
	// 				html += "<a href='" + link + "' target='_BLANK'>" + labelStart + "</a>" + ponto + ' ';
	// 			} else if(nextPart == '::' && labelStart.substr(0,1) == '['){
	// 				//tem custom label - de mais de uma palavra. Ex: [clique aqui]
	// 				var skipNIndexes = 2;
	// 				//reconstrói o custom label
	// 				var label = labelStart + ' ';
	// 				for(var j = i+3; j < palavras.length; j++){
	// 					var labelEndCandidate = palavras[j];
	// 					console.log(labelEndCandidate);
	// 					if(labelEndCandidate.substr(labelEndCandidate.length-1, 1) == ']'){
	// 						label += labelEndCandidate;
	// 						var foundLabelEnd = true;
	// 						skipNIndexes ++;
	// 						break;
	// 					} else {
	// 						label += labelEndCandidate + ' ';
	// 					}
	// 					skipNIndexes ++;
	// 				}
	// 				if(foundLabelEnd){
	// 					i += skipNIndexes;
	// 					var label = label.substr(1, label.length-2); //tira os []
	// 					var link = part;
	// 					var ponto = '';
	// 					//confere se tem um ponto final colado no fim do link
	// 					if(link.substr(link.length - 1, 1) == '.'){
	// 						link = link.substr(0, link.length-1); //tira o ponto do link
	// 						ponto = '.'; //anota para incluir o ponto de volta no texto
	// 					}
	// 					html += "<a href='" + link + "'>" + label + "</a>" + ponto + ' ';
	// 				} else {
	// 					console.log(['ERRO: Link mal-formatado no texto:', [txt]]);
	// 				}
	// 			} else {
	// 				//usa o próprio link como label
	// 				var link = part;
	// 				var ponto = '';
	// 				//confere se tem um ponto final colado no fim do link
	// 				if(link.substr(link.length - 1, 1) == '.'){
	// 					link = link.substr(0, link.length-1); //tira o ponto do link
	// 					ponto = '.'; //anota para incluir o ponto de volta no texto
	// 				}
	// 				var autoLabel = link.replace('http://', '');
	// 				html += "<a href='" + link + "'>" + autoLabel + "</a>" + ponto + ' ';
	// 			}
	// 		} else {
	// 			html += part + ' ';
	// 		}
	// 	}
	// 	
	// 	html = html.substr(0, html.length-1) + '\n'; //tira o último espaço, inclui uma quebra de linha
	// }
	// 
	// html = html.substr(0, html.length-1); //tira a última quebra de linha
	// 
	// //substitui as quebras de linha por br
	// html = html.replace(/\n/gi, '<br />');
	
	//FABRECIO
	// var re = /(http:\/\/|ftp:\/\/|https:\/\/|www\.|ftp\.[\w]+)([\w\-\.,@?^=%&amp;:\/~\+#]*[\w\-\@?^=%&amp;\/~\+#])/gi;
	// var result = txt.replace(re, '<a href="$1$2" >$1$2</a>')
	// return result;
	
	//MARKDOWN CONVERTER
	var converter = new Markdown.Converter().makeHtml;
	return converter(txt);
}

function iframeLoaded(element){
  var formResponse = element.contentDocument.getElementsByTagName('body')[0].innerHTML;
  if (formResponse == '') { return }
  if (formResponse == 'success') { 
    $('#submit_button').attr('disabled', "disabled");
    $('#submit_button').attr('value', 'Enviado com sucesso!');
  } else{
    alert('Erro no envio. Tente novamente mais tarde.');
  }
}

function validaForm(element){
  var missing_fields = [];
  $(element).find('input.required').each(function(index, item){
    if ($(item).attr('value') == ''){
      missing_fields.push($(item).prev().html());
    }
  });
  if (missing_fields.length > 0){
    alert('Os campos: '+missing_fields.join(', ')+' são obrigatórios.');
    return false;
  } else{
    return true;
  }
}

function labelEnviando(element){
  $(element).attr('value', 'Enviando...');
}

InterfaceManager.insertForm = function(a, sobre){
	var regEx = /\[INSERT-FORM-HERE\]/;
	var formTxt = "";
	var br = '<br />';
	// var txtField 					= "[txt field]";
	// var txtFieldMust 			= "[txt field obrigatorio]";
	// var uploadField 			= "[file upload field]";
	// var uploadFieldMust 	= "[file upload field obrigatorio]";
	// var botaoSubmit				= "[enviar]";
	// 
	// if(a.formtxt){
	// 	var arrFormTxt = a.formtxt.split(', ');
	// 	for(var i in arrFormTxt){
	// 		var ft = arrFormTxt[i];
	// 		ft.substr(0,1) == '*' ? formTxt += ft + br + txtFieldMust + br + br : formTxt += ft + br + txtField + br + br;
	// 	}		
	// }
	// 
	// if(a.formupload){
	// 	var arrFormUp = a.formupload.split(', ');
	// 	for(var i in arrFormUp){
	// 		var fu = arrFormUp[i];
	// 		fu.substr(0,1) == '*' ? formTxt += fu + br + uploadFieldMust + br + br : formTxt += fu + br + uploadField + br + br;
	// 	}
	// }
	// 
	// formTxt += botaoSubmit;
	
	var toVarName = function(s){
	  return s.toLowerCase()
	          .replace(/\*/ig,     '')
	          .replace(/[ -]/ig,  '_')
	          .replace(/[áãâ]/ig, 'a')
	          .replace(/[éê]/ig,  'e')
	          .replace(/[óõô]/ig, 'o')
	          .replace(/ç/ig,     'c')
	          .replace(/í/ig,     'i');
	}
	
	var generateFieldHTML = function(formid, field, type){
	  var is_required = field.charAt(0) == '*';
	  var field_name = toVarName(field);
	  var id = formid+'_'+field_name;
	  var classname = is_required ? 'class="required"' : '';
	  if (is_required) { field = field.substring(1, field.length);}
	  return  '  <label for="'+id+'"'+classname+'>'+field+"</label>\n" +
	          '  <input type="'+type+'" name="'+field_name+'" id="'+id+'" '+classname+' />'+"\n";
	}

	var generateForm = function(formid, formtxt, formupload, mailto){
	  var standard_fields = formtxt.split(', ');
	  var extra_fields = formupload.split(', ');
	  var email = mailto;
	  var form_html = '<form enctype="multipart/form-data" action="submit_form.php" method="POST" target="hiddenIframe" onsubmit="return validaForm(this);">'+"\n";
	  form_html +=    '  <input type="hidden" name="form_id" value="'+formid+'" />'+"\n";
	  form_html +=    '  <input type="hidden" name="notificar_email" value="'+email+'" />'+"\n";
	  $.each(standard_fields, function(index, field){
	    form_html += generateFieldHTML(formid, field, 'text');
	  });
	  $.each(extra_fields, function(index, field){
	    form_html += generateFieldHTML(formid, field, 'file');
	  });
	  form_html +=    '  <input type="submit" value="Enviar" id="submit_button" onclick="labelEnviando(this);"/>';
	  form_html +=    '</form><iframe name="hiddenIframe" id="hiddenIframe" style="display: none;" onload="iframeLoaded(this);"/>';
	  return form_html;
	}
	
	var formTxt = generateForm(a.idSiteOriginal + '-' + a.id, a.formtxt, a.formupload, a.mailto);
	// console.log(test);
	
	if(regEx.exec(sobre) == null){
		//se não encontrou o [INSERT-FORM-HERE] em nenhum lugar do texto, coloca no final;
		return sobre + br + br + formTxt;
	} else {
		return sobre.replace(regEx, formTxt);
	}
}

InterfaceManager.abreBio = function(){
	var divBio = $('#bio');
	var linkBio = $('#mini-balloon-body .fake-link');
	
	if(divBio.hasClass('hidden')){
		divBio.html('<p>//</p><p>' + InterfaceManager.txtToHTML(this.quem.bio) + '<p>');
		linkBio.html("Fechar Bio");
	} else {
		divBio.html("");
		linkBio.html("Biografia");
	}
	//
	$('#bio').toggleClass('hidden');
	InterfaceManager.updateMiniBalloonFooter();
}

InterfaceManager.updateMiniBalloonFooter = function(updateScreenToo, temBio){
	var updateSoon = function(){
		//reposiciona o footer
		var miniBalloonBodyHeight = $('#mini-balloon-body').outerHeight(false);
		var top = 20 + miniBalloonBodyHeight;
		$('#mini-balloon-footer').css('top', top);
		$('#mini-balloon-footer').addClass('show');

		//ajusta o tamanho mínimo do balloon
		var minHeight = $('#mini-balloon-footer').outerHeight(false) + top - 20;
		
		//GAMBI
		// im.currentSite.id == 's3' ? minHeight -= 10 : null;
		// (im.ballonVars.showedBalloon && temBio) ? null : minHeight += 20;
		
		//aplica
		$('#balloon-body').css('min-height', minHeight);
		updateScreenToo ? im.updateScreen() : null;
	}
	if(updateScreenToo){
		setTimeout(updateSoon, 20);	
	} else {
		updateSoon();
	}
}

InterfaceManager.abreSocial = function(event, serviceCode, a){
	switch(serviceCode){
		case 't':
			var baseURL = "http://twitter.com/home?status=";
		break;
		case 'f':
			var baseURL = "http://www.facebook.com/share.php?u=";
		break;
		default:
		break;
	}
	var actualURL = window.location.toString();
	var msg = a.nome + ' no Calendário Cultural. Recomendo: ' + actualURL;
	window.open(baseURL + encodeURI(msg), '_BLANK');
}


InterfaceManager.fechaBaloon = function(){
	$('#balloon').fadeOut(250);
}