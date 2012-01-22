function init(){
	page = new PageManager();
	page.wrapUrlVars(['sId', 'query']);
	page.init();
	console.log(page);
}

$(init);