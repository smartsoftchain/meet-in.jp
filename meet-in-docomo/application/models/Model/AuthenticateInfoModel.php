<?php
require_once ROOT.'library/Application/validation.php';
require_once ROOT.'library/Application/GoogleAuthenticator.php';

/**
 * 二要素認証を行うモデルクラス。
 */
class AuthenticateInfoModel extends AbstractModel {

    private $db;		// DBコネクション

    function __construct($db){
		parent::init();
		$this->db = $db;
	}

    public function init() {

    }

    /**
     * QRコードを表示
     */
    public function getAuthenticate($form) {
        // Dao宣言
        $authenticateInfoDao =  Application_CommonUtil::getInstance('dao', "AuthenticateInfoDao", $this->db);
        // 認証情報を取得
        $condition = "staff_id = ". $form['staff_id'] . " AND staff_type = '". $form['staff_type'] . "'";
        $authInfo = $authenticateInfoDao->find($condition);

        // secretキーを作成
        $ga = new PHPGangsta_GoogleAuthenticator();
        $secret = $ga->createSecret();
        // secretキーを保存
        if ($authInfo) {
            $authInfo[0]["secret_key"] = $secret;
            $authenticateInfoDao->update($authInfo[0], $condition);
        } else {
            $authInfo = $authenticateInfoDao->insert($form, $secret);
        }

        // QRコード作成
        $qrTitle = "meet-in.jp(" . $form["staff_type"] . sprintf('%05d', $form["staff_id"]). ")";
        $authInfo["qrUrl"] = $ga->getQRCodeGoogleUrl($qrTitle, $secret);

        return $authInfo;
    }

    /**
     * QRコード検証
     * googleアプリから送信された６桁のコードを検証する
     * @param unknown $form
     */
    public function verifyCode($form, $req){
        // daoの宣言
        $authenticateInfoDao = Application_CommonUtil::getInstance('dao', "AuthenticateInfoDao", $this->db);
        $verifyCode = $form['verify_code'];

        // 認証情報を取得
        $condition = "staff_id = ". $form['staff_id'] . " AND staff_type = '". $form['staff_type'] . "'";
        $authInfo = $authenticateInfoDao->find($condition);

        if($req->isPost()) {

            $ga = new PHPGangsta_GoogleAuthenticator();
            // MEMO. サーバーとクライアントで許容する時間のずれ
            // $discrepancy × 30秒 許容（デフォルト値は1）
            $discrepancy = 10;
            // 検証
            $checkResult = $ga->verifyCode($authInfo[0]['secret_key'], $verifyCode , $discrepancy);
            if ($checkResult) {
                //認証フラグ
                $authInfo[0]['varify_flg'] = 1;
                //認証カウントをリセット
                $authInfo[0]['acc_cnt'] = 0;
            } else {
                //認証フラグ
                $authInfo[0]['varify_flg'] = 0;
                //認証カウント追加
                $authInfo[0]['acc_cnt'] += 1;
            }

            // 認証情報を更新
            $authenticateInfoDao->update($authInfo[0], $condition);
            return $checkResult;

        }

        return false;
    }

}