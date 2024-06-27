<?php

/**
 * EContractDocumentMaterialDao クラス
 *
 * 電子契約書データを扱うDaoクラス
 *
 * @version 2020/11/20 18:30 Nishimura
 * @package Dao
*/
class EContractDocumentMaterialDao extends AbstractDao {

	const TABLE_NAME  = "e_contract_document_material_basic";

	private $db;

	function __construct($db){
		parent::init();
		$this->db = $db;
	}

	public function returnNullZero($val) {
		if ( $val == null) {
			return "0";
		} else {
			return $val;
		}
	}

	/**
	 * 全カラムを取得取得する.
	 * @param unknown $condition	検索条件
	 * @return unknown
	 */
	public function getMaterial($condition) {
		$sql = "SELECT
			*
		FROM
			e_contract_document_material_basic
		WHERE
			{$condition}
		";
		$rtn = $this->db->fetchRow($sql, array());
		return $rtn;
	}

	/**
	 * 条件を指定し担当者を取得する
	 * @param unknown $condition	検索条件
	 * @return unknown
	 */
	public function getMaterialRow($condition) {
		$sql = "SELECT
					e_contract_document_material_id,
					material_type,
					material_ext,
					material_name,
					shareable_flg,
					document_guard_key_flg,
					note,
					direction_flg,
					download_flg,
					material_url,
					all_pages,
					create_staff_type,
					create_staff_id,
					update_staff_type,
					update_staff_id,
					create_date,
					update_date
				FROM
					e_contract_document_material_basic
				WHERE
					{$condition}
		";
		$rtn = $this->db->fetchRow($sql, array());
		return $rtn;
	}

	/**
	 * 条件を指定し担当者を取得する
	 * @param unknown $condition	検索条件
	 * @return unknown
	 */
	public function setMaterial($form) {
		// material_idがなければ新規
		$result = array();
		$record = array();
		if(isset($form['material_type'])) {
			$record['material_type'] = $form["material_type"];

			if ($form["material_type"] == 0 || $form["material_type"] == 2 || $form["material_type"] == 3) {
				// 資料データ・向き・ダウンロード表示
				// PDF変換の場合
				if(isset($form['download_flg'])) {
					$record['download_flg'] = $this->returnNullZero($form["download_flg"]);
				}
				if(isset($form['direction_flg'])) {
					$record['direction_flg'] = $this->returnNullZero($form["direction_flg"]);
				}
			}
			else {
				// URL
				if(isset($form['material_url'])) {
					$record['material_url'] = $form["material_url"];
				}
			}
		}
		if(isset($form['material_name'])) {
			$record['material_name'] = $form["material_name"];
		}
		if(isset($form['client_id'])) {
			$record['client_id'] = $form["client_id"];
		}

		if(isset($form['shareable_flg'])) {
			$record['shareable_flg'] = $this->returnNullZero($form["shareable_flg"]);
		}

		if(isset($form['document_guard_key_flg'])) {
			$record['document_guard_key_flg'] = $form["document_guard_key_flg"];
		}

		if(isset($form['note'])) {
			$record['note'] = $form['note'];
		}

		if(isset($form['update_staff_type'])) {
			$record['update_staff_type'] = $form['staff_type'];
		}
		if(isset($form['update_staff_id'])) {
			$record['update_staff_id'] = $form['staff_id'];
		}
		// 資料データかURL
		if(isset($form["material_ext"])) {
			$record['material_ext'] = $form['material_ext'];
		}

		if(isset($form["total_size"])) {
			if(isset($form["total_size"]["size"])){
				$record['total_size'] = $form["total_size"]["size"];
			} else {
				$record['total_size'] = $form['total_size'];
			}
		}

		$record['update_date'] = new Zend_Db_Expr('now()');

		if (!isset($form["e_contract_document_material_id"]) || empty($form["e_contract_document_material_id"])) {
			// 新規
			$record['create_date'] = new Zend_Db_Expr('now()');
			$record['create_staff_type'] = $form['staff_type'];
			$record['create_staff_id'] = $form['staff_id'];
			$record['document_guard_key_flg'] = 0;
			$this->db->insert(self::TABLE_NAME, $record);
			$sql = "SELECT
						MAX(e_contract_document_material_id) as max_material_id
					FROM
						e_contract_document_material_basic
					WHERE
						1
					";
			$rtn = $this->db->fetchRow($sql, array());
			$result["material"] = $record;
			$result["material"]["e_contract_document_material_id"] = $rtn["max_material_id"];
			$result["material"]["material_id_key"] = md5($rtn["max_material_id"]);
		}
		else {
			// 更新
			$this->db->update(self::TABLE_NAME, $record, " e_contract_document_material_id = {$form['e_contract_document_material_id']}");
			$result["material"] = $record;
			$result["material"]["e_contract_document_material_id"] = $form['e_contract_document_material_id'];
			$result["material"]["material_id_key"] = md5($form["e_contract_document_material_id"]);
		}
		return $result;
	}

