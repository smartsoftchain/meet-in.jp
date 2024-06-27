<?php

/**
 * MaterialDao クラス
 *
 * 資料データを扱うDaoクラス
 *
 * @version 2015/06/06 19:02 ochi
 * @package Dao
*/
class MaterialDao extends AbstractDao {

	const TABLE_NAME = "material_basic";

	// 担当者種別[AA:管理担当者,TA:在宅担当者,CE:クライアント担当者]
	const STAFF_TYPE_AA = "AA";
	const STAFF_TYPE_CE = "CE";

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
			material_basic
		WHERE
			{$condition}
		";
		$rtn = $this->db->fetchRow($sql, array());
		return $rtn;
	}


	/**
	 * 条件を指定し資料の件数を取得する
	 * @param unknown $condition	検索条件
	 * @return unknown
	 */
	public function getMaterialCount($condition) {
		$sql = "SELECT
					COUNT(material_id) as count
				FROM
					material_basic
				WHERE
					{$condition}
		";
		$rtn = $this->db->fetchRow($sql, array());
		return $rtn["count"];
	}
	/**
	 * 条件を指定し担当者の一覧を取得する
	 * @param unknown $condition	検索条件
	 * @param unknown $order		ソートを行う為のカラム
	 * @param unknown $ordertype	昇順、降順
	 * @param unknown $page			ページインデックス
	 * @param unknown $limit		データ取得件数
	 * @return unknown
	 */
	public function getMaterialList($condition, $order, $ordertype, $page, $limit) {
		$offset = 0;
		$page = $page - 1;
		if($page > 0){
			$offset = $page * $limit;
		}
		$sql = "SELECT
					material_id,
					material_type,
					material_name,
					material_ext,
					shareable_flg,
					document_guard_key_flg,
					note,
					direction_flg,
					download_flg,
					material_url,
					all_pages,
					total_size,
					create_staff_type,
					create_staff_id,
					update_staff_type,
					update_staff_id,
					create_date,
					update_date
				FROM
					material_basic
				WHERE
					{$condition}
				ORDER BY
					{$order} {$ordertype}
				LIMIT
					{$limit}
				OFFSET
					{$offset};
		";
		$rtn = $this->db->fetchAll($sql, array());
		return $rtn;
	}

	/**
	 * 条件を指定し全ての資料情報を取得する
	 * @param unknown $condition
	 * @param unknown $order
	 * @param unknown $ordertype
	 * @return unknown
	 */
	public function getMaterialNoLimitList($condition, $order, $ordertype) {
		$sql = "SELECT
					material_id,
					client_id,
					material_type,
					material_name,
					material_ext,
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
					material_basic
				WHERE
					{$condition}
				ORDER BY
					{$order} {$ordertype};
		";
		$rtn = $this->db->fetchAll($sql, array());
		return $rtn;
	}

	/**
	 * 条件を指定し担当者を取得する
	 * @param unknown $condition	検索条件
	 * @return unknown
	 */
	public function getMaterialRow($condition) {
		$sql = "SELECT
					material_id,
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
					material_basic
				WHERE
					{$condition}
		";
		$rtn = $this->db->fetchRow($sql, array());
		return $rtn;
	}

	/**
	 * 条件を指定し資料の情報全てを１件だけ取得する
	 * @param unknown $condition
	 * @return unknown
	 */
	public function getMaterialAllRow($condition) {
		$sql = "SELECT
					a.material_id,
					a.client_id,
					a.material_type,
					a.material_ext,
					a.material_name,
					a.shareable_flg,
					a.document_guard_key_flg,
					a.note,
					a.direction_flg,
					a.download_flg,
					a.material_url,
					a.all_pages,
					a.create_staff_type,
					a.create_staff_id,
					a.update_staff_type,
					a.update_staff_id,
					a.create_date,
					a.update_date,
					b.material_detail_id,
					b.material_page,
					b.material_filename,
					b.material_memo_flg,
					b.material_memo,
					b.material_title_flg,
					b.material_title,
					b.material_tag_flg
				FROM
					material_basic as a 
				LEFT OUTER JOIN 
					material_detail as b 
				ON 
					a.material_id = b.material_id 
				WHERE
					{$condition} AND b.material_detail_del_flg = 0";
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

		if (!isset($form["material_id"]) || empty($form["material_id"])) {
			// 新規
			$record['create_date'] = new Zend_Db_Expr('now()');
			$record['create_staff_type'] = $form['staff_type'];
			$record['create_staff_id'] = $form['staff_id'];
			$record['document_guard_key_flg'] = $form["document_guard_key_flg"] ? $form["document_guard_key_flg"] : 0;
			$this->db->insert('material_basic', $record);
			$sql = "SELECT
						MAX(material_id) as max_material_id
					FROM
						material_basic
					WHERE
						1
					";
			$rtn = $this->db->fetchRow($sql, array());
			$result["material"] = $record;
			$result["material"]["material_id"] = $rtn["max_material_id"];
			$result["material"]["material_id_key"] = md5($rtn["max_material_id"]);
		}
		else {
			// 更新
			$this->db->update('material_basic', $record, " material_id = {$form['material_id']}");
			$result["material"] = $record;
			$result["material"]["material_id"] = $form['material_id'];
			$result["material"]["material_id_key"] = md5($form["material_id"]);
		}
		return $result;
	}

	public function deleteMaterialRow($condition) {
		$result = $this->db->delete('material_detail', $condition);
		$result = $this->db->delete('material_basic', $condition);
		return $result;
	}

	public function setMaterialDetail($form) {
		$result = array();
		$record = array(
			'material_id'		=> $form["material_id"],
			'create_date'		=> new Zend_Db_Expr('now()'),
			'update_date'		=> new Zend_Db_Expr('now()'),
			'update_staff_type'	=> $form['update_staff_type'],
			'update_staff_id'	=> $form['update_staff_id'],
			'create_staff_type'	=> $form['update_staff_type'],
			'create_staff_id'	=> $form['update_staff_id'],
		);
		if ($form["material_type"] != 3) {
			$hashed_id = md5($form["material_id"]);
			$filename = $_SERVER['DOCUMENT_ROOT'].'/cmn-data/'.$hashed_id.'-*.*';
			$i = 1;
			foreach(glob($filename) as $val) {
				$fileinfo = pathinfo($val);
				$record['material_page'] = $i;
				$record['material_filename'] = "{$hashed_id}-{$i}.{$fileinfo['extension']}";
				$this->db->insert('material_detail', $record);
				$i++;
			}
		}
		else {
			// 動画
			$hashed_id = md5($form["material_id"]);
			$filename = $_SERVER['DOCUMENT_ROOT'].'/cmn-data/'.$hashed_id.'.*';
			$i = 1;
			foreach(glob($filename) as $val) {
				$fileinfo = pathinfo($val);
				$record['material_page'] = $i;
				$record['material_filename'] = "{$hashed_id}.{$fileinfo['extension']}";
				$this->db->insert('material_detail', $record);
				$i++;
			}
		}
		return $result;
	}
	public function getMaterialDetailList($condition) {
		$sql = "SELECT
					material_detail_id,
					material_id,
					material_page,
					material_filename,
					material_memo_flg,
					material_memo,
					material_title_flg,
					material_title,
					material_tag_flg
				FROM
					material_detail
				WHERE
					{$condition} AND material_detail_del_flg = 0
				ORDER BY
					material_page
		";
		$rtn = $this->db->fetchAll($sql, array());
		return $rtn;
	}
	public function getMaterialDetailRow($condition) {
		$sql = "SELECT
					material_detail_id,
					material_id,
					material_page,
					material_filename,
					material_memo_flg,
					material_memo,
					material_title_flg,
					material_title,
					material_tag_flg
				FROM
					material_detail
				WHERE
					{$condition} AND material_detail_del_flg = 0
				ORDER BY
					material_page
		";
		$rtn = $this->db->fetchRow($sql, array());
		return $rtn;
	}

	public function setMaterialDetailRow($form, $condition) {
		$record = array(
			'update_date'		=> new Zend_Db_Expr('now()'),
			'update_staff_type'	=> $form['staff_type'],
			'update_staff_id'	=> $form['staff_id'],
		);
		// コメント
		if(isset($form["material_memo"])) {
			$record["material_memo"] = $form["material_memo"];
		}
		// ふせん
		if(isset($form["material_tag_flg"])) {
			$record["material_tag_flg"] = $form["material_tag_flg"];
		}
		// タイトル
		if(isset($form["material_title"])) {
			$record["material_title"] = $form["material_title"];
		}
		$rtn = $this->db->update('material_detail', $record, $condition);
		return $rtn;
	}

	public function deleteMaterialDetailByPage($form, $condition) {
		// ページ単位の削除はフラグONのみ
		$record = array(
			'material_detail_del_flg' => 1
		);
		$rtn = $this->db->update('material_detail', $record, $condition);
		// ページ番号の振り直し
		$sql = "UPDATE
			material_detail as a,
			(
				SELECT
					@rownum := @rownum+1 as row_num,
					material_detail_id
				FROM
					(SELECT @rownum := 0) as index_num,
					material_detail
				WHERE
					material_id = {$form['material_id']} AND material_detail_del_flg = 0
				ORDER BY
					material_page
			) as b
			SET
				a.material_page = b.row_num
			WHERE
				a.material_id = {$form['material_id']} AND a.material_detail_del_flg = 0
			AND
				a.material_detail_id=b.material_detail_id";
		$rtn = $this->db->query($sql);
		return $rtn;
	}
	public function deleteMaterialDetailRow($condition) {
		// 詳細情報クリア
		$rtn = $this->db->delete('material_detail', $condition);
		return $rtn;
	}
	public function swapMaterialDetailRow($swapPages, $condition) {
		$swapquery = '';
		foreach($swapPages as $swap) {
			$swapquery .= "WHEN material_page = ". $swap['fromPageNo'] . " THEN " . $swap['toPageNo'] . "\r\n";
		}
		$sql = "UPDATE
			material_detail
		SET material_page =
			CASE
				{$swapquery}
			END
		WHERE {$condition}";
		$rtn = '';
		$rtn = $this->db->query($sql);
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
					material_basic
				WHERE
					client_id = {$clientId};
		";
		$rtn = $this->db->fetchRow($sql, array());
		return $rtn["all_size"];
	}

	/**
	 * 資料のサイズを更新する
	 * @param unknown $materialId
	 * @param unknown $size
	 */
	public function updateMaterialSize($materialId, $size){
		$sql = "UPDATE
					material_basic
				SET 
					total_size = {$size} 
				WHERE 
					material_id = {$materialId}";
		$this->db->query($sql);
	}
}
