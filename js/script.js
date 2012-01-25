function init(){
	im = new InterfaceManager();
	data = new DataManager(im);
	data.wrapUrlVars(['sId', 'query']);
	data.init();
}

$(init);