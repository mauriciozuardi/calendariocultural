function InterfaceManager(){
	
}

InterfaceManager.prototype.init = function(vars){
	//escreve o HTML
	this.drawHeader();
}

InterfaceManager.prototype.drawHeader = function(){
	$('body').append("<div class='header'></div>");
	
	var html = "";
	html += "<img src='./img/content/logo-agenda-de-fotografia.png' />";
	html += this.drawPullDowns();
	$('.header').html(html);
}

InterfaceManager.prototype.drawPullDowns = function(){	
	var html = ""
	//desenha o quê
	html += "<select class='oque'><option>o quê</option></select>";
	//desenha onde
	html += "<select class='onde'><option>onde</option></select>";
	//desenha quem
	html += "<select class='quem'><option>quem</option></select>";
	return html;
}