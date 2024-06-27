<?php

/**
 * AbstractDao クラス
 *
 * 抽象マネージャ
 *
 * @version $Id: AbstractManager.php,v 1.1 2015/08/13 15:28 ochi Exp $
 * @package Dao
 */
abstract class AbstractDao{
	
	protected $user;
	
	public function __construct(){
		$this->init();
	}
	
	public function init(){
		// ログイン情報を取得する
		$this->user = Zend_Registry::get('user');
	}
	
	//--------------------------------------------------孫のツール---------------
	/**
	 * テーブル名：consumer,restriction_consumer,result,appoint
	 * 32桁の主キー作成のSQLを作成
	 * テーブル名：　invalid_telephone
	 * 25桁の主キー作成のSQLを作成
	 * パラメーター1 クライアントID	not null
	 * パラメーター2 プロジェクトID
	 * return: ◆
	 * 32桁の主キー例:　100001000148800000000000000000 + UUID_SHORT()
	 * 25桁の主キー例: 10000100000000000000000 + + UUID_SHORT()
	 * 例外：$client_idがnullの場合、0を返す
	 * @param unknown $client_id
	 * @param unknown $project_id
	 * @return number|string
	 */
	public static function _createPrimaryKey($client_id, $project_id) {
		if ($client_id == null) {
			return 0;
		}
	
		if ($project_id != null) {
			// ((100000.0+$client_id)*10*1000000+ $project_id )*10*1000000000000000000;
			$ret = bcadd ( 100000, $client_id, 0 );
			$ret = bcmul ( $ret, 10 * 1000000, 0 );
			$ret = bcadd ( $ret, $project_id, 0 );
			$ret = bcmul ( $ret, 10, 0 );
			$ret = bcmul ( $ret, 10000000000, 0 ); // まず１０桁かけ
			$ret = bcmul ( $ret, 100000000, 0 ); // ８桁かけ
				
			return $ret . " + UUID_SHORT()";
		} else {
			// invalid_telephone専用
			$ret = bcadd ( 100000, $client_id, 0 );
			$ret = bcmul ( $ret, 10, 0 );
			$ret = bcmul ( $ret, 10000000000, 0 ); // まず１０桁かけ
			$ret = bcmul ( $ret, 100000000, 0 ); // ８桁かけ
				
			return $ret . " + UUID_SHORT()";
		}
	}
	
	/**
	 * 主キーからプロジェクトIDを取得
	 * パラメーター1 primary 32桁の主キー	not null
	 * return: project_id
	 *
	 * 例外：$primaryKeyがnullの場合、桁数足りない場合、0を返す
	 * @param unknown $primaryKey
	 * @return number
	 */
	public static function _getProjectid($primaryKey) {
		$primaryKey = (string)$primaryKey;
		if ($primaryKey != null && strlen ( $primaryKey ) == 32) {
				
			$ret = substr ( $primaryKey, 0, 13 );
			$ret = bcmod ( $ret, 1000000 );
				
			if ($ret < 1) {
				$ret = 0;
			}
				
			return $ret;
		} else {
			return 0;
		}
	}

	/**
	 * 主キーからプClientIDを取得
	 * パラメーター1 primaryKey 25/32桁の主キー	not null
	 * return: client_id
	 *
	 * 例外：$primaryKeyがnullの場合、桁数足りない場合、0を返す
	 * @param unknown $primaryKey
	 * @return number
	 */
	public static function _getClientid($primaryKey) {
		$primaryKey = (string)$primaryKey;
		if ($primaryKey != null) {
				
			if (strlen ( ( string ) $primaryKey ) > 25) {
				$ret = substr ( $primaryKey, 0, 13 );
				$ret = bcdiv ( $ret, 10000000, 0 );
				$ret = bcmod ( $ret, 100000 );
				if ($ret < 1) {
					$ret = 0;
				}
			} else {
				$ret = substr ( $primaryKey, 0, 6 );
				$ret = bcmod ( $ret, 100000 );
				if ($ret < 1) {
					$ret = 0;
				}
			}
			return $ret;
		} else {
			return 0;
		}
	}

