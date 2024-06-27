<?php
require_once APP_DIR.'/models/Adapter/AuthAdapter.php';

class CommonController extends AbstractController
{

	public function init()
	{
		parent::init();
		/* Initialize action controller here */
	}

	public function privacyAction(){
		// 操作ログ
		$this->setLog("プライバシーポリシー表示", json_encode($this->_getAllParams()));
	}
	
	/**
	 * カテゴリー1を選択時にカテゴリー1に紐付くカテゴリー2を取得する
	 */
	public function getBusinessCategory2Action(){
		$form = $this->_getAllParams();
		// 操作ログ
		$this->setLog("共通処理_カテゴリ1に紐付くカテゴリ2を取得", json_encode($form));
		// モデル宣言
		$commonModel = Application_CommonUtil::getInstance("model", "CommonModel", $this->db);
		$businessCategory2Json = $commonModel->getBusinessCategory2($form);
		// 非同期通信なのでechoで画面にデータを返す
		echo $businessCategory2Json;
		exit;
	}
	
	/**
	 * カテゴリー2を選択時にカテゴリー2に紐付くカテゴリー3を取得する
	 */
	public function getBusinessCategory3Action(){
		$form = $this->_getAllParams();
		// 操作ログ
		$this->setLog("共通処理_カテゴリ2に紐付くカテゴリ3を取得", json_encode($form));
		// モデル宣言
		$commonModel = Application_CommonUtil::getInstance("model", "CommonModel", $this->db);
		$businessCategory3Json = $commonModel->getBusinessCategory3($form);
		// 非同期通信なのでechoで画面にデータを返す
		echo $businessCategory3Json;
		exit;
	}
	
	/**
	 * Imageファイルアップロード
	 */
	public function sendImgDataAction(){
		$form = $this->_getAllParams();
		// 操作ログ
		$this->setLog("共通処理_Imageファイルをサーバー保存", json_encode($form));
		// モデル宣言
		$commonModel = Application_CommonUtil::getInstance("model", "CommonModel", $this->db);
		$imgData = $commonModel->saveImgData($form);
		// 非同期通信なのでechoで画面にデータを返す
		echo $imgData;
		exit;
	}

	/**
	 * Imageファイルアップロード
	 */
	public function sendNamecardImgDataAction(){
		$form = $this->_getAllParams();
		// 操作ログ
		$this->setLog("共通処理_Imageファイルをサーバー保存", json_encode($form));
		// モデル宣言
		$commonModel = Application_CommonUtil::getInstance("model", "CommonModel", $this->db);
		$imgData = $commonModel->saveNamecardImgData($form);
		// 非同期通信なのでechoで画面にデータを返す
		echo $imgData;
		exit;
	}
	
	
	/**
	 * 担当者が作成した背景画像を登録する
	 */
	public function saveBodypixImageAction(){
		$form = $this->_getAllParams();
		// MODELの宣言
		$commonModel = Application_CommonUtil::getInstance("model", "CommonModel", $this->db);
		// 背景画像を物理ファイル化し、パスをDBに登録する
		$result = $commonModel->saveBodypixImage($form);
		// 戻り値を返す
		echo json_encode($result);
		exit;
	}

	/**
	 * 担当者が作成した背景画像を削除する
	 */
	public function delBodypixImageAction(){
		$form = $this->_getAllParams();
		// MODELの宣言
		$commonModel = Application_CommonUtil::getInstance("model", "CommonModel", $this->db);
		// 背景画像を物理ファイル化し、パスをDBに登録する
		$result = $commonModel->delBodypixImage($form);
		// 戻り値を返す
		echo json_encode($result);
		exit;
	}
}

