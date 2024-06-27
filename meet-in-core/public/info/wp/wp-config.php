<?php
/**
 * WordPress の基本設定
 *
 * このファイルは、インストール時に wp-config.php 作成ウィザードが利用します。
 * ウィザードを介さずにこのファイルを "wp-config.php" という名前でコピーして
 * 直接編集して値を入力してもかまいません。
 *
 * このファイルは、以下の設定を含みます。
 *
 * * MySQL 設定
 * * 秘密鍵
 * * データベーステーブル接頭辞
 * * ABSPATH
 *
 * @link http://wpdocs.osdn.jp/wp-config.php_%E3%81%AE%E7%B7%A8%E9%9B%86
 *
 * @package WordPress
 */

// 注意:
// Windows の "メモ帳" でこのファイルを編集しないでください !
// 問題なく使えるテキストエディタ
// (http://wpdocs.osdn.jp/%E7%94%A8%E8%AA%9E%E9%9B%86#.E3.83.86.E3.82.AD.E3.82.B9.E3.83.88.E3.82.A8.E3.83.87.E3.82.A3.E3.82.BF 参照)
// を使用し、必ず UTF-8 の BOM なし (UTF-8N) で保存してください。

// ** MySQL 設定 - この情報はホスティング先から入手してください。 ** //
/** WordPress のためのデータベース名 */
define('DB_NAME', 'lp_wp');

/** MySQL データベースのユーザー名 */
define('DB_USER', 'lp_db_user');

/** MySQL データベースのパスワード */
define('DB_PASSWORD', 'e24nspXGPmFn5Fsv');

/** MySQL のホスト名 */
define('DB_HOST', 'localhost');

/** データベースのテーブルを作成する際のデータベースの文字セット */
define('DB_CHARSET', 'utf8');

/** データベースの照合順序 (ほとんどの場合変更する必要はありません) */
define('DB_COLLATE', '');

/**#@+
 * 認証用ユニークキー
 *
 * それぞれを異なるユニーク (一意) な文字列に変更してください。
 * {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org の秘密鍵サービス} で自動生成することもできます。
 * 後でいつでも変更して、既存のすべての cookie を無効にできます。これにより、すべてのユーザーを強制的に再ログインさせることになります。
 *
 * @since 2.6.0
 */
define('AUTH_KEY',         'cbLQ }T>j_1+lL^h,w1f@6|l]9w1b<FL-x@^qZ4^b2&7N@EX}V1`-Uhh3{Fkb@xG');
define('SECURE_AUTH_KEY',  'a%:HZx%_Z)7|s|xHw_+YWAv8V`7Qr5 2*/[BUhkH%LsBTGQwUP.Y@>fEE[88/}_A');
define('LOGGED_IN_KEY',    '(ZX)AZ0jR.@fz{68{|K/}klw!6?+l*pDsNwyU9Dwo0rV{: e0CHlqcN4qd|9XY4h');
define('NONCE_KEY',        'rk*^#}YJIA.,HFZtZVm<Gg{AT=o5yP+q:a!u5s.b$8]38t#~I4xb&?)p1f?{S[E)');
define('AUTH_SALT',        'zAN1M;6d>Srj9^8RnFAQtq8o=p+ 7d[sLe%$O=34~9@8RQ`MV]wl|-p=-hWA<3&%');
define('SECURE_AUTH_SALT', '8C 9.<wIrS;w SPuKU*IGN@:J1yN*:v3$*YQQijC@Q|x_tLM1vL~fhm##-v%bnKj');
define('LOGGED_IN_SALT',   ')D }t8;xrKem.V:0}$_&QQ*.||8E-eqA5&h/k)+tD*t3TmJX*KSi@S8D0vVvik,l');
define('NONCE_SALT',       '39_a<y^~JYb/kR$+PCp}h}%vg`bS/XaoC4UqFJ!MJO=s9+czZ_35J6qr*wTfAIyr');

/**#@-*/

/**
 * WordPress データベーステーブルの接頭辞
 *
 * それぞれにユニーク (一意) な接頭辞を与えることで一つのデータベースに複数の WordPress を
 * インストールすることができます。半角英数字と下線のみを使用してください。
 */
$table_prefix  = 'lp3wp_';

/**
 * 開発者へ: WordPress デバッグモード
 *
 * この値を true にすると、開発中に注意 (notice) を表示します。
 * テーマおよびプラグインの開発者には、その開発環境においてこの WP_DEBUG を使用することを強く推奨します。
 *
 * その他のデバッグに利用できる定数については Codex をご覧ください。
 *
 * @link http://wpdocs.osdn.jp/WordPress%E3%81%A7%E3%81%AE%E3%83%87%E3%83%90%E3%83%83%E3%82%B0
 */

define('WP_DEBUG', true);

/* 編集が必要なのはここまでです ! WordPress でブログをお楽しみください。 */

/** Absolute path to the WordPress directory. */
if ( !defined('ABSPATH') )
	define('ABSPATH', dirname(__FILE__) . '/');

/** Sets up WordPress vars and included files. */
require_once(ABSPATH . 'wp-settings.php');
