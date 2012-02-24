function init(){
	// Chrome Frame check.
  CFInstall.check({
    mode: "overlay",
    preventInstallDetection: 'true'
  });

	//init
	im = new InterfaceManager();
	data = new DataManager(im);
	data.wrapUrlVars(['sId', 'query']);
	data.init();
}

$(init);