<?php

/**
 * MtaSettingDao クラス
 *
 * メール・トランスファー・エージェント（MTA）を扱うクラス
 *
 * @version 2015/09/02 21:27 sonoda
 * @package Dao
*/
class MtaSettingDao extends AbstractDao {

	private $db;
	function __construct($db){
		$this->db = $db;
	}

	/**
	 * 登録
	 * @param unknown $form
	 */
	public function regist($mta_settings, $userCondition) {

		foreach ($mta_settings as $setting) {
			$record = $this->_createMtaSettingParams($setting, $userCondition);

			// 登録処理を作る時に確認する
			$this->db->insert('mta_setting', $record);
		}
	}

	/**
	 * 登録するパラメータを作成する。
	 * @param unknown $setting
	 * @param unknown $userCondition
	 * @return multitype:
	 */
	private function _createMtaSettingParams($setting, $userCondition) {

		$record = array(
			'client_id'     => $userCondition["client_id"],
			'staff_type'    => $userCondition["staff_type"],
			'staff_id'      => $userCondition["staff_id"],
			'update_date'   => new Zend_Db_Expr('now()'),
			'create_date'   => new Zend_Db_Expr('now()')
		);

		$record = $this->_setCondition($record, $setting, "note");					// 「備考」を設定
		$record = $this->_setCondition($record, $setting, "sender_address");		// 「送信者メールアドレス」を設定
		$record = $this->_setCondition($record, $setting, "sender_smtp_server");	// 「SMTPサーバ」を設定
		$record = $this->_setCondition($record, $setting, "sender_smtp_port");		// 「SMTPポート」を設定
		$record = $this->_setCondition($record, $setting, "ehlo_user", true);		// 「SMTPユーザ名」を設定
		$record = $this->_setCondition($record, $setting, "ehlo_password", true);	// 「SMTPパスワード」を設定
		$record = $this->_setCondition($record, $setting, "dsn_server");			// 「POPサーバ」を設定
		$record = $this->_setCondition($record, $setting, "dsn_port");				// 「POPポート」を設定
		$record = $this->_setCondition($record, $setting, "dsn_user", true);		// 「POPユーザ名」を設定
		$record = $this->_setCondition($record, $setting, "dsn_password", true);	// 「POPパスワード」を設定

		return $record;
	}

	/**
	 * NULLを許容するカラム用にデータがある場合のみ、データを追加する関数
	 * @param unknown $record
	 * @param unknown $form
	 * @param unknown $key
	 * @param string $is_encrypt
	 * @return multitype:
	 */
	private function _setCondition($record, $form, $key, $is_encrypt = false) {

		if (!empty($form[$key])) {

			if ($is_encrypt) {
				$record = array_merge($record, array($key => new Zend_Db_Expr("AES_ENCRYPT({$this->db->quote($form[$key])}, @key)")));
			} else {
				$record = array_merge($record, array($key => $form[$key]));
			}
		}

		return $record;
	}

	/**
	 * 関連する設定を全て削除
	 * @param unknown $form
	 */
	public function deleteAll($userCondition) {

		$where = array(
			"staff_id = ?"   => $userCondition['staff_id'],
			"staff_type = ?" => $userCondition['staff_type']
		);

		$this->db->delete('mta_setting', $where);
	}

	/**
	 * MTA設定リストを取得する
	 * @param unknown $user
	 * @return unknown
	 */
	public function getMtaSettingList($user){
		
		$rtn = array();
		if(array_key_exists("client_id", $user)){
			// クライアント選択をせずにブックマーク一覧を紹介するケースがあるため「LEFT JOIN」を使用
			$sql = "
				SELECT
					mta_setting.*,
					AES_DECRYPT(ehlo_user,@key) as ehlo_user,
					AES_DECRYPT(ehlo_password,@key) as ehlo_password,
					AES_DECRYPT(dsn_user,@key) as dsn_user,
					AES_DECRYPT(dsn_password,@key) as dsn_password
				FROM
					mta_setting
				WHERE 
					client_id = {$user["client_id"]} AND 
					staff_type = '{$user["staff_type"]}' AND
					staff_id = {$user["staff_id"]}";
	
			$rtn = $this->db->fetchAll($sql, array());
		}

		return $rtn;
	}
	
	/**
	 * MTA設定を１件取得する
	 * @param unknown $user
	 * @return unknown
	 */
	public function getMtaSettingRowByMailaddress($user){
	
		// クライアント選択をせずにブックマーク一覧を紹介するケースがあるため「LEFT JOIN」を使用
		$sql = "
			SELECT
				mta_setting.*,
				AES_DECRYPT(ehlo_user,@key) as ehlo_user,
				AES_DECRYPT(ehlo_password,@key) as ehlo_password,
				AES_DECRYPT(dsn_user,@key) as dsn_user,
				AES_DECRYPT(dsn_password,@key) as dsn_password
			FROM
				mta_setting
			WHERE 
				client_id = {$user["client_id"]} AND 
				sender_address = '{$user["address"]}'";
		$rtn = $this->db->fetchRow($sql, array());
	
		return $rtn;
	}
	
	/**
	 * MTA設定のバリデーション用関数
	 * @param unknown $user
	 * @return unknown
	 */
	public function getValidateMtaSetting($condition){
	
		// クライアント選択をせずにブックマーク一覧を紹介するケースがあるため「LEFT JOIN」を使用
		$sql = "
		SELECT
			AES_DECRYPT(staff_name,@key) as staff_name 
		FROM
			mta_setting as a 
		INNER JOIN 
			master_staff as b 
		ON 
			a.staff_type = b.staff_type AND 
			a.staff_id = b.staff_id 
		WHERE
			{$condition}";
		$rtn = $this->db->fetchRow($sql, array());
		return $rtn;
	}
}