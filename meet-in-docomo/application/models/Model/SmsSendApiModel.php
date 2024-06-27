<?php
// SMS送信用
require_once ROOT.'/vendor/autoload.php';
use Twilio\Rest\Client;

/**
* SMS API用モデル
*/
class SmsSendApiModel extends AbstractModel {

	public function sendSms($form) {
		// Your Account SID and Auth Token from twilio.com/console
		$account_sid = $this->config->smsSendApi->apiKey;
		$auth_token = $this->config->smsSendApi->apiSecret;
		// A Twilio number you own with SMS capabilities
		$twilio_number = $this->config->smsSendApi->twilio_number;

		$client = new Client($account_sid, $auth_token);
		$to = preg_replace( '/^0/', '+81', $form['send_number']); // 送信先番号を国際電話用に編集

			// 戻り値を宣言
		$result = array();

		try {
			$message =
			$client->messages->create(
				$to, // 送信先番号
				array(
					'from' => $twilio_number,
					'body' => $form['send_text'],
				)
			);
			$result['status'] = 'sent';

		} catch (TwilioRestException $e) {
			$result['status'] = 'error';
			error_log($e->getMessage());
		}
		return $result;
  }
}