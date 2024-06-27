━∞━━━━━━━━━━━━━━━━━━━━━∞━
Smart-in接続サンプル　簡易説明　　　　2014/09/24
━∞━━━━━━━━━━━━━━━━━━━━━∞━

■ご利用前の注意
本サンプル一式は以下の環境にて動作確認しました。
　CentOS6.4(64bit)
　PHP5.5
　MySQL5.5
※OSの種別が異なる場合や、32bitOSの場合は動作しません。
　その際はお客様環境に合わせた sin_crypt をお持ちの場合、そちらに差し換えてお試しください。


■内容物一覧
calling.gif           ・・・接続確認時のダイアログ画像
index.html            ・・・画面表示用HTML
readme.txt            ・・・本ファイル
sin_crypt             ・・・暗号化モジュール（※要権限設定755）
smartin.php           ・・・サンプルPHP（※要設定）
smartin_response.php  ・・・サンプルPHP（※要設定）
textdb.db             ・・・ファイル使用時のデータファイル（※要権限設定666）


■設置手順
１）ファイル内の設定情報を変更して下さい。

・smartin.php
{Smart-inキー32桁}
{Smart-in企業コード4桁}
{DB名}
{DBユーザ名}
{DBパスワード}
{設置DIR}

・smartin_response.php
{Smart-inキー32桁}
{DB名}
{DBユーザ名}
{DBパスワード}


２）FTPもしくはSCPにてファイル一式をサーバに配置してください。


３）パーミッションの設定をしてください。

> chmod 755 sin_crypt
> chmod 666 textdb.db

４）DBをご利用の場合、token管理用のテーブルを作成します。

・MySQLの場合
CREATE TABLE `tokens` (
  `token` varchar(32) NOT NULL,
  `status` int(11) NOT NULL,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


５）これでお試しいただけます。
ブラウザを開いて、設置した index.html にアクセスしてください。

電話番号を入力するフィールドがありますので、入力し、「Smart-in認証」ボタンを押せば電話がかかってきます。


以上