function InterfaceManager(){
	this.bgLoadControl = {}
	this.bgLoadControl.actualURL = "";
	this.bgLoadControl.URLtoShow = "";
}

InterfaceManager.prototype.init = function(){
	$('#spinner').css('display', 'none');
	
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
	$('#balloon-seta-next').click($.proxy(this.nextActivity, context));
	$('#balloon-seta-prev').click($.proxy(this.prevActivity, context));
	$('#slideshow-controls .previous').click($.proxy(this.prevSlideImg, context));
	$('#slideshow-controls .next').click($.proxy(this.nextSlideImg, context));
	
	//abre o balloon se tiver algo na URL
	if(this.dataManager.balloonInfo){
		// console.log(this.dataManager.balloonInfo);
		
		var aBalloon = this.dataManager.atividades[this.dataManager.currentSite.id][this.dataManager.balloonInfo[0]];
		// aBalloon ? console.log(aBalloon) : console.log("atividade solicitada não carregada");
		
		var eBalloon = this.dataManager.espacos[this.dataManager.balloonInfo[1]];
		// eBalloon ? console.log(eBalloon) : console.log("espaço solicitado não existe");
		
		if(aBalloon && eBalloon){
			this.abreBalloon(aBalloon, eBalloon.id);
		}	else {
			console.log("ERRO: atividade e/ou espaço da URL não carregados")
		}	
	} else {
		console.log("sem balloon");
	}
	// InterfaceManager.prototype.abreBalloon = function(a, idOnde)
	
	this.updateScreen();
	
	//tentativa um pouco menos tosca de resolver o bug do content-info
	var laterUpdate = function(){
		im.updateScreen();
	}
	setTimeout(laterUpdate, 500);
	
	//força todos os links abrirem em blank
	$("a[href^='http:']").attr('target','_blank');
}

InterfaceManager.prototype.nextActivity = function(){
	var i = parseInt(this.dataManager.arrayAtividadesIndex);
	var arr = this.dataManager.arrayAtividades;
	var newIndex = i == arr.length-1 ? 0 : i+1;
	var a = arr[newIndex];
	// this.dataManager.arrayAtividadesIndex = newIndex;
	
	console.log([i+'>'+newIndex, arr.length, a]);
	InterfaceManager.selectActivity(a);
	InterfaceManager.fechaInfo();
	this.abreBalloon(a);
}

InterfaceManager.prototype.prevActivity = function(){
	var i = parseInt(this.dataManager.arrayAtividadesIndex);
	var arr = this.dataManager.arrayAtividades;
	var newIndex = i == 0 ? arr.length-1 : i-1;
	var a = arr[newIndex];
	// this.dataManager.arrayAtividadesIndex = newIndex;
	
	console.log([i+'>'+newIndex, arr.length, a]);
	InterfaceManager.selectActivity(a);
	InterfaceManager.fechaInfo();
	this.abreBalloon(a);
}

InterfaceManager.prototype.drawHeader = function(){
	//escreve o HTML
	$('body').append("<div class='header'></div>");
	var html = "";
	html += "<img src='./img/" + this.dataManager.currentSite.id + "/" + this.dataManager.currentSite.logo + "' />";
	html += this.drawPullDowns();
	// html += this.dataManager.query ? "<button type='submit' class='back'>voltar</button>" : "";
	html += this.dataManager.query || this.dataManager.when ? "<a href='" + window.location.pathname + "'>home</a>" : "";
	
	$('.header').html(html);
	
	this.dataManager.query || this.dataManager.when ? $('.quando').addClass('backButtonPresent') : null;
	
	var context = {}
	context.instance = this;
	var onPullDownChange = $.proxy(this.onPullDownChange, context);
	var onQuandoChange = $.proxy(this.onQuandoChange, context);
	
	//aplica os controles
	$('.oque').change(onPullDownChange);
	$('.onde').change(onPullDownChange);
	$('.quem').change(onPullDownChange);
	$('.quando').change(onQuandoChange);
	// $('.back').click(function(){
	// 	history.go(-1);
	// });
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
		// var newURL = window.location.search != '' ? window.location.href.toString().split(window.location.search)[0] : window.location.href;
		var newURL = window.location.pathname.toString();
		newURL += '?q=' + encodeURI(query);
		window.location = newURL;
	} else {
		window.location = window.location.pathname;
	}
}