	public function deleteMaterialRow($condition) {
		$result = $this->db->delete('e_contract_document_material_detail', $condition);
		$result = $this->db->delete(self::TABLE_NAME, $condition);
		return $result;
	}

	public function setMaterialDetail($form) {
		$result = array();
		$record = array(
			'e_contract_document_material_id'	=> $form["e_contract_document_material_id"],
			'create_date'		=> new Zend_Db_Expr('now()'),
			'update_date'		=> new Zend_Db_Expr('now()'),
			'update_staff_type'	=> $form['update_staff_type'],
			'update_staff_id'	=> $form['update_staff_id'],
			'create_staff_type'	=> $form['update_staff_type'],
			'create_staff_id'	=> $form['update_staff_id'],
		);
		if ($form["material_type"] != 3) {
			$hashed_id = md5($form["e_contract_document_material_id"]);
			$filename = $_SERVER['DOCUMENT_ROOT'].'/cmn-e-contract/'.$hashed_id.'-*.*';
			$i = 1;
			foreach(glob($filename) as $val) {
				$fileinfo = pathinfo($val);
				$record['material_page'] = $i;
				$record['material_filename'] = "{$hashed_id}-{$i}.{$fileinfo['extension']}";
				$this->db->insert('e_contract_document_material_detail', $record);
				$i++;
			}
		}
		else {
			// 動画
			$hashed_id = md5($form["e_contract_document_material_id"]);
			$filename = $_SERVER['DOCUMENT_ROOT'].'/cmn-e-contract/'.$hashed_id.'.*';
			$i = 1;
			foreach(glob($filename) as $val) {
				$fileinfo = pathinfo($val);
				$record['material_page'] = $i;
				$record['material_filename'] = "{$hashed_id}.{$fileinfo['extension']}";
				$this->db->insert('e_contract_document_material_detail', $record);
				$i++;
			}
		}
		return $result;
	}
	public function getMaterialDetailList($condition) {
		$sql = "SELECT
					material_detail_id,
					e_contract_document_material_id,
					material_page,
					material_filename,
					material_memo_flg,
					material_memo,
					material_title_flg,
					material_title,
					material_tag_flg
				FROM
					e_contract_document_material_detail
				WHERE
					{$condition} AND material_detail_del_flg = 0
				ORDER BY
					material_page
		";
		$rtn = $this->db->fetchAll($sql, array());
		return $rtn;
	}


	/**
	 * クライアントを指定し、現在登録してある資料の合計サイズを返す
	 * @param unknown $clientId
	 */
	public function allMaterialSize($clientId){
		$sql = "SELECT
					SUM(total_size) as all_size 
				FROM
					e_contract_document_material_basic
				WHERE
					client_id = {$clientId};
		";
		$rtn = $this->db->fetchRow($sql, array());
		return $rtn["all_size"];
	}

}
