<!DOCTYPE html>
<html>
<head>
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>契約書捺印</title>
<meta charset="utf-8">
<meta name="description" content="">
<meta name="author" content="">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="shortcut icon" href="">
<link rel="stylesheet" href="/css/reset.css">
<link rel="stylesheet" href="/css/sp/e_contract.css">
<script src="/js/jquery-1.11.2.min.js?{$application_version}"></script>
<script src="/js/jquery-ui.min.js?{$application_version}"></script>


</head>
<body>
	<div class="e_contract__wrap">
    <div class="e_contract__header">
      <img src="/img/logo_header.png" alt="meet in" class="e_contract__header--logo">
      <p class="e_contract__header--title">契約書捺印</p>
    </div>

    <div class="e_contract__content--wrap">
      <p class="e_contract__content--title">認証</p>
      <p class="e_contract__content--description">契約書の説明の際に登録したメールアドレスを入力してください。</p>

      <form action="/e-contract-api/auth?token={$token}" method="post">
        <div class="e_contract__content--input">
          <input name="email"placeholder="aaa@aaa.aaa">
        </div>
        <div class="e_contract__content--submit">
          <input type="submit" value="認証">
        </div>
      </form>
    </div>
	</div>
</body>
</html>