InterfaceManager.prototype.onQuandoChange = function(event){
	var t = $(event.target);
	var v = t.val();
	var va = v.split(' ');
	var ano = va[1];
	var mesLongo = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
	for(var i in mesLongo){
		if(va[0] == mesLongo[i]){
			var mes = i;
			break;
		}
	}
	
	var proximoMes = mes == 11 ? 0 : parseInt(mes)+1;
	var anoDoProximoMes = mes == 11 ? parseInt(ano)+1 : ano;

	// console.log(proximoMes + ': ' + mesLongo[proximoMes]);
	// console.log(anoDoProximoMes);

	if(v != 'quando'){
		var dInicial = new Date (ano, mes, 1);
		var dTemp = new Date (anoDoProximoMes, proximoMes, 1);
		var dFinal = new Date (dTemp.getTime() - (24*60*60*1000));

		// console.log(dInicial);
		// console.log(dFinal);
	
		// var f = this.instance.dataManager.timeline.dateToDv(dInicial);	//first
		// var l = this.instance.dataManager.timeline.dateToDv(dFinal); 		//last
		
		// var newURL = window.location.search != '' ? window.location.href.toString().split(window.location.search)[0] : window.location.href;
		var newURL = window.location.pathname.toString();
		// newURL += '?w=' + encodeURI(f+','+l);
		newURL += '?w=' + encodeURI(dInicial.getTime() + ',' + dFinal.getTime());
		window.location = newURL;
	} else {
		window.location = window.location.pathname;
	}
}

