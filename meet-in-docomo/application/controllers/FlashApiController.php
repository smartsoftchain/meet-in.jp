<?php
require_once APP_DIR.'/models/Adapter/AuthAdapter.php';

class FlashApiController extends AbstractApiController
{
	public function init(){
		parent::init();
		/* Initialize action controller here */
	}

	public function flashWebServiceAction(){
		$form = $this->_getAllParams();

		$username = $form["username"];
		$identity = $form["identity"];
		$friends = $form["friends"];
		
		$flashApiModel = Application_CommonUtil::getInstance("model", "FlashApiModel", $this->db);

		if (!empty($username) && isset($identity)) {
			// 登録解除処理
			if ("0" === $identity) {
				$flashApiModel->deleteFlashPeerInfo($username);

				// 処理結果を返す
				header("Access-Control-Allow-Origin: *");
				echo('<?xml version="1.0" encoding="utf-8"?>');
				echo('<result>');
				echo('<update>true</update>');
				echo('</result>');
				exit;
			} 
			// 登録処理
			else {
				$flashPeerInfo = $flashApiModel->createFlashPeerInfo($username, $identity);

				// 処理結果を返す
				header("Access-Control-Allow-Origin: *");
				echo('<?xml version="1.0" encoding="utf-8"?>');
				echo('<result>');
				echo('<update>true</update>');
				echo('</result>');
				exit;
			}
		}
		// ピア検索処理
		else if (!empty($friends)) {
			$flashPeerInfo = $flashApiModel->getFlashPeerInfo($friends);

			// 処理結果を返す
			header("Access-Control-Allow-Origin: *");
			echo('<?xml version="1.0" encoding="utf-8"?>');
			echo('<result>');
			echo('<friend>');
			echo('<user>'.$friends.'</user>');
			if (!empty($flashPeerInfo)) {
				echo('<identity>'.$flashPeerInfo["identity"].'</identity>');
			}
			echo('</friend>');
			echo('</result>');
			exit;
		} 

		// エラー
		// 処理結果を返す
		header("Access-Control-Allow-Origin: *");
		echo('error');
		exit;
	}

}

