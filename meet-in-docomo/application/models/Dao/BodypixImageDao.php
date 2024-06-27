<?php
class BodypixImageDao extends AbstractDao {

	private $db;
	function __construct($db){
		parent::init();
		$this->db = $db;
	}

	/**
	 * 背景画像の登録
	 * @param string	$bodypixImagePath	画像パス
	 * @param array		$user				ログインユーザーデータ
	 * @return unknown
	 */
	public function setBodypixImage($bodypixImagePath, $user) {
		// 登録するデータのみのdictを作成する
		$record = array(
			'img_path' 				=> $bodypixImagePath,
			'create_date'			=> new Zend_Db_Expr('now()'), 
			'update_date' 			=> new Zend_Db_Expr('now()')
		);
		if(!is_null($user)){
			// ユーザー情報が存在する場合は設定する
			$record["staff_type"] = $user["staff_type"];
			$record["staff_id"] = $user["staff_id"];
		}
		// データを登録する
		$this->db->insert('bodypix_image', $record);
	}

	/**
	 * データを削除する
	 * @param string	$delImgPath	削除ファイルパス
	 * @param string	$staffType	担当者種別
	 * @param int		$staffId	担当者ID
	 */
	public function delBodypixImage($delImgPath, $staffType, $staffId){
		if(is_null($staffType) && is_null($staffId)){
			// 管理者画像の削除
			$this->db->delete('bodypix_image', "img_path = '{$delImgPath}' AND staff_type IS NULL AND staff_id IS NULL" );
		}else{
			// 担当者画像の削除
			$this->db->delete('bodypix_image', "img_path = '{$delImgPath}' AND staff_type = '{$staffType}' AND staff_id = {$staffId}" );
		}
	}

	/**
	 * 担当者情報から、担当者の登録したデータとシステム管理者が登録した画像データを取得する
	 * @param string	$staffType	担当者種別
	 * @param int		$staffId	担当者ID
	 * @return array
	 */
	public function getBodypixImages($staffType, $staffId){
		// クエリ作成
		$sql = "SELECT
					*
				FROM
					bodypix_image
				WHERE 
					staff_type = '{$staffType}' AND 
					staff_id = {$staffId} 
				UNION 
				SELECT
					*
				FROM
					bodypix_image
				WHERE 
					staff_type IS NULL AND 
					staff_id IS NULL  
				ORDER BY 
					create_date;
		";
		$rtn = $this->db->fetchAll($sql, array());
		return $rtn;
	}

	/**
	 * 管理者が登録した画像データを取得する
	 * @return array
	 */
	public function getBodypixImagesByAdmin(){
		// クエリ作成
		$sql = "
				SELECT
					*
				FROM
					bodypix_image
				WHERE 
					staff_type IS NULL AND 
					staff_id IS NULL  
				ORDER BY 
					create_date;
		";
		$rtn = $this->db->fetchAll($sql, array());
		return $rtn;
	}
}

