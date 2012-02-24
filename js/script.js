function init(){	
	// Chrome Frame check. Mostra para todos os IEs.
  CFInstall.check({
    mode: "overlay",
    preventInstallDetection: 'true'
  });

	//checa requisitos
	var version = parseInt(navigator.appVersion);
	if(!$.support.ajax || (navigator.appName == 'Netscape' && version < 5)){
		var shouldRedirect = confirm('Desculpe, mas para acessar nosso site é recomendado um navegador mais atual.\nGostaria de instalar o Google Chrome?');
		shouldRedirect ? window.location = 'https://www.google.com/chrome/' : history.go(-1);
	} else {
		console.log('Navegador ok. Versão:' + version);
	}

	//init
	im = new InterfaceManager();
	data = new DataManager(im);
	data.wrapUrlVars(['sId', 'query']);
	data.init();
}

$(init);