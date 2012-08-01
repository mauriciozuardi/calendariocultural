<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"
   "http://www.w3.org/TR/html4/loose.dtd">

<html xmlns:fb="http://ogp.me/ns/fb#" lang="en">
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
	<title>Calendário Cultural</title>
	<meta http-equiv="X-UA-Compatible" content="chrome=1">
	
	<meta property="og:title" content="<?php echo $_REQUEST['t']; ?>" />
	<meta property="og:type" content="article" />
	<meta property="og:image" content="http://calendariocultural.com.br/img/<?php echo $_REQUEST['f']; ?>/<?php echo $_REQUEST['i']; ?>" />
	<meta property="og:site_name" content="CALENDARIO CULTURAL" />
	
	<link rel="stylesheet" href="css/normalize.css">
	<link rel="stylesheet" href="css/style.css">
	<script type="text/javascript" charset="utf-8" src="js/jquery-1.7.min.js"></script>
	<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/chrome-frame/1/CFInstall.min.js"></script>
	<script type="text/javascript" charset="utf-8" src="js/Markdown.Converter.js"></script>
	<script type="text/javascript" charset="utf-8" src="js/Timeline.js"></script>
	<script type="text/javascript" charset="utf-8" src="js/DataManager.js"></script>
	<script type="text/javascript" charset="utf-8" src="js/InterfaceManager.js"></script>
	<script type="text/javascript" charset="utf-8" src="js/script.js"></script>
	<script type="text/javascript" src="https://apis.google.com/js/client.js"></script>
	<script type="text/javascript" charset="utf-8">sId="<?php echo $_REQUEST['s']; ?>";query="<?php echo $_REQUEST['q']; ?>";when="<?php echo $_REQUEST['w']; ?>";mk="<?php echo $_REQUEST['m']; ?>";bi="<?php echo $_REQUEST['b']; ?>";</script>
</head>
<body>
  <style>
   /* 
    CSS rules to use for styling the overlay:
      .chromeFrameOverlayContent
      .chromeFrameOverlayContent iframe
      .chromeFrameOverlayCloseBar
      .chromeFrameOverlayUnderlay
   */
  </style> 
	<?php 
	// var_dump($_GET);
	// echo '<br />';
	// var_dump($_REQUEST);
	?>
	<!-- <div id="fb-root"></div>
	<script>(function(d, s, id) {
	  var js, fjs = d.getElementsByTagName(s)[0];
	  if (d.getElementById(id)) return;
	  js = d.createElement(s); js.id = id;
	  js.src = "//connect.facebook.net/pt_BR/all.js#xfbml=1";
	  fjs.parentNode.insertBefore(js, fjs);
	}(document, 'script', 'facebook-jssdk'));</script> -->
	<div id='spinner'></div>
</body>
</html>

