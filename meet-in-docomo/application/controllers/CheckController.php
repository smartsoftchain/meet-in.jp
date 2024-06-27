<?php
require_once APP_DIR.'/models/Adapter/AuthAdapter.php';

class CheckController extends AbstractApiController
{
	public function init(){
		parent::init();
		/* Initialize action controller here */
	}

	public function indexAction(){
		header("Access-Control-Allow-Origin: *");
		echo("");
		exit;
	}
}

