function init(){
	page = new PageManager();
	page.wrapVars(['sId']);
	page.init();
	console.log(page);
}

$(init);