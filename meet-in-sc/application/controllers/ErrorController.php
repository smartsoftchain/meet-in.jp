<?php

class ErrorController extends AbstractController {

	public function indexAction() {
		$form = $this->_getAllParams();
		// 操作ログ
		$this->setLog("エラー", json_encode($form));
		
		$msg = isset($form['msg'])? $form['msg']: '';
		$this->view->errors = array($msg);
	}

	public function notclientAction() {
		
		// 操作ログ
		$this->setLog("クライアント未選択エラー", json_encode($this->_getAllParams()));
	}
	
	public function deadlyAction() {
		
		// 操作ログ
		$this->setLog("利用者画面で致命的なエラー", json_encode($this->_getAllParams()));
	}
	
	public function admindeadlyAction() {
		
		// 操作ログ
		$this->setLog("管理者画面で致命的なエラー", json_encode($this->_getAllParams()));
	}
	
	public function modaldeadlyAction() {
		
		// 操作ログ
		$this->setLog("モーダルで致命的なエラー", json_encode($this->_getAllParams()));
	}
	
	public function invalidIdAction() {
	
		// 操作ログ
		$this->setLog("不正なIDが送信エラー", json_encode($this->_getAllParams()));
	}
}

