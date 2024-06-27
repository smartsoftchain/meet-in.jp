<?php
/**
 * 共通関数を内包するクラス
 *
 * 使い方「CommonUtil::関数名」
 */
class Application_CommonUtil{

	/**
	 * 各種インスタンス取得
	 * @param unknown $dirName				models直下のフォルダ名
	 * @param unknown $fileName				ファイル名の拡張子無し
	 * @return Ambigous <NULL, unknown>		インスタンス
	 */
	public static function getInstance($dirName, $fileName, $db=null){
		// モデル名
		$dirName = ucfirst($dirName);
		$instance = null;
		$file = sprintf("%s/models/%s/%s.php", APP_DIR, $dirName, $fileName);
		if (is_readable($file)) {
			require_once($file);
			$class = $fileName;
			if(is_null($db)){
				$instance = new $class;
			}else{
				$instance = new $class($db);
			}
		}
		return $instance;
	}

	/**
	 * URLの最後と引数の値が一致していれば真とする
	 * @param unknown $referer
	 */
	public static function refererCheck($referer){
		$httpReferers = explode("?", $_SERVER["HTTP_REFERER"]);
		$urls = explode("/", reset($httpReferers));
		$result = false;
		if(count($urls) > 0){
			if($referer == end($urls)){
				$result = true;
			}
		}
		return $result;
	}

	/**
	 * セッションを取得する
	 * @param unknown $identifier	セッション識別子
	 * @return Zend_Session_Namespace
	 */
	public static function getSession($identifier){
		$user = Zend_Auth::getInstance()->getIdentity();
		$identifier = $identifier."_{$user["staff_type"]}_{$user["staff_id"]}";
		return new Zend_Session_Namespace($identifier);
	}
	/**
	 * セッションを初期化する
	 * @param unknown $identifier	セッション識別子
	 */
	public static function unsetSession($identifier){
		$user = Zend_Auth::getInstance()->getIdentity();
		$identifier = $identifier."_{$user["staff_type"]}_{$user["staff_id"]}";
		Zend_Session::namespaceUnset($identifier);
	}
	
	/**
	 * セッションを初期化し、初期化後のセッションを取得する
	 * @param unknown $identifier	セッション識別子
	 * @return Zend_Session_Namespace
	 */
	public static function resetSession($identifier){
		// セッションを初期化する
		$user = Zend_Auth::getInstance()->getIdentity();
		$identifier = $identifier."_{$user["staff_type"]}_{$user["staff_id"]}";
		Zend_Session::namespaceUnset($identifier);
		// 初期化したセッションを再作成し返す
		return new Zend_Session_Namespace($identifier);
	}
	
	/**
	 * 文字列の中から数値のみを取得する
	 * @param unknown $string
	 */
	public static function getOnlyNumbers($string){
		return mb_ereg_replace('[^0-9]', '', $string);
	}
	
	/**
	 * ユニークになるようなランダムな値を返す
	 * @param unknown $string
	 */
	public static function getUniqueKey(){
		list($micro, $Unixtime) = explode(" ", microtime());
		$sec = $micro + date("s", $Unixtime);
		$date = preg_replace("/\./", "", date("Ymdhi", $Unixtime).$sec);
		$uniqueId = md5($date.(string)uniqid(rand()));
		return $uniqueId;
	}
	
	/**
	 * 漢数字を数値に変換する
	 * @param string $kanji 漢数字
	 * @param int $mode 出力書式／1=3桁カンマ区切り，2=漢字混じり, それ以外=ベタ打ち
	 * @return double 数値
	 */
	public static function convKanjiToArabic($data) {
		$result = null;
	
		// 変換対象以外の文字が存在するかチェックする
		$convFlg = true;
		$ll = mb_strlen($data);
		for ($pos = $ll - 1; $pos >= 0; $pos--) {
			$c = mb_substr($data, $pos, 1);
			if(!preg_match('/[十百千万億兆京壱弐参人名円 　,一二三四五六七八九〇０-９0-9]/u', $c)){
				$convFlg = false;
				break;
			}
		}
		// 全て変換対象の場合のみ、変換処理を実施する
		if($convFlg){
			//全角＝半角対応表
			$kan_num = array(
					'０' => 0, '〇' => 0,
					'１' => 1, '一' => 1, '壱' => 1,
					'２' => 2, '二' => 2, '弐' => 2,
					'３' => 3, '三' => 3, '参' => 3,
					'４' => 4, '四' => 4,
					'５' => 5, '五' => 5,
					'６' => 6, '六' => 6,
					'７' => 7, '七' => 7,
					'８' => 8, '八' => 8,
					'９' => 9, '九' => 9
			);
			//位取り
			$kan_deci_sub = array('十' => 10, '百' => 100, '千' => 1000);
			$kan_deci = array('万' => 10000, '億' => 100000000, '兆' => 1000000000000, '京' => 10000000000000000);
	
			//右側から解釈していく
			$ll = mb_strlen($data);
			$a = '';
			$deci = 1;
			$deci_sub = 1;
			$m = 0;
			$n = 0;
			for ($pos = $ll - 1; $pos >= 0; $pos--) {
				$c = mb_substr($data, $pos, 1);
				if (isset($kan_num[$c])) {
					$a = $kan_num[$c] . $a;
				} else if (isset($kan_deci_sub[$c])) {
					if ($a != '')   $m = $m + $a * $deci_sub;
					else if ($deci_sub != 1) $m = $m + $deci_sub;
					$a = '';
					$deci_sub = $kan_deci_sub[$c];
				} else if (isset($kan_deci[$c])) {
					if ($a != '')   $m = $m + $a * $deci_sub;
					else if ($deci_sub != 1) $m = $m + $deci_sub;
					$n = $m * $deci + $n;
					$m = 0;
					$a = '';
					$deci_sub = 1;
					$deci = $kan_deci[$c];
				}elseif(is_numeric($c)){
					$a = $c . $a;
				}
			}
	
			$ss = '';
			if (preg_match("/^(0+)/", $a, $regs) != FALSE) $ss = $regs[1];
			if ($a != '')   $m = $m + $a * $deci_sub;
			else if ($deci_sub != 1) $m = $m + $deci_sub;
			$n = $m * $deci + $n;
			$result = $n;
		}
	
		return $result;
	}
	
	/**
	 * 文字列を変換する
	 * スペースを全て削除
	 * 「半角カタカナ」を「全角カタカナ」に変換
	 * 「全角」英数字を「半角」
	 * 大文字アルファベットを小文字アルファベットに変換
	 * @param unknown $str
	 * @return unknown
	 */
	public static function convertCommonString($str){
		// スペースを削除する
		$str = preg_replace("/( |　)/", "", $str);
		// 「半角カタカナ」を「全角カタカナ」に変換し、「全角」英数字を「半角」に変換
		$str = mb_convert_kana($str, "KVa");
		// 大文字アルファベットを小文字アルファベットに変換
		$str = strtolower($str);
		return $str;
	}
}