	/**
	 * projectID で絞る時の主キーの条件を取得
	 * パラメーター1 クライアントID	not null
	 * パラメーター2 プロジェクトID　not null
	 * return: { ["up"]=> string(32) "10123400043210000000000000000000"
	 *           ["down"]=> string(32) "10123400043211000000000000000000" }
	 * 使用方法：
	 * projectIDで絞りたい時
	 * select consumer_id from consumer where consumer_id > $up and consumer_id < $down
	 *
	 * @param unknown $client_id
	 * @param unknown $project_id
	 * @return number|multitype:unknown
	 */
	public static function _searchByProject($client_id, $project_id) {
		if ($client_id == null) {
			return 0;
		}
	
		$ret = bcadd ( 100000, $client_id, 0 );
		$ret = bcmul ( $ret, 10 * 1000000, 0 );
		$ret = bcadd ( $ret, $project_id, 0 );
		$ret = bcmul ( $ret, 10, 0 );
		$up = bcmul ( $ret, 10000000000, 0 ); // まず１０桁かけ
		$up = bcmul ( $up, 100000000, 0 ); // ８桁かけ
	
		$down = bcadd ( $ret, 1, 0 );
		$down = bcmul ( $down, 10000000000, 0 ); // まず１０桁かけ
		$down = bcmul ( $down, 100000000, 0 ); // ８桁かけ
	
		return array (
				"up" => $up,
				"down" => $down
		);
	}
	
	/**
	 * ClientID で絞る時の主キーの条件を取得
	 * パラメーター1 クライアントID	not null
	 * return: { ["up"]=>  "10123400000000000000000000000000"
	 *           ["down"]=>  "10123410000000000000000000000000" }
	 * 使用方法：
	 * ClientIDで絞りたい時
	 * select consumer_id from consumer where consumer_id > $up and consumer_id < $down
	 *
	 * @param unknown $client_id
	 * @return number|multitype:unknown
	 */
	public static function _searchByClient32($client_id) {
		if ($client_id == null) {
			return 0;
		}
	
		$ret = bcadd ( 100000, $client_id, 0 );
		$ret = bcmul ( $ret, 10, 0 );
	
		$up = bcmul ( $ret, 1000000, 0 );
		$up = bcmul ( $up, 10, 0 );
		$up = bcmul ( $up, 10000000000, 0 ); // まず１０桁かけ
		$up = bcmul ( $up, 100000000, 0 ); // ８桁かけ
	
		$down = bcadd ( $ret, 1, 0 );
		$down = bcmul ( $down, 1 * 1000000, 0 );
		$down = bcmul ( $down, 10, 0 );
		$down = bcmul ( $down, 10000000000, 0 ); // まず１０桁かけ
		$down = bcmul ( $down, 100000000, 0 ); // ８桁かけ
	
		return array (
				"up" => $up,
				"down" => $down
		);
	}
	
	/**
	 * invalid_telephoneテーブルのClientID で絞る時の主キーの条件を取得
	 * パラメーター1 クライアントID	not null
	 * return: { ["up"]=>  "1012340000000000000000000"
	 *           ["down"]=>  "1012341000000000000000000" }
	 * 使用方法：
	 * ClientIDで絞りたい時
	 * select id from invalid_telephone where id > $up and id < $down
	 *
	 * @param unknown $client_id
	 * @return number|multitype:unknown
	 */
	public static function _searchByClient25($client_id) {
		if ($client_id == null) {
			return 0;
		}
	
		$ret = bcadd ( 100000, $client_id, 0 );
		$ret = bcmul ( $ret, 10, 0 );
	
		$up = bcmul ( $ret, 10000000000, 0 ); // まず１０桁かけ
		$up = bcmul ( $up, 100000000, 0 ); // ８桁かけ
	
		$down = bcadd ( $ret, 1, 0 );
		$down = bcmul ( $down, 10000000000, 0 ); // まず１０桁かけ
		$down = bcmul ( $down, 100000000, 0 ); // ８桁かけ
	
		return array (
				"up" => $up,
				"down" => $down
		);
	}

	/**
	 * SQL_CALC_FOUND_ROWSで取得した表示カウントを取得する
	 * この関数の前に必ずSQL_CALC_FOUND_ROWSでカウントする関数を呼ぶ必要がある
	 * @return unknown
	 */
	public function getFoundRowsCount() {
		// DBコネクション取得
		$db = Zend_Db_Table_Abstract::getDefaultAdapter();
		$sql = "SELECT FOUND_ROWS() as `count`";
		$rtn = $db->fetchRow($sql);
		return $rtn["count"];
	}
}

