<?php

/**
 * MasterClientDownloadOptionDao クラス
 *
 * クライアントダウンロードオプションDaoクラス
 *
 * @version 2015/09/07 22:45 ochi
 * @package Dao
*/
class MasterClientDownloadOptionDao extends AbstractDao {
	
	// 担当者種別
	const STAFF_TYPE_AIDMA  = "AA";
	const STAFF_TYPE_CLIENT = "CE";

	private $db;
	function __construct($db){
		$this->db = $db;
	}

	/**
	 * 対象のクライアント情報を登録（更新・登録）
	 * @param unknown $form
	 * @return unknown
	 */
	public function regist($dataDict) {
		// 最新データを追加
		$record = array(
				'client_id'					=> $dataDict["clientId"],
				'id'						=> new Zend_Db_Expr('master_client_download_option_increment(client_id)'),
				'plan_name'					=> $dataDict['plan_name'],
				'publish_telephone_db_flg'	=> $dataDict['publish_telephone_db_flg'],
				'ca_is_enable_over'			=> $dataDict['ca_is_enable_over'],
				'ca_download_num'			=> $dataDict['ca_download_num'],
				'ca_download_limit'			=> $dataDict['ca_download_limit'],
				'aa_is_enable_download'		=> $dataDict['aa_is_enable_download'],
				'aa_download_limit'			=> $dataDict['aa_download_limit'],
				'current_flg'				=> 1,
				'create_date'				=> new Zend_Db_Expr('now()')
		);
		// 自サーバーに登録
		$this->db->insert('master_client_download_option', $record);
		return $clientId;
	}

	/**
	 * 最新のダウンロードオプションを取得する
	 * @param unknown $condition
	 * @param unknown $order
	 * @param unknown $ordertype
	 */
	Public function getLastMasterClientDownloadOption($clientId) {
		$sql = "SELECT
					* 
				FROM
					master_client_download_option
				WHERE
					client_id = :clientId
				ORDER BY 
					id desc 
				LIMIT 1;
				";
		$rtn = $this->db->fetchRow($sql, array("clientId"=>$clientId));
		return $rtn;
	}
	
	/**
	 * リストを取得
	 * @param unknown $st_yy
	 * @param unknown $st_mm
	 * @param unknown $ed_yy
	 * @param unknown $ed_mm
	 * @param unknown $client_list
	 * @param unknown $condition
	 * @return multitype:unknown
	 */
	public function getDownloadOptionList($st_yy, $st_mm, $ed_yy, $ed_mm, $client_list = array()) {
	
		$result = array();		
	
		// daoの宣言
		$masterDbDownloadHistoryDao = Application_CommonUtil::getInstance("dao", "MasterDbDownloadHistoryDao", $this->db);
	
		// 検索期間をマスタとして扱う
		$yy_mm_list = $this->makeYYMMList($st_yy, $st_mm, $ed_yy, $ed_mm);
	
		foreach ($yy_mm_list as $yy_mm){
	
			// クライアントごとに
			foreach ($client_list as $client) {
	
				$client_id = $client['client_id'];
	
				// 指定月のクライアントオプション設定を取得する
				$option = $this->getCurrentDLOption($client, $yy_mm);
				
				if ($option == false) {
					continue;
				}
	
				$option['client_name'] = $client['client_name'];
				$option['yy_mm']       = date('Y年m月', strtotime($yy_mm));
				$option['client_id']   = $client_id;
	
	
				// 指定月のCEのDL件数を取得する
				$ca_sum_month = $masterDbDownloadHistoryDao->getSumDownloadByMonth($client_id, self::STAFF_TYPE_CLIENT, $yy_mm);
				$option['ca_sum_month'] = $ca_sum_month;
	
				// 指定月までのCEのDL累計を取得する
				$ca_sum_total = $masterDbDownloadHistoryDao->getSumDownloadTotalByMonth($client_id, self::STAFF_TYPE_CLIENT, $yy_mm. ' 00:00:00');
				$option['ca_sum_total'] = $ca_sum_total;
	
				// その月のDL超過数（超過がなければ0）
				$ca_over = $ca_sum_month - $option['ca_download_num'];
				$ca_over = ($ca_over < 0) ? 0: $ca_over;
				$option['ca_over'] = $ca_over;
	
				// 指定月のAAのDL件数を取得する
				$aa_sum_month =  $masterDbDownloadHistoryDao->getSumDownloadByMonth($client_id, self::STAFF_TYPE_AIDMA, $yy_mm);
				$option['aa_sum_month'] = $aa_sum_month;
	
				// 指定月までのAAのDL累計を取得する
				$aa_sum_total =  $masterDbDownloadHistoryDao->getSumDownloadTotalByMonth($client_id, self::STAFF_TYPE_AIDMA, $yy_mm. ' 00:00:00');
				$option['aa_sum_total'] = $aa_sum_total;
	
				$result[] = $option;
			}
		}
	
		// 検索結果があれば並び替え
		if (count($result) > 0){
	
			// 結果を並び替え(クライアント毎に、年月の降順)
			$sk_1 = array();
			$sk_2 = array();
				
			foreach ($result as $option){
				$sk_1[] = $option['client_id'];
				$sk_2[] = $option['yy_mm'];
			}
			array_multisort($sk_1, SORT_ASC, $sk_2, SORT_DESC, $result);
		}
	
		return $result;
	}

	/**
	 * 日付リストを作成
	 * @param unknown $st_yy
	 * @param unknown $st_mm
	 * @param unknown $ed_yy
	 * @param unknown $ed_mm
	 * @return Ambigous <string, multitype:string >
	 */
	private function makeYYMMList($st_yy, $st_mm, $ed_yy, $ed_mm){
	
		$yy_mm_list = array();
		if ($st_yy == $ed_yy && $ed_yy == $ed_mm){
	
			$yy_mm_list = "{$st_yy}-{$st_mm}-1";
	
		}else{
	
			$cur_yy = $st_yy;
			$cur_mm = $st_mm;
			while (true){
	
				$yy_mm_list[] = "{$cur_yy}-{$cur_mm}-1";
	
				if (strtotime($cur_yy. '-'. $cur_mm. '-1') == strtotime($ed_yy.'-'. $ed_mm.'-1')){
					break;
				}
	
				$cur_mm++;
	
				if ($cur_mm > 12){
					$cur_mm = 1;
					$cur_yy++;
				}
			}
		}
		return $yy_mm_list;
	}
	
	/**
	 * 指定月のオプション設定を取得する。
	 * 指定月のオプションがない場合は（クライアント登録日～指定月-1）のなかで最新の値を取得する。
	 *
	 * @param unknown $client
	 * @param unknown $yy_mm
	 */
	private function getCurrentDLOption($client, $yy_mm){
	
		$client_id   = $client['client_id'];
		$create_date = $client['create_date'];
	
		$sql = "
			SELECT
			 	*
			FROM
				master_client_download_option as o1
			WHERE
				o1.client_id = {$client_id} AND
				o1.id = (
					SELECT
						MAX(id)
					FROM
						master_client_download_option as o2
					WHERE
						o2.client_id = {$client_id} and
						o2.create_date between '{$create_date}' and date_format(last_day('{$yy_mm}'), '%Y-%m-%d 23:59:59')
				)
			";
	
		$result = $this->db->fetchRow($sql);
		return $result;
	}
}