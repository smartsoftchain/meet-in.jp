<?php

/**
 * MaterialDetailDao クラス
 *
 * 資料の詳細データを扱うDaoクラス
 *
 * @version 2017/01/17 16:27 ochi
 * @package Dao
*/
class MaterialDetailDao extends AbstractDao {

	private $db;

	function __construct($db){
		parent::init();
		$this->db = $db;
	}

	/**
	 * 資料の詳細をページで並び替え全て取得する
	 * @param unknown $condition
	 * @return unknown
	 */
	public function getMaterialDetailNoLimitList($condition) {
		$sql = "SELECT
					material_detail_id, 
					material_id, 
					material_page, 
					material_filename, 
					material_memo_flg, 
					material_memo, 
					material_title_flg, 
					material_title, 
					material_tag_flg, 
					create_staff_id, 
					update_staff_id, 
					create_date, 
					update_date 
				FROM
					material_detail 
				WHERE
					{$condition} AND 
					material_detail_del_flg = 0 
				ORDER BY 
					material_page asc;
		";
		$rtn = $this->db->fetchAll($sql, array());
		return $rtn;
	}

}
