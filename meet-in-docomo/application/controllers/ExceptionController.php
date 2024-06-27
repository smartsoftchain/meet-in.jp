<?php
require_once APP_DIR.'/models/Adapter/AuthAdapter.php';

class ExceptionController extends AbstractController
{
	public function init(){
		parent::init();
		/* Initialize action controller here */
	}

	/**
	 * 例外画面表示
	 */
	public function indexAction(){
		$form = $this->_getAllParams();
		$exc_titles = array(
			1 => 'コントローラー不正',
			2 => 'アクション不正',
			3 => 'SQL不正',
			4 => 'その他不正'
		);
		// システム情報収集
		$now = new DateTime();
		$systeminfo[] = '<tr><td class="mi_tabel_title">REQUEST_TIME</td><td class="mi_tabel_content">' . $now->format('Y-m-d H:i:s') . '</td></tr>';
		$systeminfo[] = '<tr><td class="mi_tabel_title">HTTP_USER_AGENT</td><td class="mi_tabel_content">' . $_SERVER['HTTP_USER_AGENT'] . '</td></tr>';

		if(!empty($form['code'])) {
			$this->view->errorList = $systeminfo;
			$this->view->title = $exc_titles[$form['code']];
		}
		// 操作ログ
		$this->setLog("例外画面表示", json_encode($form));
		
	}

}