InterfaceManager.prototype.drawPullDowns = function(){
	var q = this.dataManager.query;
	var html = ""
	//desenha o quê
	if(this.dataManager.pulldowns.oque._ordenado.length > 1 && !this.dataManager.currentSite.semoque){
		html += "<select class='oque'><option>o quê</option>";
		for(var i in this.dataManager.pulldowns.oque._ordenado){
			var label = this.dataManager.pulldowns.oque._ordenado[i].label;
			var selectedOrNot = q ? (DataManager.stringToSlug(q) == DataManager.stringToSlug(label) ? "<option selected='selected'>" : "<option>") : "<option>";
			html += selectedOrNot + label + "</option>";
		}
		html += "</select>";
	}
	//desenha onde
	if(this.dataManager.pulldowns.onde._ordenado.length > 1 && !this.dataManager.currentSite.semonde){
		html += "<select class='onde'><option>onde</option>";
		for(var i in this.dataManager.pulldowns.onde._ordenado){
			var label = this.dataManager.pulldowns.onde._ordenado[i].label;
			var selectedOrNot = q ? (q == this.dataManager.pulldowns.onde._ordenado[i].id ? "<option selected='selected'>" : "<option>") : "<option>";
			html += selectedOrNot + label + "</option>";
		}
		html += "</select>";
	}
	//desenha quem
	if(this.dataManager.pulldowns.quem._ordenado.length > 1 && !this.dataManager.currentSite.semquem){
		html += "<select class='quem'><option>quem</option>";
		for(var i in this.dataManager.pulldowns.quem._ordenado){
			var label = this.dataManager.pulldowns.quem._ordenado[i].label;
			var selectedOrNot = q ? (DataManager.stringToSlug(q) == DataManager.stringToSlug(label) ? "<option selected='selected'>" : "<option>") : "<option>";
			html += selectedOrNot + label + "</option>";
		}
		html += "</select>";
	}
	//desenha quando
	var w = this.dataManager.when;
	if(!this.dataManager.currentSite.semquando){
		html += "<select class='quando'><option>quando</option>";
		var currentDate = new Date();
		var mesLongo = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
		var mesInicial = currentDate.getMonth();
		var anoInicial = currentDate.getFullYear();
		var wDate = new Date (parseInt(w.split(',')[0]));
		for(var i=0; i<=12; i++){
			var nMes = mesInicial+i;
			if(nMes > 11){
				var a = anoInicial+1;
				nMes -= 12;
			} else {
				var a = anoInicial;
			}
			// html += "<option>" + mesLongo[nMes] + " " + a + "</option>";
			// console.log([wDate.getMonth(), nMes]);
			var selectedOrNot = w ? (wDate.getMonth() == nMes && wDate.getFullYear() == a ? "<option selected='selected'>" : "<option>") : "<option>";
			html += selectedOrNot + mesLongo[nMes] + " " + a + "</option>";	
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
	$('body').append("<div class='lens'></div>");
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
	
	//update no index da atividade selecionada
	this.dataManager.arrayAtividadesIndex = InterfaceManager.indexForMatch(this.dataManager.destaqueSelecionado, this.dataManager.arrayAtividades);
	// console.log(this.dataManager.arrayAtividadesIndex);
	
	//inclui a dica
	$('body').append("<div class='hint'></div>");
	$('.hint').hide();
	$('.hint').click(function(event){
		$('.hint').fadeOut(500);
	});
	
	var fadeMeIn = function(){
		$('.hint').fadeIn(500);
	}
	
	this.dataManager.query || this.dataManager.when ? null : setTimeout(fadeMeIn, 1000);
	
	//inclui social-tab
	if(this.dataManager.currentSite.id == 's3'){
		$('body').append("<div class='social-tag'></div>");
		$('.social-tag').append("<a href='http://estudiomadalena.tumblr.com/tagged/pensamentoereflexao' target='_BLANK'><img src='./img/interface/icn_estudio-madalena.png' class='first-icon'/></a>");
		$('.social-tag').append("<a href='http://www.flickr.com/photos/estudiomadalena/sets/72157629740476852/' target='_BLANK'><img src='./img/interface/icn_flickr.png' /></a>");
		$('.social-tag').append("<a href='https://www.facebook.com/events/345266855537771/' target='_BLANK'><img src='./img/interface/icn_facebook.png' /></a>");
		$('.social-tag').append("<a href='https://vimeo.com/album/1939699' target='_BLANK'><img src='./img/interface/icn_vimeo.png' /></a>");
	}
}

InterfaceManager.balloonStructure = function(){
	return "<div id='balloon'><div id='balloon-seta-next' class='balloon seta next'></div><div id='balloon-seta-prev' class='balloon seta prev'></div><div id='balloon-tip' class='balloon tip'></div><div id='balloon-top' class='balloon top'></div><div id='balloon-body'><div id='slideshow-controls'><div class='previous'></div><div class='next'></div></div><div id='slideshow'></div><div id='mini-balloon'><div id='mini-ballon-tip' class='mini balloon tip'></div><div id='mini-balloon-body'></div></div><div id='mini-balloon-footer'><div id='twitter'></div><div id='facebook'></div><!-- <div id='opine'><p>Opine:</p><div id='estrelas-opine'><div class='estrela e1'></div><div class='estrela e2'></div><div class='estrela e3'></div><div class='estrela e4'></div><div class='estrela e5'></div></div></div> --></div><div id='cross'></div></div></div>";
}

InterfaceManager.prototype.drawTimeline = function(){
	//cria o HTML básico
	var timeline = this.dataManager.timeline.timeMarks;
	for(var i in timeline){
		var html = "<div class='line l" + i + "'><span><span class='bullet'>|</span>" + timeline[i].label.replace(/ /g, '&nbsp;') + "</span></div>";
		$('.timeline').append(html);
	}
	
	//inclui a linha tracejada (now)
	$('.timeline-now').html("<div class='line t'><span><span class='bullet'>|</span>agora</span></div>");
	
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
	if(this.dataManager.query || this.dataManager.when){
		//em páginas de busca, usar ordem normal
		sorted.sort(InterfaceManager.ordemDataFinalDescendente);
	} else if(this.dataManager.currentSite.ordem){
		//se tem algo especificado no cadastro do site, tanto site qto busca listam da mma forma
		switch(this.dataManager.currentSite.ordem.toLowerCase()){
			case 'final-asc':
				var siteSearch = InterfaceManager.ordemDataFinalAscendente;
				sorted.sort(InterfaceManager.ordemDataFinalAscendente);
			break;
			case 'final-desc':
				var siteSearch = InterfaceManager.ordemDataFinalDescendente;
				sorted.sort(InterfaceManager.ordemDataFinalDescendente);
			break;
			case 'inicial-asc':
				var siteSearch = InterfaceManager.ordemDataInicialAscendente;
				sorted.sort(InterfaceManager.ordemDataInicialDescendente);
			break;
			case 'inicial-desc':
				var siteSearch = InterfaceManager.ordemDataInicialAscendente;
				sorted.sort(InterfaceManager.ordemDatainicialAscendente);
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
	} else {
		//senão, default (data inicial)
		sorted.sort(InterfaceManager.ordemDataFinalAscendente);
	}
	
	//anota a lista de atividades
	this.dataManager.arrayAtividades = $.extend(true, [], sorted);
	this.dataManager.arrayAtividadesIndex = InterfaceManager.indexForMatch(this.dataManager.atividadeSelecionada, this.dataManager.arrayAtividades);
	// console.log(this.dataManager.arrayAtividades[this.dataManager.arrayAtividadesIndex]);
		
	//percorre o array criando o HTML
	for(var i in sorted){
		var a = sorted[i];
		a.idComposto = a.idSiteOriginal + '-' + a.id;
		var id = a.idComposto;
		var labelTxt = a.nome;
		var past = a.isPast && !this.dataManager.query ? ' past' : '';
		var dataIncerta = a.dataincerta ? ' notSure' : '';
		var icon = a.subsite ? "<img src='./img/interface/nano-seta.gif' class='nano' />" : "<img src='./img/interface/nano-balloon.gif' class='nano' />";
		var bg = a.visual == 'g' ? 'style=background-image:url(./img/'+a.idSiteOriginal+'/'+a.imagens.split('\n')[0]+');' : '';
		
		//cria o DIV com id com a bolinha, range e label dentro
		var html = "<div data-id='" + id + "' class='event " + id + past +"'><span data-id='" + id + "' class='range" + dataIncerta + "'><span data-id='" + id + "' class='dot" + past + "'" + bg + "></span></span><span class='label" + past + "'>" + labelTxt + icon + "</span></div>";
		$('.activities').append(html);
		
		//aplica as classes baseado no status
		var p = $.proxy(InterfaceManager.updateHTMLClass, a); p(this.dataManager.timeline.timeMarks, true);
		
		//aplica os cliques
		var id = a.idSiteOriginal + '-' + a.id;
		var range = $('div.' + id + ' .range');
		var label = $('div.' + id + ' .label');
		// range.click($.proxy(InterfaceManager.dotOrRangeClicked, a));
		range.click($.proxy(InterfaceManager.labelClicked, a));
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

InterfaceManager.indexForMatch = function(arrElement, array){
	for(var i in array){
		var e = array[i];
		if(e.id == arrElement.id && e.idSiteOriginal == arrElement.idSiteOriginal){
			return i;
		}
	}
	return -1;
}

InterfaceManager.labelClicked = function(event){
	InterfaceManager.selectActivity(this);
	InterfaceManager.fechaInfo();
	
	if(this.subsite){
		this.context.dataManager.when ? history.go(-1) : window.open(this.subsite, '_BLANK');
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
			if(obj.id == atividade.id && obj.idSiteOriginal == atividade.idSiteOriginal){
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
	
	//atualiza o index da atividade selecionada
	var i = InterfaceManager.indexForMatch(atividade, im.dataManager.arrayAtividades);
	i != -1 ? im.dataManager.arrayAtividadesIndex = i : null;
	// console.log(im.dataManager.arrayAtividadesIndex);
}

InterfaceManager.updateHTMLClass = function(timeline, leaveBg){
	var id = this.idComposto;
	var div = $('div.' + id);
	var dot = $('div.' + id + ' .dot');
	var range = $('div.' + id + ' .range');
	var label = $('div.' + id + ' .label');
	
	// console.log(this);
	
	switch (this.visual){
		//pequeno
		case "p":
			if(dot.hasClass('selected'))		dot.removeClass('selected');
			if(!dot.hasClass('big'))				dot.addClass('big');
			if(dot.hasClass('thumb'))				dot.removeClass('thumb');
			if(label.hasClass('thumb'))			label.removeClass('thumb');
			if(range.hasClass('thumb'))			range.removeClass('thumb');
		break;
		
		//pequeno e selecionado
		case "ps":
			if(!dot.hasClass('selected'))		dot.addClass('selected');
			if(!dot.hasClass('big'))				dot.addClass('big');
			if(dot.hasClass('thumb'))				dot.removeClass('thumb');
			if(label.hasClass('thumb'))			label.removeClass('thumb');
			if(range.hasClass('thumb'))			range.removeClass('thumb');
			leaveBg ? null : InterfaceManager.mudaFundo(this);
		break;
		
		//grande
		case "g":
			if(dot.hasClass('selected'))		dot.removeClass('selected');
			if(!dot.hasClass('big'))				dot.addClass('big');
			if(!dot.hasClass('thumb'))			dot.addClass('thumb');
			if(!label.hasClass('thumb'))		label.addClass('thumb');
			if(!range.hasClass('thumb'))		range.addClass('thumb');
			var imgPath = this.tipo == 'participante' ? 'content' : this.idSiteOriginal;
			dot.css('background-image', 'url(./img/'+imgPath+'/'+this.imagens.split('\n')[0]+')');
		break;
		
		//grande e selecionado
		case "gs":
			if(!dot.hasClass('selected'))		dot.addClass('selected');
			if(!dot.hasClass('big'))				dot.addClass('big');
			if(!dot.hasClass('thumb'))			dot.addClass('thumb');
			if(!label.hasClass('thumb'))		label.addClass('thumb');
			if(!range.hasClass('thumb'))		range.addClass('thumb');
			leaveBg ? null : InterfaceManager.mudaFundo(this);
			dot.css('background-image', 'none');
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
	FINE_TUNING += dot.hasClass('thumb') ? -31 : 0;
	
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
	var x = InterfaceManager.timeToPosition(t, timeline, true) + FINE_TUNING - x0;
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
	var credito = a.credito ? a.credito.split('\n')[0] : 'arquivo pessoal';
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
	// im.abreBalloon(im.dataManager.atividadeSelecionada);
	if(im.dataManager.atividadeSelecionada.subsite){
		im.dataManager.when ? history.go(-1) : window.open(im.dataManager.atividadeSelecionada.subsite, '_BLANK');
	} else {
		im.abreBalloon(im.dataManager.atividadeSelecionada);
	}
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
			// novoTexto = novoTexto.substr(0, IDEAL_SINOPSE_CHAR_COUNT) + "[...]";
			novoTexto = novoTexto.substr(0, IDEAL_SINOPSE_CHAR_COUNT);
		}
		
		novoTexto += novoTexto.substr(novoTexto.length -1, 1) == " " ? "[...]" : " [...]";
		return novoTexto;
	}
}

InterfaceManager.ordemDataFinalDescendente = function(a,b){
	return b.datafinal - a.datafinal;
}

InterfaceManager.ordemDataFinalAscendente = function(a,b){
	return a.datafinal - b.datafinal;
}

InterfaceManager.ordemDataInicialDescendente = function(a,b){
	return b.datainicial - a.datainicial;
}

InterfaceManager.ordemDatainicialAscendente = function(a,b){
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
	var mw = 60 + $('.header img').width() + $('.oque').outerWidth(true) + $('.onde').outerWidth(true) + $('.quem').outerWidth(true) + $('.quando').outerWidth(true) + (this.dataManager.query || this.dataManager.when ? 30 : 0);
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
	ch += $('.content-info').hasClass('closed') ? 0 : 12;
	
	var at = $('.header').height() + MARGIN_TOP;
	// var ah = $('.contents .activities').height() + $('.footer').height();
	var ah = Math.max($('.activities').height() + $('.footer').height(), $('#balloon').height());
	
	
	//ajusta a estrutura principal da página
	$('.bg').css('width', w);
	$('.bg').css('height', h);
	$('.lens').css('width', w);
	$('.lens').css('height', h);
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
	
	//ajusta o balloon na vertical
	var bh = $('#balloon').height();
	var HH = $('.header').height();
	var fh = $('.footer').height();
	var st = $(window).scrollTop();	
	var uh = h - HH - fh - MARGIN_TOP;
	var bt = 0;
	var ah = $('.activities').height();
	var MAX_ST = ah - uh;
	var scrollZeroAUm = st/MAX_ST;
	var EXCESSO = bh-uh;
	bt += st - (scrollZeroAUm * (EXCESSO - MARGIN_TOP + 1));
	bh > ah ? bt = 0 : null;
	bt += HH + 1 // minimo
	$('#balloon').css('top', bt);
	
	
	//ajusta o balloon na horizontal
	var bl = (w - $('#balloon').width())/2;
	$('#balloon').css('left', bl);
}

InterfaceManager.timeToPosition = function(t, timeline, mustFit){
	if(t > timeline[timeline.length-1].date.getTime()){
		//se t for maior que a última marca da timeline
		// return $(window).width() + 50;
		return mustFit ? timeline[timeline.length-1].position : $(window).width() + 50;
	} else if(t == timeline[timeline.length-1].date.getTime()){
			//se t for igual a ultima marca
			// return timeline[timeline.length-1].position + 1;
			return timeline[timeline.length-1].position - 1;
	} else if(t < timeline[0].date.getTime()){
		//se t for menor que a primeira marca da timeline
		// return -50;
		return mustFit ? timeline[0].position : -50;
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
		$('.bg').fadeIn(500, function(){
			$('.lens').fadeIn(2000, function(){});
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
			$('.lens').fadeOut(500, function() {
				im.updateLens();
			});
		});
	}
}

InterfaceManager.prototype.updateLens = function(){
	if(this.dataManager.atividadeSelecionada.lens){
		var parts = this.dataManager.atividadeSelecionada.lens.split(', ');
		if(parts.length == 1){
			var A = parseInt(parts[0])/100;
			$('.lens').css('background-color', 'rgba(0,0,0,'+A+')');			
		} else if(parts.length == 2){
			var R = parseInt((parts[1]).substring(0,2),16);
			var G = parseInt((parts[1]).substring(2,4),16);
			var B = parseInt((parts[1]).substring(4,6),16);
			var A = parseInt(parts[0])/100;
			$('.lens').css('background-color', 'rgba('+R+','+G+','+B+','+A+')');
		}
	} else {
		$('.lens').css('background-color', 'rgba(0,0,0,.7)');
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
	var creditos = a.credito ? a.credito.split('\n') : ['arquivo pessoal'];
	var folder = a.imagens ? a.tipo == 'participante' ? 'content' : a.idSiteOriginal : 'interface';
	
	//Ajusta URL
	var addToURL = "?b=" + a.id + "|" + idOnde;
	addToURL += "&t=" + encodeURI("Calendario Cultural Fotografia :: " + a.nome);
	addToURL += "&f=" + folder;
	addToURL += "&i=" + encodeURI(imgs[0]);
	history.pushState(null, null, addToURL);

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
	var quem = a.quem ? a.quem.split('\n')[0] : null;
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
	
	var todosQuem = a.quem ? a.quem.split('\n') : null;
	var funnyTxt = "Saiba muito + ";
		
	//vê se o quem tem biografia
	if(quem.bio && this.dataManager.currentSite.esconderbio == '0' && todosQuem && todosQuem.length <= 2){
		html += "<div id='bio' class='hidden'></div>";
		html += "<p>";
		//inclui o site da atividade, se existir
		html += a.site ? "<a href='" + a.site + "' target='_BLANK'>" + funnyTxt + a.site.replace('http://', '') + "</a>" : "";
		var separador = a.site ? ' // ' : '';
		html += todosQuem.length == 1 ? separador + "<span class='fake-link'>Biografia</span>&nbsp;" : separador + "<span class='fake-link'>Biografias</span>";		
	} else {
		html += "<p>";
		//inclui o site da atividade, se existir
		html += a.site ? "<a href='" + a.site + "' target='_BLANK'>" + funnyTxt + a.site.replace('http://', '') + "</a>"  : "";
	}
	
	var separador = a.site || a.bio ? ' // ' : '';
	html += quem.site ? separador + "<a href='" + quem.site + "' target='_BLANK'>" + quem.site.replace('http://', '') + "</a>" : "";
	
	html += "</p>";
	
	//mostra todos os quem se tiver mais de 2 cadastrados
	if(todosQuem && todosQuem.length > 2){
		html += "<p><b>Quem</b><br />";
		for(var i in todosQuem){
			var q = todosQuem[i];
			html += q + "<br />";
		}
		html += "</p>";
	}
	
	$('#mini-balloon-body').html(html);
	//Aplica click se existir bio
	var c = {}; c.context = this; c.quem = quem; c.todosQuem = todosQuem;
	quem.bio ? $('#mini-balloon-body .fake-link').click($.proxy(InterfaceManager.abreBio, c)) : null;
	
	//MINI-BALLOON-FOOTER
	html = "";
	
	html += "<div id='twitter'><img src='./img/interface/btn_tweet.png'/></div>";
	
	//iFrame Facebook
	html += "<iframe id='facebook'  src='//www.facebook.com/plugins/like.php?href=" + location.toString() + "&amp;send=false&amp;layout=button_count&amp;width=450&amp;show_faces=false&amp;action=like&amp;colorscheme=light&amp;font=lucida+grande&amp;height=21' scrolling='no' frameborder='0' style='border:none; overflow:hidden; width:450px; height:21px;' allowTransparency='true'></iframe>";
	
	// html += "<div id='facebook'><a name='fb_share' share_url='" + location.toString() + "'></a><script src='http://static.ak.fbcdn.net/connect.php/js/FB.Share' type='text/javascript'></script></div>";
	
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
		crossList.sort(InterfaceManager.ordemDataFinalAscendente);
		for(var i in crossList){
			var atividade = crossList[i];
			var nameParts = atividade.nome.split(' // ');
			var imgPath = atividade.tipo == 'participante' ? 'content' : atividade.idSiteOriginal;
			var img = atividade.imagens ? imgPath + '/' + atividade.imagens.split('\n')[0] : 'interface/default-img.png';
			
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
		//ajusta altura das setas
		var bt = Math.max(126, $('#txt-block').height() + 30);
		$('.balloon.seta').css('top', bt);
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
	this.a.onde ? this.context.abreBalloon(this.a, this.a.onde) : this.context.abreBalloon(this.a);
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
	
	//AUTO GOOGLE MAPS
	if(e.endereco){
		var enderecoGmaps = '';
		enderecoGmaps += e.endereco;
		enderecoGmaps += e.complemento ? ', ' + e.complemento : '';
		enderecoGmaps += e.cidade ? ', ' + e.cidade : '';
		enderecoGmaps += e.estado ? ', ' + e.estado : '';
		enderecoGmaps += e.pais ? ', ' + e.pais : '';
		var autoGmapsLink = 'http://maps.google.com?q=' + encodeURI(enderecoGmaps);
		// console.log(autoGmapsLink);
		var htmlGmaps = "<a href='" + autoGmapsLink + "' target='_BLANK'>";
	} else {
		console.log('WARNING: ' + a.id + 'não tem endereço cadastrado.');
		var htmlGmaps = "";
	}
	// linha1 += e.mapa ? "<a href='" + e.mapa + "' target='_BLANK'>" : "";
	linha1 += e.mapa ? "<a href='" + e.mapa + "' target='_BLANK'>" : htmlGmaps;
	
	var partesEndereco = [];
	var enderecoComplementado = '';
	enderecoComplementado += e.endereco ? e.endereco : '';
	enderecoComplementado += e.complemento ? ' ' + e.complemento : '';
	e.endereco ? partesEndereco.push(enderecoComplementado) : null;
	e.bairro ? partesEndereco.push(e.bairro.split(', ')[0]) : null;
	e.cidade ? partesEndereco.push(e.cidade) : null;
	e.estado ? partesEndereco.push(e.estado) : null;
	e.pais ? partesEndereco.push(e.pais) : null;
	e.cep ? partesEndereco.push(e.cep) : null;
	var separador = " // ";
	for(var i in partesEndereco){
		linha1 += partesEndereco[i] + separador;
	}
	linha1 = linha1.substr(0, linha1.length - separador.length); // capa o último separador
	linha1 += e.mapa || e.endereco ? "<img src='./img/interface/pin.gif' class='pin' /></a>" : "";
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
	
	//trata o link do site
	if(e.site){
		//tira a última barra do site
		e.site.substr(e.site.length -1, e.site.length) == "/" ? e.site = e.site.substr(0, e.site.length -1) : null
		//inclui o http:// se não tiver
		e.site.substr(0,7) == 'http://' ? null : e.site = 'http://' + e.site;
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
	$('#slideshow-controls .next').removeClass('first');
	if(this.ballonVars.slideshow.nImgs > 1){
		if(this.ballonVars.slideshow.showingImgIndex == 0){
			$('#slideshow-controls .next').css('display', 'block');
			$('#slideshow-controls .next').addClass('first');
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
	var html = "";
	
	if(divBio.hasClass('hidden')){
		//se prepara para mostrar 1 ou 2 quem (limite definido na abreBalloon)
		for(var i in this.todosQuem){
			var nome = this.todosQuem[i];
			if(im.dataManager.pessoas[DataManager.stringToSlug(nome)]){
				var q = im.dataManager.pessoas[DataManager.stringToSlug(nome)];
				if(q.nome && q.bio){
					html += '<p><b>// ' + q.nome + '</b></p><p>' + InterfaceManager.txtToHTML(q.bio) + '<p>';				
				}
			} else {
				console.log('WARNING: ' + nome + ' NÃO está cadastrado na lista de pessoas.');
			}
		}
		
		// divBio.html('<p>//' + this.quem.nome + '</p><p>' + InterfaceManager.txtToHTML(this.quem.bio) + '<p>');
		divBio.html(html);
		var labelFecharBio = this.todosQuem.length == 1 ? 'Fechar Biografia' : 'Fechar Biografias';
		linkBio.html(labelFecharBio);
	} else {
		divBio.html(html);
		var labelBio = this.todosQuem.length == 1 ? 'Biografia' : 'Biografias';
		linkBio.html(labelBio);
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
	var url = window.location.pathname.toString();
	history.pushState(null, null, url);
}