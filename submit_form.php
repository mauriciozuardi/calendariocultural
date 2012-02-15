<?php
$uploaddir = './formularios/';

if ($_POST){
  if (!is_dir($uploaddir)){
    if (!mkdir($uploaddir, 0777, true)) {
        die('Failed to create folders...');
    }
  }
  // echo ('<br>POST<br>');
  // var_dump(json_encode($_POST));
  $uploaddir .=  '/' . $_POST['form_id'] . '/';
  if (strlen($_POST['nome']) > 0){
    $uploaddir .= str_replace(' ','_',$_POST['nome']) . '_';
  }
  $uploaddir .=  substr(str_replace(':','.', date(DATE_ATOM)), 0, -6);
  if (!is_dir($uploaddir)){
    if (!mkdir($uploaddir, 0777, true)) {
        die('Failed to create folders...');
    }
  }
  $formfile = $uploaddir . '/form.json';
  file_put_contents($formfile, json_encode($_POST));
  $formfile = $uploaddir . '/dados.txt';
  $dados = "";
  $longest_key = 0;
  foreach($_POST as $key => $value){ $longest_key = max(strlen($key), $longest_key); }
  foreach($_POST as $key => $value){
    $space = "";
    for ($i = 0; $i< $longest_key - strlen($key); $i++){ $space .= ' ';}
    $dados .= "$key:$space $value\n";
  }
  file_put_contents($formfile, $dados);
  if ($_FILES){
    // echo ('<br><br>FILES<br>');
    // var_dump($_FILES);
    foreach($_FILES as $fieldname => $value){
      if ($value["error"] > 0){
        // echo ("Error: " . $value["error"] . "<br />");
      }    
      // var_dump($fieldname);
      // echo '<br><br>';
      // var_dump($value);
      // echo '<br><br>';
      $dir =  $uploaddir . '/' . $fieldname;
      if (!is_dir($dir)){
        if (!mkdir($dir, 0777, true)) {
            die('Failed to create folders...');
        }
      }
      if(strlen($value['name']) > 1){
        $uploadfile = $dir . '/' . basename($value['name']);
        if(basename($value['name']) == '.htaccess'){
          die('NOPE');
        }
        if (move_uploaded_file($value['tmp_name'], $uploadfile)) {
            // echo "File is valid, and was successfully uploaded.\n";
            // $htaccess = "php_flag engine off\nIndexIgnore *";
            // file_put_contents($dir . '/.htaccess', $htaccess);
        } else {
            die("Possible file upload attack!\n");
        }
      } else{
        // echo("Missing file: $fieldname");
      }
    }
  }
  if (strlen($_POST['notificar_email']) > 3){
    $recipient = $_POST['notificar_email'];
    $url = 'http://calendariocultural.com.br' . str_replace('//','/',substr($uploaddir,1));
    $body = "== Novo formulário submetido ==\n\n$dados";
    $body .= "\nAcesse os arquivos submetidos clicando pela URL abaixo:\n$url";
    $subject = "[calendariocultural] Novo formulário: " . $_POST['nome'];
    $sender = 'sistema@calendariocultural.com.br';
    $headers = "From: $sender \r\n" .
               'X-Mailer: PHP/' . phpversion();
    mail($recipient, $subject, $body, $headers);
    
    
    
  }
  echo "success";
}
?>