<?php
class WebinarController extends AbstractController
{
	// public function init()
	// {
	// 	parent::init();
	// 	/* Initialize action controller here */
	// 	// ログインチェック
	// 	$auth = Zend_Auth::getInstance();
	// 	if ($auth->hasIdentity() == true) {
	// 		// 認証情報取出し
	// 		$user = $auth->getIdentity();
	// 		$webinarModel = Application_CommonUtil::getInstance("model", "WebinarModel", $this->db);
	// 		if ($webinarModel->clientIdentification($user) == false) {
	// 			// AA or ウェビナー可能時間が0以外ならはじく
	// 			$auth = Zend_Auth::getInstance();
	// 			$auth->clearIdentity();
	// 			Zend_Session::destroy();
	// 			$this->_redirect('/index');
	// 		}
	// 	} else {
	// 		$this->_redirect('/index');
	// 	}
	// }

	// /**
	//  * ウェビナー一覧を表示する
	//  */
	// public function listAction()
	// {
	// 	$form = $this->_getAllParams();
	// 	// 操作ログ
	// 	$this->setLog("ウェビナー一覧表示", json_encode($form));
	// 	// モデル宣言
	// 	$webinarModel = Application_CommonUtil::getInstance("model", "WebinarModel", $this->db);
	// 	// 画面表示に必要なデータを取得
	// 	$result = $webinarModel->getWebinarList($form, $this->namespace);
	
	// 	// smartyにデータを設定する
	// 	$this->view->list = $result["listObject"];
	// 	$this->view->planCount = $result["planCount"];
	// 	$this->view->endCount = $result["endCount"];
	// 	$this->view->cancelCount = $result["cancelCount"];
	// 	$this->view->allCount = $result["allCount"];
	// 	$this->view->displayWebinarUseTime = $result["displayWebinarUseTime"];
	// 	$this->view->displayAddWebinarUseTime = $result["displayAddWebinarUseTime"];
	// 	$this->view->displayTotalWebinarUseTime = $result["displayTotalWebinarUseTime"];
	// 	$this->view->checkWebinarAvailable = $result["checkWebinarAvailable"];
	// 	$this->view->freeWord = $this->namespace->free_word;
	// 	$this->view->viewType = $this->namespace->viewType;
	// }

	// /**
	//  * ウェビナー削除
	//  */
	// public function deleteWebinarAction()
	// {
	// 	$form = $this->_getAllParams();
	// 	// 操作ログ
	// 	$this->setLog("ウェビナー削除", json_encode($form));
	// 	// モデル宣言
	// 	$webinarModel = Application_CommonUtil::getInstance("model", "WebinarModel", $this->db);
	// 	// 画面表示に必要なデータを取得
	// 	$result = $webinarModel->deleteWebinar($form);
	// 	echo json_encode($result);
	// 	exit;
	// }
	// /**
	//  * ウェビナーキャンセル
	//  */
	// public function cancelWebinarAction()
	// {
	// 	$form = $this->_getAllParams();
	// 	// 操作ログ
	// 	$this->setLog("ウェビナーキャンセル", json_encode($form));
	// 	// モデル宣言
	// 	$webinarModel = Application_CommonUtil::getInstance("model", "WebinarModel", $this->db);
	// 	// 画面表示に必要なデータを取得
	// 	$result = $webinarModel->cancelWebinar($form);
	// 	echo json_encode($result);
	// 	exit;
	// }
	
	// /**
	//  * ウェビナー新規登録
	//  */
	// public function registAction()
	// {
	// 	$form = $this->_getAllParams();
	// 	$request = $this->getRequest();

	// 	// モデル宣言
	// 	$webinarModel = Application_CommonUtil::getInstance("model", "WebinarModel", $this->db);
	// 	// 画面表示に必要なデータを取得
	// 	$result = $webinarModel->regist($form, $request, $this->namespace);
	// 	if ($result["registCompleteFlg"] == 1) {
	// 		// 登録完了の場合は一覧へ遷移
	// 		$this->_redirect("/webinar/regist-complete?id={$result["webinarId"]}");
	// 	}
	// 	$this->view->webinar = $result["webinarDict"];
	// 	$this->view->displayWebinarUseTime = $result["displayWebinarUseTime"];
	// 	$this->view->displayWebinarUseTime = $result["displayWebinarUseTime"];
	// 	$this->view->displayAddWebinarUseTime = $result["displayAddWebinarUseTime"];
	// 	$this->view->displayTotalWebinarUseTime = $result["displayTotalWebinarUseTime"];
	// 	$this->view->checkWebinarAvailable = $result["checkWebinarAvailable"];
	// 	$this->view->errorList = $result["errorList"];
	// 	$this->view->hours = $result["hours"];
	// 	$this->view->minutes = $result["minutes"];
	// }

