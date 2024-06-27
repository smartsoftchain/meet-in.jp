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

}

