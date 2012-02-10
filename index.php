<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"
   "http://www.w3.org/TR/html4/loose.dtd">

<html lang="en">
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
	<title>Calendário Cultural</title>
	<meta name="generator" content="TextMate http://macromates.com/">
	<meta name="author" content="Mauricio Zuardi">
	<link rel="stylesheet" href="css/normalize.css">
	<link rel="stylesheet" href="css/style.css">
	<script type="text/javascript" charset="utf-8" src="js/jquery-1.7.min.js"></script>
	<script type="text/javascript" charset="utf-8" src="js/Timeline.js"></script>
	<script type="text/javascript" charset="utf-8" src="js/DataManager.js"></script>
	<script type="text/javascript" charset="utf-8" src="js/InterfaceManager.js"></script>
	<script type="text/javascript" charset="utf-8" src="js/script.js"></script>
	<script type="text/javascript" charset="utf-8">sId="<?php echo $_REQUEST['s']; ?>";query="<?php echo $_REQUEST['q']; ?>";</script>
</head>
<body>
	<?php 
	// var_dump($_GET);
	// echo '<br />';
	// var_dump($_REQUEST);
	?>
	<div id="balloon">
		<div id="balloon-tip" class="balloon tip"></div>
		<div id="balloon-top" class="balloon top"></div>
		<div id="balloon-body">
			<div id="slideshow-controls"><div class="previous"></div><div class="next"></div></div>
			<div id="slideshow">
			</div>
			<div id="mini-balloon">
				<div id="mini-ballon-tip" class="mini balloon tip"></div>
				<div id="mini-balloon-body">
				</div>
			</div>
			<div id="mini-balloon-footer">
				<div id="twitter"></div>
				<div id="facebook"></div>
				<!-- <div id="opine"><p>Opine:</p>
					<div id="estrelas-opine">
						<div class="estrela e1"></div><div class="estrela e2"></div><div class="estrela e3"></div><div class="estrela e4"></div><div class="estrela e5"></div>
					</div>
				</div> -->
			</div>
			<div id="cross">
			</div>
		</div>
	</div>
</body>
</html>