	// /**
	//  * ウェビナー新規登録完了画面
	//  */
	// public function registCompleteAction()
	// {
	// 	$form = $this->_getAllParams();
	// 	// モデル宣言
	// 	$webinarModel = Application_CommonUtil::getInstance("model", "WebinarModel", $this->db);
	// 	// GETパラメータのIDを元にwebinarデータを取得する
	// 	$webinar = $webinarModel->getWebinarRowByIdAndClientId($form["id"]);
	// 	if (!$webinar) {
	// 		// データが取得できなかった場合は一覧へ遷移させる
	// 		$this->_redirect("/webinar/list");
	// 	}
	// 	$this->view->meetinUrl = (empty($_SERVER['HTTPS']) ? 'http://' : 'https://').$_SERVER['HTTP_HOST']."/api/webi-desc/{$webinar["announce_key"]}";
	// 	$this->view->webinarUrl = (empty($_SERVER['HTTPS']) ? 'http://' : 'https://').$_SERVER['HTTP_HOST']."/api/webi-room/{$webinar["room_name"]}";
	// }

	// /**
	//  * ウェビナー詳細
	//  */
	// public function detailAction()
	// {
	// 	$form = $this->_getAllParams();
	// 	$request = $this->getRequest();

	// 	// モデル宣言
	// 	$webinarModel = Application_CommonUtil::getInstance("model", "WebinarModel", $this->db);
	// 	// 画面表示に必要なデータを取得
	// 	$result = $webinarModel->detail($form, $request, $this->namespace);
	// 	if ($result["registCompleteFlg"] == 1) {
	// 		// 登録完了の場合は一覧へ遷移
	// 		$this->_redirect('/webinar/list');
	// 	}
	// 	$this->view->webinar = $result["webinarDict"];
	// 	$this->view->webinarAvailableFlg = $result["webinarAvailableFlg"];
	// 	$this->view->meetinUrl = (empty($_SERVER['HTTPS']) ? 'http://' : 'https://').$_SERVER['HTTP_HOST']."/api/webi-desc/{$result["webinarDict"]["announce_key"]}";
	// 	$this->view->webinarUrl = (empty($_SERVER['HTTPS']) ? 'http://' : 'https://').$_SERVER['HTTP_HOST']."/api/webi-room/{$result["webinarDict"]["room_name"]}";
	// 	$this->view->errorList = $result["errorList"];
	// 	$this->view->hours = $result["hours"];
	// 	$this->view->minutes = $result["minutes"];
	// }


	// /**
	//  * メール作成に必要な情報を取得する。
	//  * メール埋め込みタグ、メールテンプレートなど
	//  */
	// public function getMailCreateInfoAction()
	// {
	// 	$form = $this->_getAllParams();
	// 	// モデル宣言
	// 	$webinarMailModel = Application_CommonUtil::getInstance("model", "WebinarMailModel", $this->db);
	// 	// メール作成に必要な情報を取得する
	// 	$result = $webinarMailModel->getMailCreateInfo($form);
	// 	// メール作成に必要な情報を画面へ返す
	// 	echo json_encode($result);
	// 	exit;
	// }

	// /**
	//  * メールモーダルからメール送信する処理
	//  */
	// public function sendWebinarMailAction()
	// {
	// 	$form = $this->_getAllParams();
	// 	// モデル宣言
	// 	$webinarMailModel = Application_CommonUtil::getInstance("model", "WebinarMailModel", $this->db);
	// 	// 画面表示に必要なデータを取得
	// 	$result = $webinarMailModel->sendWebinarMail($form);
	// 	// 戻り値を返す
	// 	echo json_encode($result);
	// 	exit;
	// }

	// /**
	//  * アンケート結果一覧を表示する処理
	//  */
	// public function questionnaireListAction()
	// {
	// 	$form = $this->_getAllParams();
	// 	// 操作ログ
	// 	$this->setLog("アンケート結果一覧表示", json_encode($form));
	// 	// モデル宣言
	// 	$webinarModel = Application_CommonUtil::getInstance("model", "WebinarModel", $this->db);
	// 	// 画面表示に必要なデータを取得
	// 	$result = $webinarModel->getQuestionnaireResultList($form, $this->namespace);
	// 	// smartyにデータを設定する
	// 	$this->view->list = $result["listObject"];
	// 	$this->view->freeWord = $this->namespace->free_word;
	// 	$this->view->webinar = $result["webinarDict"];
	// 	$this->view->answerTypeNames = $result["answerTypeNames"];
	// }

	// /**
	//  * アンケート結果集計を取得する
	//  */
	// public function questionnaireAggregateAction()
	// {
	// 	$form = $this->_getAllParams();
	// 	// 操作ログ
	// 	$this->setLog("アンケート結果集計を取得", json_encode($form));
	// 	// モデル宣言
	// 	$webinarModel = Application_CommonUtil::getInstance("model", "WebinarModel", $this->db);
	// 	// 画面表示に必要なデータを取得
	// 	$result = $webinarModel->getQuestionnaireAggregate($form);
	// 	echo json_encode($result);
	// 	exit;
	// }
	
	// /**
	//  * メールモーダルでウェビナーが選択された際に
	//  * ウェビナー情報の埋め込みタグを返す処理
	//  */
	// public function getWebinarEmbeddedTagAction()
	// {
	// 	$form = $this->_getAllParams();
	// 	// モデル宣言
	// 	$webinarMailModel = Application_CommonUtil::getInstance("model", "WebinarMailModel", $this->db);
	// 	// 画面表示に必要なデータを取得
	// 	$result = $webinarMailModel->getWebinarEmbeddedTag($form);
	// 	// 戻り値を返す
	// 	echo json_encode($result);
	// 	exit;
	// }
}
