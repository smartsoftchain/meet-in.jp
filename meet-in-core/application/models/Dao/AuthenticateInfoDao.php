<?php
/**
 * AuthenticateInfoDao クラス
 * 二要素認証を扱うクラス
 * @package Dao
*/
class AuthenticateInfoDao extends AbstractDao {

    private $db;

    const TABLE_NAME = "authenticate_info";

    function __construct($db) {
        parent::init();
        $this->db = $db;
    }

    /**
     * 認証情報を登録
     */
    public function insert($form, $secret) {
        $record = array(
            'staff_id'    => $form['staff_id'],
            'staff_type'  => $form['staff_type'],
			'secret_key'  => $secret,
            'acc_cnt'     => 0,
            'varify_flg'  => 0
		);

        try {
			$this->db->beginTransaction();
			$this->db->insert(SELF::TABLE_NAME, $record); // オートインクリメントが無いテーブル.
			$this->db->commit();
		} catch (Exception $e) {
			$this->db->rollback();
		}
        return $record;
    }

    /**
     * 認証情報を取得
     */
    public function find($condition) {
        $sql = sprintf("
            SELECT *
            FROM %s
            WHERE {$condition};
        ", SELF::TABLE_NAME);

        $rtn = $this->db->fetchAll($sql, array());
        return $rtn;

    }

    /**
     * 認証情報を更新
    */
    public function update($param, $condition) {

        $this->db->beginTransaction();
        try {
            $this->db->update(SELF::TABLE_NAME, $param, $condition);
            $this->db->commit();
        } catch (Exception $e) {
            $this->db->rollback();
        }
    }
}