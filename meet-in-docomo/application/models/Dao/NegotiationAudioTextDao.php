<?php

/**
 * NegotiationAudioTextDao クラス
 *
 * 文字起こし後のファイルを扱うDaoクラス
*/
class NegotiationAudioTextDao extends AbstractDao {

	private $db;

    private $table_name = 'negotiation_audio_text';

	function __construct($db){
		parent::init();
		$this->db = $db;
    }

    public function insert($params)
    {
        $this->db->beginTransaction();
        try {
            $this->db->insert($this->table_name, $params);
            $this->db->commit();
        } catch (Exception $e) {
            $this->db->rollback();
        }
    }
    
    /**
	 * DBから文字起こしファイル一覧を取得する
	 */
    public function getTextList($condition) {
		$sql = "SELECT
                    id,
					create_date,
                    update_date,
                    room_name,
                    staff_id,
                    staff_type,
                    client_id,
                    text,
                    title,
                    del_flg
				FROM
					negotiation_audio_text
				WHERE
					{$condition}
		";
		$rtn = $this->db->fetchAll($sql, array());
		return $rtn;
    }
    
    /**
	 * ファイルの個数を取得する
	 */
    public function getDocumentCount($del_condition) {
        $sql = "SELECT
            COUNT(del_flg) as count
            FROM
                negotiation_audio_text
            WHERE
                {$del_condition}
        ";
        $rtn = $this->db->fetchRow($sql, array());
        return $rtn["count"];
    }

    /**
	 * ページネーション用ファイル一覧を取得する
	 */
    public function getDocumentList($condition, $order, $ordertype, $page, $limit) {
        $offset = 0;
		$page = $page - 1;
		if($page > 0){
			$offset = $page * $limit;
		}
        $sql = "SELECT
                id,
                create_date,
                update_date,
                room_name,
                staff_id,
                staff_type,
                client_id,
                text_type,
                text,
                title
            FROM
                negotiation_audio_text
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
	 * ファイルを指定して削除する
	 */
    public function deleteAudioText($condition) {
		$record = array(
            'del_flg' => 1,
        );
        $this->db->update('negotiation_audio_text', $record, $condition);
		return $result;
    }


    /**
	 * ファイルを編集して保存する
	 */
    public function audioTextEdit($form,$condition) {
        $update_date = date("Y/m/d H:i:s");
		$record = array(
            'text' => $form['edit_text'],
            'title' => $form['edit_title'],
            'update_date' => $update_date
        );
        $this->db->update('negotiation_audio_text', $record, $condition);
		return $result;
    }

    /**
	 * ファイルごとの詳細情報を取得する
	 */
    public function getTextDetail($condition) {
        $sql = "SELECT
                    id,
					create_date,
                    update_date,
                    room_name,
                    staff_id,
                    staff_type,
                    client_id,
                    text_type,
                    text,
                    title
				FROM
					negotiation_audio_text
				WHERE
					{$condition}
		";
		$rtn = $this->db->fetchRow($sql, array());
		return $rtn;
    }

    /**
	 * ファイルをダウンロードする
	 */
    public function downloadTextFile($condition) {
		$sql = "SELECT
                    text,
                    title
				FROM
					negotiation_audio_text
				WHERE
                {$condition}
		";
		$rtn = $this->db->fetchAll($sql, array());
		return $rtn;
    }

    /**
	 * textを後から追加するための最新レコードを取得
	 */
    public function columnUpdate($text,$condition) {
		$sql = "UPDATE
                    negotiation_audio_text
                SET
                    `text` = '{$text}'
                WHERE
                    {$condition}
        ";
        $this->db->query($sql);
    }
    
}

?>