<?php
require_once ROOT.'library/Application/validation.php';

/**
 * AbstractModel クラス
 *
 * 抽象マネージャ
 *
 * @version $Id: AbstractManager.php,v 1.1 2010/11/26 09:11:09 takeda Exp $
 * @package Controller
 */
abstract class AbstractModel{

	protected $_logger;
	protected $user;
	protected $config;
	protected $message;

	const AJAX_SUCCESS_CODE = "1";		// Ajax処理成功時の結果コード
	const AJAX_FAILED_CODE  = "99";		// Ajax処理失敗時の結果コード

	// 1:メール送信, 2:メール送信失敗, 3:メール開封, 4:メール内URLクリック, 5:お問い合わせ, 6:予約画面表示, 7:予約, 8:参加, 9:キャンセル
	const BEHAVIOR_STATUS_SEND_MAIL = 1;
	const BEHAVIOR_STATUS_ERROR_MAIL = 2;
	const BEHAVIOR_STATUS_OPENED_MAIL = 3;
	const BEHAVIOR_STATUS_CLICK_MAIL = 4;
	const BEHAVIOR_STATUS_INQUIRY = 5;
	const BEHAVIOR_STATUS_RESERVATION_DISPLAY = 6;
	const BEHAVIOR_STATUS_RESERVATION = 7;
	const BEHAVIOR_STATUS_PARTICIPATION = 8;
	const BEHAVIOR_STATUS_RESERVATION_CANCEL = 9;
	protected $behaviorHistorys = array(
		self::BEHAVIOR_STATUS_SEND_MAIL => 			"メール送信", 
		self::BEHAVIOR_STATUS_ERROR_MAIL => 		"メール送信失敗", 
		self::BEHAVIOR_STATUS_OPENED_MAIL => 		"メール開封", 
		self::BEHAVIOR_STATUS_CLICK_MAIL => 		"メール内URLクリック", 
		self::BEHAVIOR_STATUS_INQUIRY => 			"お問い合わせ", 
		self::BEHAVIOR_STATUS_RESERVATION_DISPLAY => "予約画面表示", 
		self::BEHAVIOR_STATUS_RESERVATION => 		"予約", 
		self::BEHAVIOR_STATUS_PARTICIPATION => 		"参加", 
		self::BEHAVIOR_STATUS_RESERVATION_CANCEL => "キャンセル", 
	);
	// リードの登録種別
	const REGIST_ROUTE_FROM_ADMIN = 1;
	const REGIST_ROUTE_FROM_PARTICIPANT = 2;
	// 参加詳細ページURLに付属する参加者からメールか、リードからメールかを判別する種別
	const DETAIL_URL_TYPE_PARTICIPANT = 1;
	const DETAIL_URL_TYPE_LEAD = 2;
	// 参加詳細ページURLのキー文字数
	const DETAIL_URL_WEBINAR_ONLY = 8;				// ウェビナーを特定するキーだけ
	const DETAIL_URL_WEBINAR_AND_TARGET = 17;		// [ウェビナー(8)][参加者・リード判別キー(1)][送信相手を特定するキー(8))]
	// 取得するランダム文字列の種別
	const RANDOM_TYPE_ROOM_NAME = "room_name";
	const RANDOM_TYPE_ADMIN_KEY = "admin_key";
	const RANDOM_TYPE_ANNOUNCE_KEY = "announce_key";
	const RANDOM_TYPE_UNIQUE_KEY = "unique_key";

	public function __construct(){
		$this->init();
	}

	public function init(){
		if (Zend_Registry::isRegistered('logger')) {
			$this->_logger = Zend_Registry::get('logger');
		}else {
			$this->_logger = new Zend_Log(new Zend_Log_Writer_Null());
		}
		// ログイン情報を取得する
		$this->user = Zend_Registry::get('user');
		// system.ini情報を設定する
		$this->config = Zend_Registry::get('config');
		// application.ini情報を設定する
		$this->app = Zend_Registry::get('app');
		// message.ini情報を設定する
		$this->message = Zend_Registry::get('message');
	}

	/**
	 * PHP5.5ではmysql_real_escape_stringが非推奨となったため、
	 * ZENDのescape処理を利用しescapeする。
	 */
	public function escape($escapeTarget){
		// DBコネクション取得
		$db = Zend_Db_Table_Abstract::getDefaultAdapter();
		// マネージャーの宣言
		$commonDao = Application_CommonUtil::getInstance('dao','CommonDao', $db);
		$result = null;
		if(is_array($escapeTarget)){
			foreach($escapeTarget as $key=>$val){
				$result[$key] = $commonDao->escape($val);
			}
		}else{
			$result = $commonDao->escape($escapeTarget);
		}
		return $result;
	}

	/**
	 * URLのパラメータからウェビナーキーのみを取得する
	 * @param string $urlParam	URLのパラメータ
	 * @return string 
	 */
	protected function getWebinarKey($urlParam){
		$webinarKey = "";
		if(mb_strlen($urlParam) > self::DETAIL_URL_WEBINAR_ONLY){
			// パラメータから特定したwebinarKeyを設定する
			$webinarKey = substr($urlParam, 0, self::DETAIL_URL_WEBINAR_ONLY);
		}else{
			// ターゲットキーが存在しない場合
			$webinarKey = $urlParam;
		}
		// 戻り値を返す
		return $webinarKey;
	}
	/**
	 * URLのパラメータから参加者かリードか判定するフラグのみを取得する
	 * @param string $urlParam	URLのパラメータ
	 * @return string 
	 */
	protected function getUrlType($urlParam){
		return  substr($urlParam, self::DETAIL_URL_WEBINAR_ONLY, 1);
	}
	/**
	 * URLのパラメータから参加者かリードのユーザーキーを取得する
	 * @param string $urlParam	URLのパラメータ
	 * @return string 
	 */
	protected function getTargetKey($urlParam){
		return substr($urlParam, (self::DETAIL_URL_WEBINAR_ONLY + 1));
	}

	/**
	 * ランダム文字列を作成する。
	 * [room_name:数字8桁、過去3ヶ月重複なし]
	 * [admin_key:数字8桁、過去重複無し]
	 * [announce_key:英数8桁、過去重複無し]
	 * [unique_key:英数8桁、過去重複無し]
	 * 英数字のランダム文字取得処理参考サイト：https://qiita.com/suin/items/c958bcca90262467f2c0
	 * @param string $randomType	[room_name, admin_key, announce_key, unique_key]
	 * @return string
	 */
	protected function createRandomStirng($randomType){
		// 戻り値のランダム文字列
		$randomString = "";
		if($randomType == self::RANDOM_TYPE_ROOM_NAME){
			// ルーム名を作成する（数字8文字）
			$randomString = sprintf("%08d", mt_rand(0, 99999999));
		}else if($randomType == self::RANDOM_TYPE_ADMIN_KEY){
			// 主催者キーを作成する（数字8文字）
			$randomString = sprintf("%08d", mt_rand(0, 99999999));
		}else if($randomType == self::RANDOM_TYPE_ANNOUNCE_KEY){
			// 参加者予約画面キーを作成する（英数字8文字）
			$randomString = substr(base_convert(md5(uniqid()), 16, 36), 0, 8);
		}else if($randomType == self::RANDOM_TYPE_UNIQUE_KEY){
			// 参加者予約画面キーを作成する（英数字8文字）
			$randomString = substr(base_convert(md5(uniqid()), 16, 36), 0, 8);
		}
		// 文字列を返す
		return $randomString;
	}
}
