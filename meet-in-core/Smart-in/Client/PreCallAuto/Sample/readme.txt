━∞━━━━━━━━━━━━━━━━━━━━━∞━
Smart-in接続サンプル　簡易説明　　　　2017/08/31
━∞━━━━━━━━━━━━━━━━━━━━━∞━

■ご利用前の注意
本サンプル一式は以下の環境にて動作確認しました。
　CentOS6.4(64bit)
　PHP5.5
　MySQL5.5


■内容物一覧
calling.gif           ・・・接続確認時のダイアログ画像
index.html            ・・・画面表示用HTML
readme.txt            ・・・本ファイル
smartin.php           ・・・サンプルPHP（※要設定）


■設置手順
１）ファイル内の設定情報を変更して下さい。

・smartin.php
{Smart-in先行発信キー32桁}
{Smart-in企業コード4桁}
{DB名}
{DBユーザ名}
{DBパスワード}
{設置DIR}


２）FTPもしくはSCPにてファイル一式をサーバに配置してください。


４）DBをご利用の場合、token管理用のテーブルを作成します。

・MySQLの場合
CREATE TABLE `tokens` (
  `token` varchar(32) NOT NULL,
  `status` int(11) NOT NULL,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


５）これでお試しいただけます。
ブラウザを開いて、設置した index.html にアクセスしてください。

電話番号を入力するフィールドがありますので、入力し、「Smart-in認証」ボタンを押してください。
Smart-inより発行された電話番号に発信すると、認証が完了します。


以上