<?php

/**
 * @author takeda
 *
 */
class CommonDao extends AbstractDao {

	private $db;
	function __construct($db){
		$this->db = $db;
	}

	
	/**
	 * PHP5.5ではmysql_real_escape_stringが非推奨となったため、
	 * ZENDのescape処理を使用する為にDBのコネクションを取得する
	 */
	public function escape($word){
		$word = $this->db->quote($word);
		// 変換するとシングルクウォートで挟まれるので、削除する
		$word = ltrim($word, "'");
		$word = rtrim($word, "'");
		return $word;
	}
	
	/**
	 * sqlのクエリを実行する
	 * @param unknown $sql
	 */
	public function execQuery($sql) {
		$this->db->query($sql);
	}
}
