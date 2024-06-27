<?php

require_once ROOT.'library/Application/validation.php';

/**
 * 操作ログで使用するモデル
 * @author admin
 *
 */
class OperationLogModel extends AbstractModel{

	const IDENTIFIER = "operation_log";						// セッション変数のnamespace

	private $db;	// DBコネクション
	/**
	 * コンストラクタ
	 *
	 * @param unknown $db
	 */
	function __construct($db){
		$this->db = $db;

		parent::init();
	}

	/**
	* activeなroomを条件ごとに取得する
	* @return active_room
	*/
	public function getActiveRoom($form, $pageCount){
		$user = $this->user;
		$condition = " a.client_id = '{$user["client_id"]}' AND action_name = 'ルーム入室・作成'";
		if($user["staff_type"]!="AA"){
			$condition .= " AND staff_type = 'CE'";
		}
	
		// daoの宣言
		$logDao = Application_CommonUtil::getInstance('dao', "LogDao", $this->db);
		// ダッシュボードのログ出力
		$limit = 1000;
		$uniqueActiveRoomNameArray = [];
		$roomUseNames = [];
		$LogDashBord = $logDao->getLogDashBord($condition,$limit);

		foreach ($LogDashBord as $key => $value) {
			$sendJsonData = json_decode($value["send_data"],true);
			if (!in_array($sendJsonData["room_name"], $roomUseNames,true) && $sendJsonData["room_name"]!="null") {
				// room名(roomの重複をなくすために必要=>取得用ではなく条件分岐用)
				array_push($roomUseNames, $sendJsonData["room_name"]);
			}
		}

		$length = 1000;
		for($offset = 0; $offset < count($roomUseNames); $offset=$offset+$length){
			$slice_array = array_slice($roomUseNames, $offset, $length);
			$condition = " a1.room_name in ('".implode("','", $slice_array)."')";
			$activeRooms = $logDao->getActiveRoom($condition);
			foreach ($activeRooms as $key => $activeRoom) {
				// 重複、nullがあるものは除外
				if(!in_array($activeRoom["room_name"],$uniqueActiveRoomNameArray,true) && !empty($activeRoom["room_name"])){
					// user_peer_id_がnullではないもの(=アクティブなroom)を取得
					if($activeRoom["user_peer_id_1"]!=="X"&&$activeRoom["user_peer_id_2"]!=="X"&&$activeRoom["user_peer_id_3"]!=="X"&&$activeRoom["user_peer_id_4"]!=="X"&&$activeRoom["user_peer_id_5"]!=="X"&&$activeRoom["user_peer_id_6"]!=="X"&&$activeRoom["user_peer_id_7"]!=="X"&&$activeRoom["user_peer_id_8"]!=="X"){
						if(!is_null($activeRoom["user_peer_id_1"])||!is_null($activeRoom["user_peer_id_2"])||!is_null($activeRoom["user_peer_id_3"])||!is_null($activeRoom["user_peer_id_4"])||!is_null($activeRoom["user_peer_id_5"])||!is_null($activeRoom["user_peer_id_6"])||!is_null($activeRoom["user_peer_id_7"])||!is_null($activeRoom["user_peer_id_8"])){
							array_push($uniqueActiveRoomNameArray,$activeRoom["room_name"]);
						}
					}
				}
			}
		}

		if($pageCount == 1){
			$sortList = array_slice($uniqueActiveRoomNameArray, 0 , 5);
		}else{
			$sortList = array_slice($uniqueActiveRoomNameArray, 5*($pageCount-1) , 5);
		}
		// ソート前のデータ数も返す
		$dataLength = count($uniqueActiveRoomNameArray);

		return [$sortList, $dataLength];
	}

	/**
	* activeなroomを選別する
	* @return active_room
	*/
	public function getSortActiveRoomData($data, $uniqueActiveRoomNameArray){
		// daoの宣言
		$logDao = Application_CommonUtil::getInstance('dao', "LogDao", $this->db);

		if($data["action_name"] == "ルーム入室・作成"){
			// アクティブなroomの取得
			$sendJsonData = json_decode($data["send_data"],true);
			$activeRoom = $logDao->getActiveRoom($sendJsonData["room_name"]);
			// 重複、nullがあるものは除外
			if(!in_array($activeRoom[0]["room_name"],$uniqueActiveRoomNameArray,true) && !empty($activeRoom[0]["room_name"])){
				// user_peer_id_がnullではないもの(=アクティブなroom)を取得
				if($activeRoom[0]["user_peer_id_1"]!=="X"&&$activeRoom[0]["user_peer_id_2"]!=="X"&&$activeRoom[0]["user_peer_id_3"]!=="X"&&$activeRoom[0]["user_peer_id_4"]!=="X"&&$activeRoom[0]["user_peer_id_5"]!=="X"&&$activeRoom[0]["user_peer_id_6"]!=="X"&&$activeRoom[0]["user_peer_id_7"]!=="X"&&$activeRoom[0]["user_peer_id_8"]!=="X"){
					if(!is_null($activeRoom[0]["user_peer_id_1"])||!is_null($activeRoom[0]["user_peer_id_2"])||!is_null($activeRoom[0]["user_peer_id_3"])||!is_null($activeRoom[0]["user_peer_id_4"])||!is_null($activeRoom[0]["user_peer_id_5"])||!is_null($activeRoom[0]["user_peer_id_6"])||!is_null($activeRoom[0]["user_peer_id_7"])||!is_null($activeRoom[0]["user_peer_id_8"])){
						return $activeRoom[0]["room_name"];
					}
				}
			}
		}
	}

	/**
	 * インクリメンタルサーチ
	 */
	public function getAccountName($keyword) {
		$user = $this->user["client_id"];
		$condition = "client_id = '{$user}'";
		// daoの宣言
		$logDao = Application_CommonUtil::getInstance('dao', "LogDao", $this->db);
		$accountName = $logDao->getAccountName($keyword,$condition);
		foreach($accountName as $key => $account){
			$accountName[$key]["staff_id"] = sprintf('%05d', $account["staff_id"]);
		}
		return $accountName;
	}
	
	/**
	 * 機能別の利用状況を集計
	 * @return Application_Pager
	 */
	public function getEachFunctionLog($form){
		$user = $this->user;
		$actionName = "ルーム入室・作成";
		$condition = $this->setClientLogCondition($form["start_period_date"], $form["end_period_date"], "create_time", $user["client_id"], $form["select_user_data"], $actionName);
		$conditionActionCount = $this->setClientLogCondition($form["start_period_date"], $form["end_period_date"], "create_time", $user["client_id"], $form["select_user_data"]);
		// daoの宣言
		$logDao = Application_CommonUtil::getInstance('dao', "LogDao", $this->db);
		// ダッシュボードのログ出力
		$LogDashBord = $logDao->getLogDashBordLastData($condition);
		$LogDashBordActionCount = $logDao->getLogDashBordActionCount($conditionActionCount);
		
		$lists = [];
		$roomUseNames = [];
		$title = ['機能名','使用回数'];
		array_push($lists, $title);
		$roomUseCount = 0;
		$useLogTotalTime = 0;
		$roomUseAmountTime = 0;
		$eContractCount = 0;
		$audioTextCount = 0;
		$shareScreenCount = 0;
		$shareMemoCount = 0;
		$whiteBoardCount = 0;
		$chatBoardCount = 0;
		$secretMemoCount = 0;
		$screenCapture = 0;
		$recordingCount = 0;

		foreach ($LogDashBord as $key => $value) {
			// room使用回数、時間を取得
			// アクティブなroomの取得
			$sendJsonData = json_decode($value["send_data"], true);

			// 重複、nullがあるものは除外
			if (!in_array($sendJsonData["room_name"], $roomUseNames,true) && $sendJsonData["room_name"]!="null") {
				// room名(roomの重複をなくすために必要=>取得用ではなく条件分岐用)
				array_push($roomUseNames, $sendJsonData["room_name"]);
			}

		}

		$length = 1000;
		for($offset = 0; $offset < count($roomUseNames); $offset=$offset+$length){
			$slice_array = array_slice($roomUseNames, $offset, $length);
			// 作成日が指定期間内かを条件にする
			$useRoomCountCondition = $this->setUseRoomCountCondition($form["start_period_date"], $form["end_period_date"], "create_date", $user["client_id"], $slice_array, $form["select_user_data"], true);
			// roomの使用回数を取得
			$getRoomUseCount = $logDao->getRoomUseCount($useRoomCountCondition);
			$count = count($getRoomUseCount);

			// 同room名がある場合は別処理
			if ($count > 0) {
				foreach ($getRoomUseCount as $roomData) {
					$roomUseCount++;
					$useLogTotalTime = strtotime($roomData["etime"]) - strtotime($roomData["stime"]);
					$roomUseAmountTimes += $useLogTotalTime;
				}
			}
			
		}

		foreach ($LogDashBordActionCount as $key => $value) {
			// 画面共有した回数をカウント
			if($value["action_name"]=="画面共有を使用"){
				$shareScreenCount = $value["action_count"];
			}
			// 共有メモした回数をカウント
			if($value["action_name"]=="共有メモを使用"){
				$shareMemoCount = $value["action_count"];
			}
			// ホワイトボードを起動した回数をカウント
			if($value["action_name"]=="ホワイトボードを使用"){
				$whiteBoardCount = $value["action_count"];
			}
			// 画面キャプチャを起動した回数をカウント
			if($value["action_name"]=="画面キャプチャを使用"){
				$screenCapture = $value["action_count"];
			}
			// 文字起こしの時間を取得
			if($value["action_name"]=="文字起こしの時間"){
				$audioTextCount = $value["action_count"];
			}
			// チャットを起動した回数をカウント
			if($value["action_name"]=="チャットを使用"){
				$chatBoardCount = $value["action_count"];
			}
			// シークレットメモを起動した回数をカウント
			if($value["action_name"]=="シークレットメモを使用"){
				$secretMemoCount = $value["action_count"];
			}
			// 電子契約した回数をカウント
			if($value["action_name"]=="電子契約 契約完了画面"){
				$eContractCount = $value["action_count"];
			}
			// 録画を使用した回数をカウント
			if($value["action_name"]=="録画を使用"){
				$recordingCount = $value["action_count"];
			}
		}
		// 全roomの接続時間合計を時間表記に変更
		$roomUseAmountTime = floor($roomUseAmountTimes / 3600);

		// ウェビナーの回数をカウント
		$webinarCondition = $this->setClientLogCondition($form["start_period_date"], $form["end_period_date"], "create_date", $user["client_id"], $form["select_user_data"]);
		$webinarLogCount = $logDao->getLogWebinarCount($webinarCondition);
		$webinarLogCountNum = $webinarLogCount==NULL  ? 0 : $webinarLogCount;

		array_push($lists,["画面共有",$shareScreenCount."回"],["共有メモ",$secretMemoCount."回"],["ホワイトボード",$whiteBoardCount."回"],["画面キャプチャ",$screenCapture."回"],["文字起こし",$audioTextCount."回"],["チャット",$chatBoardCount."回"],["シークレットメモ",$secretMemoCount."回"],["電子契約：契約完了",$secretMemoCount."回"],["ウェビナー",$webinarLogCountNum."回"],["録画",$recordingCount."回"]);

		$result["roomUseCount"] = $roomUseCount;
		$result["roomUseAmountTime"] = $roomUseAmountTime;
		$result["pagerLists"] = [];
		$result["lists"] = $lists;

		return $result;
	}

	/**
	 * 曜日別の利用状況を集計
	 * @return Application_Pager
	 */
	public function getEachDayOfWeekLog($form){
		$user = $this->user;
		$actionName = "ルーム入室・作成";
		$condition = $this->setClientLogCondition($form["start_period_date"], $form["end_period_date"], "create_time", $user["client_id"], $form["select_user_data"], $actionName);
		// daoの宣言
		$logDao = Application_CommonUtil::getInstance('dao', "LogDao", $this->db);
		// ダッシュボードのログ出力
		$LogDashBord = $logDao->getLogDashBordLastData($condition);

		$roomUseCount = 0;
		$unpreparedLists = [];
		$roomUseNames = [];
		$weekOfDayArray = [];
		$useLogTotalTime = 0;
		$roomUseAmountTime = 0;

		foreach ($LogDashBord as $key => $value){
			// room使用回数、時間を取得
			// アクティブなroomの取得
			$sendJsonData = json_decode($value["send_data"],true);

			// 重複、nullがあるものは除外
			if(!in_array($sendJsonData["room_name"],$roomUseNames,true) && $sendJsonData["room_name"]!="null"){
				// room名(roomの重複をなくすために必要=>取得用ではなく条件分岐用)
				array_push($roomUseNames,$sendJsonData["room_name"]);
			}
		}

		$length = 1000;
		for($offset = 0; $offset < count($roomUseNames); $offset=$offset+$length){
			$slice_array = array_slice($roomUseNames, $offset, $length);
			// 作成日が指定期間内かを条件にする
			$useRoomCountCondition = $this->setUseRoomCountCondition($form["start_period_date"], $form["end_period_date"], "create_date", $user["client_id"], $slice_array, $form["select_user_data"], true);
			// roomの使用回数を取得
			$getRoomUseCount = $logDao->getRoomUseCount($useRoomCountCondition);
			$count = count($getRoomUseCount);

			// 同room名がある場合は別処理
			if($count > 0){
				foreach($getRoomUseCount as $roomData){
					$roomUseCount++;
					$date = substr($roomData["stime"],0,10);
					$strDate = str_replace('-', '', $date);
					// 日付の曜日を取得
					$weekOfDay = date('w', strtotime($strDate));
					//配列を使用し、要素順に(日:0〜土:6)を設定する
					$week = ['日','月','火','水','木','金','土',];

					$useLogTotalTime = strtotime($roomData["etime"]) - strtotime($roomData["stime"]);
					$roomUseAmountTimes += $useLogTotalTime;

					array_push($unpreparedLists,[$week[$weekOfDay],$useLogTotalTime]);
				}
			}
		}

		// 整形後の曜日配列
		$lists = $this->arrangeEachDayOfWeek($unpreparedLists);
		// 全roomの接続時間合計を時間表記に変更
		$roomUseAmountTime = floor($roomUseAmountTimes / 3600);
		$result["roomUseCount"] = $roomUseCount;
		$result["roomUseAmountTime"] = $roomUseAmountTime;
		$result["pagerLists"] = [];
		$result["lists"] = $lists;

		return $result;
	}

	/**
	* 時間を整形する
	* @return Application_Pager
	*/
	public function arrangeUseTime($time){
		$roomUseHours = sprintf('%02d', floor($time / 3600));
		$roomUseMinutes = sprintf('%02d', floor(($time / 60 ) % 60));
		$roomUseSeconds = sprintf('%02d', $time % 60);
		$useLogArrangeTotalTime = $roomUseHours.":".$roomUseMinutes.":".$roomUseSeconds;
		return $useLogArrangeTotalTime;
	}

	/**
	* 曜日の配列を整形する
	* @return Application_Pager
	*/
	public function arrangeEachDayOfWeek($lists){
		$monday = 0;
		$mondayUseTime = 0;
		$tuesday = 0;
		$tuesdayUseTime = 0;
		$wednesday = 0;
		$wednesdayUseTime = 0;
		$thursday = 0;
		$thursdayUseTime = 0;
		$friday = 0;
		$fridayUseTime = 0;
		$saturday = 0;
		$saturdayUseTime = 0;
		$sunday = 0;
		$sundayUseTime = 0;
		$week = [[], [], [], [], [], [], []];

		foreach($lists as $key => $value){
			switch($value[0]) {
				case "月":
					$monday++;
					$mondayUseTime += $value[1];
					break;
	
				case "火":
					$tuesday++;
					$tuesdayUseTime += $value[1];
					break;
	
				case "水":
					$wednesday++;
					$wednesdayUseTime += $value[1];
					break;
	
				case "木":
					$thursday++;
					$thursdayUseTime += $value[1];
					break;
	
				case "金":
					$friday++;
					$fridayUseTime += $value[1];
					break;
	
				case "土":
					$saturday++;
					$saturdayUseTime += $value[1];
					break;
	
				case "日":
					$sunday++;
					$sundayUseTime += $value[1];
					break;
			}
		}

		array_push($week["0"],"月",$monday."回",$this->arrangeUseTime($mondayUseTime));
		array_push($week["1"],"火",$tuesday."回",$this->arrangeUseTime($tuesdayUseTime));
		array_push($week["2"],"水",$wednesday."回",$this->arrangeUseTime($wednesdayUseTime));
		array_push($week["3"],"木",$thursday."回",$this->arrangeUseTime($thursdayUseTime));
		array_push($week["4"],"金",$friday."回",$this->arrangeUseTime($fridayUseTime));
		array_push($week["5"],"土",$saturday."回",$this->arrangeUseTime($saturdayUseTime));
		array_push($week["6"],"日",$sunday."回",$this->arrangeUseTime($sundayUseTime));
		$title = ['曜日','接続回数','接続時間'];
		array_unshift($week, $title);

		return $week;
	}

	/**
	* ログ取得時の期間の条件作成(business_discussion_resultテーブル)
	* @return Application_Pager
	*/
	public function setUseRoomCountCondition($formStartDate, $formEndDate, $createTime, $clientId, $roomNames, $userNames, $eTimeNotNullFlg = false){
		// 日付の形に整形
		$startDate = date('Y-m-d', strtotime($formStartDate));
		$endDate = date('Y-m-d', strtotime($formEndDate));
		$staffType = $this->user["staff_type"];

		// ここで期間の指定がなければその月分(1ヶ月)のデータを返す => ある場合は$selectionPeriodに期間の指定を行う
		if($formStartDate&&$formEndDate){
			$startDate = $startDate." 00:00:00";
			$endDate = $endDate." 23:59:59";
			$selectionPeriod = "AND $createTime BETWEEN '{$startDate}' AND '{$endDate}'";
		}else{
			$selectionPeriod = "AND DATE_FORMAT($createTime, '%Y%m') = DATE_FORMAT(NOW(), '%Y%m')";
		}

		// ユーザーの指定がなければクライアント全てのデータを返す => ある場合は$selectionUserに期間の指定を行う
		$staffTypeAndId;
		if($userNames){
			$masterStaffDao = Application_CommonUtil::getInstance('dao', "MasterStaffDao", $this->db);
			$length = count($userNames);
			$num = 1;

			foreach($userNames as $userName){
				// 取得した氏名を暗号化
				$staffName = new Zend_Db_Expr("AES_ENCRYPT('$userName', @key)");
				$getStaffCondition = "staff_name = AES_ENCRYPT({$this->db->quote("{$userName}")}, @key)";

				// type、idを取得
				$uniqueStaffIdentification = $masterStaffDao->getUniqueStaffIdentification($getStaffCondition);
				$staffTypeAndId .= "(staff_type = ";
				$staffTypeAndId .= "'".$uniqueStaffIdentification[0]["staff_type"]."'";
				$staffTypeAndId .= " AND ";
				$staffTypeAndId .= "staff_id =";
				$staffTypeAndId .= "'".$uniqueStaffIdentification[0]['staff_id']."'";
				$staffTypeAndId .= ")";

				// 最後のループは除外
				if($num != $length){
					$staffTypeAndId .= " OR ";
				}
				$num++;
			}
	
			// ここに文字列結合した文字列を入れる
			$selectionUser = "AND " . "(". $staffTypeAndId . ")";
			
		}else{
			$selectionUser = "";
		}

		if ($eTimeNotNullFlg){
			$selectionETime = " AND etime IS NOT NULL";
		}else{
			$selectionETime = "";
		}

		if (count($roomNames) >0){
			$selectionRoomName = " AND room_name in ('".implode("','", $roomNames)."')";
		}else{
			$selectionRoomName = "";
		}
		if($staffType == "AA"){
			$condition = " client_id = '{$clientId}' $selectionRoomName $selectionPeriod $selectionUser $selectionETime";
		}else if($staffType == "CE"){
			$condition = " client_id = '{$clientId}' AND staff_type = 'CE' $selectionRoomName $selectionPeriod $selectionUser $selectionETime";
		}

		return $condition;
	}

	/**
	* 資料取得時の期間の条件作成(master_basicテーブル)
	* @return Application_Pager
	*/
	public function setMaterialCondition($formStartDate, $formEndDate, $createTime, $clientId, $userNames){
		// 日付の形に整形
		$startDate = date('Y-m-d', strtotime($formStartDate));
		$endDate = date('Y-m-d', strtotime($formEndDate));
		$staffType = $this->user["staff_type"];

		// 期間の指定がなければその月分(1ヶ月)のデータを返す => ある場合は$selectionPeriodに期間の指定を行う
		if($formStartDate&&$formEndDate){
			$startDate = $startDate." 00:00:00";
			$endDate = $endDate." 23:59:59";
			$selectionPeriod = "AND $createTime BETWEEN '{$startDate}' AND '{$endDate}'";
		}else{
			$selectionPeriod = "AND DATE_FORMAT($createTime, '%Y%m') = DATE_FORMAT(NOW(), '%Y%m')";
		}

		// ユーザーの指定がなければクライアント全てのデータを返す => ある場合は$selectionUserに期間の指定を行う
		$staffTypeAndId;
		if($userNames){
			$masterStaffDao = Application_CommonUtil::getInstance('dao', "MasterStaffDao", $this->db);
			$length = count($userNames);
			$num = 1;
			foreach($userNames as $userName){
				// 取得した氏名を暗号化
				$staffName = new Zend_Db_Expr("AES_ENCRYPT('$userName', @key)");
				$getStaffCondition = "staff_name = AES_ENCRYPT({$this->db->quote("{$userName}")}, @key)";

				// type、idを取得
				$uniqueStaffIdentification = $masterStaffDao->getUniqueStaffIdentification($getStaffCondition);
				$staffTypeAndId .= "(create_staff_type = ";
				$staffTypeAndId .= "'".$uniqueStaffIdentification[0]["staff_type"]."'";
				$staffTypeAndId .= " AND ";
				$staffTypeAndId .= "create_staff_id =";
				$staffTypeAndId .= "'".$uniqueStaffIdentification[0]['staff_id']."'";
				$staffTypeAndId .= ")";

				// 最後のループは除外
				if($num != $length){
					$staffTypeAndId .= " OR ";
				}
				$num++;
			}
			// ここに文字列結合した文字列を入れる
			$selectionUser = "AND " . "(". $staffTypeAndId . ")";
			
		}else{
			$selectionUser = "";
		}

		if($staffType == "AA"){
			$condition = " a.client_id = '{$clientId}' $selectionPeriod $selectionUser";
		}else if($staffType == "CE"){
			$condition = " a.client_id = '{$clientId}' AND a.create_staff_type = 'CE' $selectionPeriod $selectionUser";
		}


		return $condition;
	}

	/**
	* ログ取得時の期間の条件作成(logテーブル)
	* @return Application_Pager
	*/
	public function setClientLogCondition($formStartDate, $formEndDate, $createTime, $clientId, $userNames,$actionName = null){
		// 日付の形に整形
		$startDate = date('Y-m-d', strtotime($formStartDate));
		$endDate = date('Y-m-d', strtotime($formEndDate));
		$staffType = $this->user["staff_type"];

		// 期間の指定がなければその月分(1ヶ月)のデータを返す => ある場合は$selectionPeriodに期間の指定を行う
		if($formStartDate&&$formEndDate){
			$startDate = $startDate." 00:00:00";
			$endDate = $endDate." 23:59:59";
			$selectionPeriod = "AND $createTime BETWEEN '{$startDate}' AND '{$endDate}'";
		}else{
			$selectionPeriod = "AND DATE_FORMAT($createTime, '%Y%m') = DATE_FORMAT(NOW(), '%Y%m')";
		}

		// ユーザーの指定がなければクライアント全てのデータを返す => ある場合は$selectionUserに期間の指定を行う
		$staffTypeAndId;
		if($userNames){
			$masterStaffDao = Application_CommonUtil::getInstance('dao', "MasterStaffDao", $this->db);
			$length = count($userNames);
			$num = 1;
			foreach($userNames as $userName){
				// 取得した氏名を暗号化
				$staffName = new Zend_Db_Expr("AES_ENCRYPT('$userName', @key)");
				$getStaffCondition = "staff_name = AES_ENCRYPT({$this->db->quote("{$userName}")}, @key)";

				// type、idを取得
				$uniqueStaffIdentification = $masterStaffDao->getUniqueStaffIdentification($getStaffCondition);
				$staffTypeAndId .= "(staff_type = ";
				$staffTypeAndId .= "'".$uniqueStaffIdentification[0]["staff_type"]."'";
				$staffTypeAndId .= " AND ";
				$staffTypeAndId .= "staff_id =";
				$staffTypeAndId .= "'".$uniqueStaffIdentification[0]['staff_id']."'";
				$staffTypeAndId .= ")";

				// 最後のループは除外
				if($num != $length){
					$staffTypeAndId .= " OR ";
				}
				$num++;
			}
			// ここに文字列結合した文字列を入れる
			$selectionUser = "AND " . "(". $staffTypeAndId . ")";
			
		}else{
			$selectionUser = "";
		}

		if ($actionName){
			$selectionActionName = "AND action_name = '{$actionName}' ";
		}else{
			$selectionActionName = "";
		}

		if($staffType == "AA"){
			$condition = " a.client_id = '{$clientId}' $selectionPeriod $selectionUser $selectionActionName";
		}else if($staffType == "CE"){
			$condition = " a.client_id = '{$clientId}' AND a.staff_type = 'CE' $selectionPeriod $selectionUser $selectionActionName";
		}

		return $condition;
	}

	/**
	 * room別の利用状況を集計
	 * @return Application_Pager
	 */
	public function getEachUseRoomLog($form, $pageCount){
		$user = $this->user;
		$actionName = "ルーム入室・作成";
		$condition = $this->setClientLogCondition($form["start_period_date"], $form["end_period_date"], "create_time", $user["client_id"], $form["select_user_data"], $actionName);

		// daoの宣言
		$logDao = Application_CommonUtil::getInstance('dao', "LogDao", $this->db);
		$masterStaffDao = Application_CommonUtil::getInstance('dao', "MasterStaffDao", $this->db);
		// ダッシュボードのログ出力
		$LogDashBord = $logDao->getLogDashBordLastData($condition);

		$roomUseCount = 0;
		$useLogTotalTime = 0;
		$roomUseAmountTime = 0;
		$roomUseNames = [];
		$roomUseCounts = [];
		$createDates = [];
		$lists = [];

		foreach ($LogDashBord as $key => $value) {
			// roomにログインした回数をカウント
			$sendJsonData = json_decode($value["send_data"],true);

			// nullがあるものは除外
			if(!in_array($sendJsonData["room_name"],$roomUseNames,true) && $sendJsonData["room_name"]!="null"){
				// room名(roomの重複をなくすために必要=>取得用ではなく条件分岐用)
				array_push($roomUseNames,$sendJsonData["room_name"]);
				array_push($roomUseCounts,0);
				array_push($createDates,$value["create_date"]);
			}
		}
		$length = 1000;
		for($offset = 0; $offset < count($roomUseNames); $offset=$offset+$length){
			$slice_array = array_slice($roomUseNames, $offset, $length);
			// 作成日が指定期間内かを条件にする
			$useRoomCountCondition = $this->setUseRoomCountCondition($form["start_period_date"], $form["end_period_date"], "create_date", $user["client_id"], $slice_array, $form["select_user_data"], true);
			// roomの使用回数を取得
			$getRoomUseCount = $logDao->getRoomUseCount($useRoomCountCondition);
			$count = count($getRoomUseCount);

			if($count > 0){
				foreach($getRoomUseCount as $roomData){
					$roomUseCount++;
					$useLogTotalTime = strtotime($roomData["etime"]) - strtotime($roomData["stime"]);
					// 全roomの接続時間合計
					$roomUseAmountTimes += $useLogTotalTime;
					$key = array_search($roomData["room_name"], $roomUseNames);
					$roomUseCounts[$key] = $roomUseCounts[$key] + 1;
				}
				foreach ($roomUseNames as $key => $roomUseName) {
					if ($roomUseCounts[$key] > 0){
						array_push($lists,[$roomUseName, $roomUseCounts[$key]."回", "https://meet-in.jp/room/".$roomUseName,str_replace("-", ".", $createDates[$key])]);
					}
				}
			}
		}
	
		$date = []; 
		foreach($lists as $key => $row) {
			$date[$key] = $row[3];
		}
		array_multisort($date, SORT_DESC, $lists);
		$title = ['ルーム名','接続回数','URL','作成日'];
		// 全roomの接続時間合計を時間表記に変更
		$roomUseAmountTime = floor($roomUseAmountTimes / 3600);
		$result["roomUseCount"] = $roomUseCount;
		$result["roomUseAmountTime"] = $roomUseAmountTime;
		$result["pagerLists"] = $lists;
		if($pageCount == 1){
			$sortList = array_slice($lists, $pageCount-1 , 20);
			array_unshift($sortList, $title);
		}else if($pageCount == NULL){
			$sortList = array_slice($lists, 0 , 20);
			array_unshift($sortList, $title);
		}else{
			$sortList = array_slice($lists, (20*$pageCount)-20 , 20);
			array_unshift($sortList, $title);
		}
		$result["lists"] = $sortList;

		return $result;
	}

	/**
	 * 接続時間帯別の利用状況を集計
	 * @return Application_Pager
	 */
	public function getEachConnectionTimeZoneLog($form, $timeZone, $pageCount){
		$user = $this->user;
		$actionName = "ルーム入室・作成";
		$condition = $this->setClientLogCondition($form["start_period_date"], $form["end_period_date"], "create_time", $user["client_id"], $form["select_user_data"], $actionName);

		// daoの宣言
		$logDao = Application_CommonUtil::getInstance('dao', "LogDao", $this->db);
		$masterStaffDao = Application_CommonUtil::getInstance('dao', "MasterStaffDao", $this->db);
		// ダッシュボードのログ出力
		$LogDashBord = $logDao->getLogDashBordLastData($condition);

		$roomUseCount = 0;
		$useLogTotalTime = 0;
		$roomUseAmountTime = 0;
		$roomUseNames = [];
		$lists = [];
		$unpreparedLists = [];

		foreach ($LogDashBord as $key => $value) {

			// roomにログインした回数をカウント
			// アクティブなroomの取得
			$sendJsonData = json_decode($value["send_data"],true);

			// 重複、nullがあるものは除外
			if(!in_array($sendJsonData["room_name"],$roomUseNames,true) && $sendJsonData["room_name"]!="null"){
				// room名(roomの重複をなくすために必要=>取得用ではなく条件分岐用)
				array_push($roomUseNames,$sendJsonData["room_name"]);
			}
		}
		$length = 1000;
		for($offset = 0; $offset < count($roomUseNames); $offset=$offset+$length){
			$slice_array = array_slice($roomUseNames, $offset, $length);
			// 作成日が指定期間内かを条件にする
			$useRoomCountCondition = $this->setUseRoomCountCondition($form["start_period_date"], $form["end_period_date"], "create_date", $user["client_id"], $slice_array, $form["select_user_data"], true);
			// roomの使用回数を取得
			$getRoomUseCount = $logDao->getRoomUseCount($useRoomCountCondition);
			$count = count($getRoomUseCount);

			if($count > 0){
				foreach($getRoomUseCount as $roomData){
					$roomUseCount++;
					$useLogTotalTime = strtotime($roomData["etime"]) - strtotime($roomData["stime"]);
					$roomUseAmountTimes += $useLogTotalTime;
					array_push($unpreparedLists,[$roomData["room_name"], $roomData["stime"], $useLogTotalTime]);
				}
			}
		}
	
		$date = []; 
		foreach($unpreparedLists as $key => $row) {
			$date[$key] = $row[1];
		}
		array_multisort($date, SORT_DESC, $unpreparedLists);

		switch($timeZone) {
			case "timeZone":
				// 接続時間帯別
				$lists = $this->arrangeEachTimeZoneLists($unpreparedLists);
				$title = ['時間帯','接続回数','接続時間'];
				array_unshift($lists, $title);
		
				$result["pagerLists"] = [];
				$result["lists"] = $lists;
				break;

			case "day":
				// 日
				$lists = $this->arrangeEachPeriodLists($unpreparedLists, 10);
				$result = $this->setdayOfPagerAndLists($lists, $pageCount);
				break;

			case "week":
				// 週
				$lists = $this->arrangeEachWeekLists($unpreparedLists);
				$result = $this->setdayOfPagerAndLists($lists, $pageCount);
				break;

			case "month":
				// 月
				$lists = $this->arrangeEachPeriodLists($unpreparedLists, 7);
				$result = $this->setdayOfPagerAndLists($lists, $pageCount);
				break;
		}

		// 全roomの接続時間合計を時間表記に変更
		$roomUseAmountTime = floor($roomUseAmountTimes / 3600);
		$result["roomUseCount"] = $roomUseCount;
		$result["roomUseAmountTime"] = $roomUseAmountTime;

		return $result;
	}

	/**
	* 日、週、月のページャと表示配列を返す
	*/
	function setdayOfPagerAndLists($lists, $pageCount){
		$title = ['時間帯','接続回数','接続時間'];

		$result["pagerLists"] = $lists;
		if($pageCount == 1){
			$sortList = array_slice($lists, $pageCount-1 , 20);
			array_unshift($sortList, $title);
		}else if($pageCount == NULL){
			$sortList = array_slice($lists, 0 , 20);
			array_unshift($sortList, $title);
		}else{
			$sortList = array_slice($lists, (20*$pageCount)-20 , 20);
			array_unshift($sortList, $title);
		}
		$result["lists"] = $sortList;
		return $result;
	}

	/**
	* 指定された日付の該当する開始日、終了日を取得
	*/
	function getWeekStartAndEndDate($checkData){
	  $result = array(
		'startDate' => null,
		'endDate' => null,
	  );
	
	  $weekNo = date('w', strtotime($checkData));
	  // 週の初めの年月日を取得
	  $result['startDate'] = date('Y-m-d', strtotime("-{$weekNo} day", strtotime($checkData)));
	
	  // 週の最後の年月日を取得
	  $daysLeft = 6 - $weekNo;
	  $result['endDate'] = date('Y-m-d', strtotime("+{$daysLeft} day", strtotime($checkData)));
	
	  return $result;
	}

	/**
	* 使用週ごとに別の配列に整形する
	* @return Application_Pager
	*/
	public function arrangeEachWeekLists($lists){
		$useDayLists = [];
		$useDateLists = [];
		$list = [];

		foreach($lists as $key => $value){
			$date = substr($value[1],0,10);
			$weekSelectDate = $this->getWeekStartAndEndDate($date);
			array_push($useDayLists,[$weekSelectDate["startDate"]."~".$weekSelectDate["endDate"], $value[2]]);
			array_push($useDateLists,$weekSelectDate["startDate"]."~".$weekSelectDate["endDate"]);	
		}

		// keyのみの配列を回し、使用週の配列を作成
		$keys = array_values(array_unique(array_column($useDayLists,0)));
		foreach($keys as $value){
			$num = 0;
			foreach($useDayLists as $row){
				if($row[0]==$value){
					$num = $num+$row[1];
				}
			}
			$total[$value] = $this->arrangeUseTime($num);
		}
		$result = array_count_values($useDateLists);
		// 使用回数、使用時間、使用日の配列を作成
		if($total == NULL){
			$combineData = [];
		}else{
			$combineData = array_merge_recursive($result, $total);
		}

		// 表示できる形に整形
		foreach($combineData as $key => $value){
			$value[0] = $value[0]."回";
			$arrangeKey = str_replace("-", ".", $key);
			array_unshift($value, $arrangeKey);
			array_push($list, $value);
		}

		return $list;
	}

	/**
	* 使用日、月ごとに別の配列に整形する
	* @return Application_Pager
	*/
	public function arrangeEachPeriodLists($lists, $num){
		$useDayLists = [];
		$useDateLists = [];
		$list = [];

		foreach($lists as $key => $value){
			$date = substr($value[1],0,$num);
			array_push($useDayLists,[$date, $value[2]]);
			array_push($useDateLists,$date);
		}

		// keyのみの配列を回し、使用時間、使用日の配列を作成
		$keys = array_values(array_unique(array_column($useDayLists,0)));
		foreach($keys as $value){
			$num = 0;
			foreach($useDayLists as $row){
				if($row[0]==$value){
					$num = $num+$row[1];
				}
			}
			$total[$value] = $this->arrangeUseTime($num);
		}
		$result = array_count_values($useDateLists);
		// 使用回数、使用時間、使用日の配列を作成
		if($total == NULL){
			$combineData = [];
		}else{
			$combineData = array_merge_recursive($result, $total);
		}

		// 表示できる形に整形
		foreach($combineData as $key => $value){
			$value[0] = $value[0]."回";
			$arrangeKey = str_replace("-", ".", $key);
			array_unshift($value, $arrangeKey);
			array_push($list, $value);
		}
		return $list;
	}

	/**
	* 時間帯別の配列に整形する
	* @return Application_Pager
	*/
	public function arrangeEachTimeZoneLists($lists){
		$am7UseCount = 0;
		$am7UseTime = 0;

		$am8UseCount = 0;
		$am8UseTime = 0;

		$am9UseCount = 0;
		$am9UseTime = 0;

		$am10UseCount = 0;
		$am10UseTime = 0;

		$am11UseCount = 0;
		$am11UseTime = 0;
		
		$am12UseCount = 0;
		$am12UseTime = 0;

		$pm13UseCount = 0;
		$pm13UseTime = 0;

		$pm14UseCount = 0;
		$pm14UseTime = 0;

		$pm15UseCount = 0;
		$pm15UseTime = 0;

		$pm16UseCount = 0;
		$pm16UseTime = 0;

		$pm17UseCount = 0;
		$pm17UseTime = 0;

		$pm18UseCount = 0;
		$pm18UseTime = 0;

		$pm19UseCount = 0;
		$pm19UseTime = 0;

		$pm20UseCount = 0;
		$pm20UseTime = 0;

		$pm21UseCount = 0;
		$pm21UseTime = 0;

		$pm22UseCount = 0;
		$pm22UseTime = 0;

		$pm23UseCount = 0;
		$pm23UseTime = 0;

		$pm24UseCount = 0;
		$pm24UseTime = 0;

		$am1UseCount = 0;
		$am1UseTime = 0;

		$am2UseCount = 0;
		$am2UseTime = 0;

		$am3UseCount = 0;
		$am3UseTime = 0;

		$am4UseCount = 0;
		$am4UseTime = 0;

		$am5UseCount = 0;
		$am5UseTime = 0;

		$am6UseCount = 0;
		$am6UseTime = 0;

		$useTimeZone = [[], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []];

		foreach($lists as $key => $value){
			$hour = substr($value[1],11,2);
			switch($hour) {	
				case "07":
					$am7UseCount ++;
					$am7UseTime += $value[2];
					break;
	
				case "08":
					$am8UseCount ++;
					$am8UseTime += $value[2];
					break;
	
				case "09":
					$am9UseCount ++;
					$am9UseTime += $value[2];
					break;
	
				case "10":
					$am10UseCount ++;
					$am10UseTime += $value[2];
					break;
	
				case "11":
					$am11UseCount ++;
					$am11UseTime += $value[2];
					break;
	
				case "12":
					$am12UseCount ++;
					$am12UseTime += $value[2];
					break;

				case "13":
					$pm13UseCount ++;
					$pm13UseTime += $value[2];
					break;
		
				case "14":
					$pm14UseCount ++;
					$pm14UseTime += $value[2];
					break;
	
				case "15":
					$pm15UseCount ++;
					$pm15UseTime += $value[2];
					break;
	
				case "16":
					$pm16UseCount ++;
					$pm16UseTime += $value[2];
					break;
	
				case "17":
					$pm17UseCount ++;
					$pm17UseTime += $value[2];
					break;
	
				case "18":
					$pm18UseCount ++;
					$pm18UseTime += $value[2];
					break;
	
				case "19":
					$pm19UseCount ++;
					$pm19UseTime += $value[2];
					break;

				case "20":
					$pm20UseCount ++;
					$pm20UseTime += $value[2];
					break;
	
				case "21":
					$pm21UseCount ++;
					$pm21UseTime += $value[2];
					break;
	
				case "22":
					$pm22UseCount ++;
					$pm22UseTime += $value[2];
					break;
	
				case "23":
					$pm23UseCount ++;
					$pm23UseTime += $value[2];
					break;
	
				case "24":
					$pm24UseCount ++;
					$pm24UseTime += $value[2];
					break;
	
				case "01":
					$am1UseCount ++;
					$am1UseTime += $value[2];
					break;
	
				case "02":
					$am2UseCount ++;
					$am2UseTime += $value[2];
					break;

				case "03":
					$am3UseCount ++;
					$am3UseTime += $value[2];
					break;
	
				case "04":
					$am4UseCount ++;
					$am4UseTime += $value[2];
					break;
	
				case "05":
					$am5UseCount ++;
					$am5UseTime += $value[2];
					break;

				case "06":
					$am6UseCount ++;
					$am6UseTime += $value[2];
					break;	
			}
		}

		array_push($useTimeZone["0"],"07:00~08:00",$am7UseCount."回",$this->arrangeUseTime($am7UseTime));
		array_push($useTimeZone["1"],"08:00~09:00",$am8UseCount."回",$this->arrangeUseTime($am8UseTime));
		array_push($useTimeZone["2"],"09:00~10:00",$am9UseCount."回",$this->arrangeUseTime($am9UseTime));
		array_push($useTimeZone["3"],"10:00~11:00",$am10UseCount."回",$this->arrangeUseTime($am10UseTime));
		array_push($useTimeZone["4"],"11:00~12:00",$am11UseCount."回",$this->arrangeUseTime($am11UseTime));
		array_push($useTimeZone["5"],"12:00~13:00",$am12UseCount."回",$this->arrangeUseTime($am12UseTime));
		array_push($useTimeZone["6"],"13:00~14:00",$pm13UseCount."回",$this->arrangeUseTime($pm13UseTime));
		array_push($useTimeZone["7"],"14:00~15:00",$pm14UseCount."回",$this->arrangeUseTime($pm14UseTime));
		array_push($useTimeZone["8"],"15:00~16:00",$pm15UseCount."回",$this->arrangeUseTime($pm15UseTime));
		array_push($useTimeZone["9"],"16:00~17:00",$pm16UseCount."回",$this->arrangeUseTime($pm16UseTime));
		array_push($useTimeZone["10"],"17:00~18:00",$pm17UseCount."回",$this->arrangeUseTime($pm17UseTime));
		array_push($useTimeZone["11"],"18:00~19:00",$pm18UseCount."回",$this->arrangeUseTime($pm18UseTime));
		array_push($useTimeZone["12"],"19:00~20:00",$pm19UseCount."回",$this->arrangeUseTime($pm19UseTime));
		array_push($useTimeZone["13"],"20:00~21:00",$pm20UseCount."回",$this->arrangeUseTime($pm20UseTime));
		array_push($useTimeZone["14"],"21:00~22:00",$pm21UseCount."回",$this->arrangeUseTime($pm21UseTime));
		array_push($useTimeZone["15"],"22:00~23:00",$pm22UseCount."回",$this->arrangeUseTime($pm22UseTime));
		array_push($useTimeZone["16"],"23:00~24:00",$pm23UseCount."回",$this->arrangeUseTime($pm23UseTime));
		array_push($useTimeZone["17"],"24:00~01:00",$pm24UseCount."回",$this->arrangeUseTime($pm24UseTime));
		array_push($useTimeZone["18"],"01:00~02:00",$am1UseCount."回",$this->arrangeUseTime($am1UseTime));
		array_push($useTimeZone["19"],"02:00~03:00",$am2UseCount."回",$this->arrangeUseTime($am2UseTime));
		array_push($useTimeZone["20"],"03:00~04:00",$am3UseCount."回",$this->arrangeUseTime($am3UseTime));
		array_push($useTimeZone["21"],"04:00~05:00",$am4UseCount."回",$this->arrangeUseTime($am4UseTime));
		array_push($useTimeZone["22"],"05:00~06:00",$am5UseCount."回",$this->arrangeUseTime($am5UseTime));
		array_push($useTimeZone["23"],"06:00~07:00",$am6UseCount."回",$this->arrangeUseTime($am6UseTime));

		return $useTimeZone;
	}

	/**
	 * 接続時間別の利用状況を集計
	 * @return Application_Pager
	 */
	public function getEachConnectionTimeLog($form, $pageCount){
		$user = $this->user;
		$actionName = "ルーム入室・作成";
		$condition = $this->setClientLogCondition($form["start_period_date"], $form["end_period_date"], "create_time", $user["client_id"], $form["select_user_data"], $actionName);
		// daoの宣言
		$logDao = Application_CommonUtil::getInstance('dao', "LogDao", $this->db);
		$masterStaffDao = Application_CommonUtil::getInstance('dao', "MasterStaffDao", $this->db);
		// ダッシュボードのログ出力
		$LogDashBord = $logDao->getLogDashBordLastData($condition);

		$roomUseCount = 0;
		$useLogTotalTime = 0;
		$roomUseAmountTime = 0;
		$roomUseNames = [];
		$lists = [];
		$title = ['ルーム名', '接続日時', '接続時間', '作成者'];

		foreach ($LogDashBord as $key => $value) {
			// roomにログインした回数をカウント
			// アクティブなroomの取得
			$sendJsonData = json_decode($value["send_data"],true);

			// 重複、nullがあるものは除外
			if(!in_array($sendJsonData["room_name"],$roomUseNames,true) && $sendJsonData["room_name"]!="null"){
				// room名(roomの重複をなくすために必要=>取得用ではなく条件分岐用)
				array_push($roomUseNames,$sendJsonData["room_name"]);
			}
		}

		$length = 1000;
		for($offset = 0; $offset < count($roomUseNames); $offset=$offset+$length){
			$slice_array = array_slice($roomUseNames, $offset, $length);
			// 作成日が指定期間内かを条件にする
			$useRoomCountCondition = $this->setUseRoomCountCondition($form["start_period_date"], $form["end_period_date"], "create_date", $user["client_id"], $slice_array, $form["select_user_data"], true);
			// roomの使用回数を取得
			$getRoomUseCount = $logDao->getRoomUseCount($useRoomCountCondition);
			$count = count($getRoomUseCount);

			// 同room名がある場合は別処理
			if($count > 0){
				foreach($getRoomUseCount as $roomData){
					$roomUseCount++;
					$useLogTotalTime = strtotime($roomData["etime"]) - strtotime($roomData["stime"]);
					$roomUseAmountTimes += $useLogTotalTime;

					// 作成者を取得
					$roomAuthorCondition = "staff_type = '{$roomData["staff_type"]}' AND staff_id = '{$roomData["staff_id"]}'";
					$roomAuthor = $masterStaffDao->getRoomAuthor($roomAuthorCondition);

					// staff_type、staff_id、staff_nameを整形
					$roomAuthorStaffType = sprintf('%05d', $roomAuthor[0]["staff_id"]);
					$roomAuthorName = $roomAuthor[0]["staff_type"].$roomAuthorStaffType.$roomAuthor[0]["staff_name"];
					array_push($lists,[$roomData["room_name"],str_replace("-", ".", $roomData["stime"]),$this->arrangeUseTime($useLogTotalTime),$roomAuthorName]);
				}
			}
		}

		$date = []; 
		foreach($lists as $key => $row) {
			$date[$key] = $row[1];
		}
		array_multisort($date, SORT_DESC, $lists);

		// 全roomの接続時間合計を時間表記に変更
		$roomUseAmountTime = floor($roomUseAmountTimes / 3600);
		$result["roomUseCount"] = $roomUseCount;
		$result["roomUseAmountTime"] = $roomUseAmountTime;
		$result["pagerLists"] = $lists;
		if($pageCount == 1){
			$sortList = array_slice($lists, $pageCount-1 , 20);
			array_unshift($sortList, $title);
		}else if($pageCount == NULL){
			$sortList = array_slice($lists, 0 , 20);
			array_unshift($sortList, $title);
		}else{
			$sortList = array_slice($lists, (20*$pageCount)-20 , 20);
			array_unshift($sortList, $title);
		}
		$result["lists"] = $sortList;
		return $result;
	}

	/**
	 * 資料別のログ取得
	 * @param unknown $form
	 * @return multitype:
	 */
	public function getEachUseMaterialLog($form, $pageCount){
		$user = $this->user;
		$actionNameRoom = "ルーム入室・作成";
		$conditionRoom = $this->setClientLogCondition($form["start_period_date"], $form["end_period_date"], "create_time", $user["client_id"], $form["select_user_data"], $actionNameRoom);
		$actionNameDocShare = "資料共有用のデータ取得";
		$conditionDocShare = $this->setClientLogCondition($form["start_period_date"], $form["end_period_date"], "create_time", $user["client_id"], $form["select_user_data"], $actionNameDocShare);
		// daoの宣言
		$logDao = Application_CommonUtil::getInstance('dao', "LogDao", $this->db);
		// ダッシュボードのログ出力
		$LogDashBordRoom = $logDao->getLogDashBordLastData($conditionRoom);
		$LogDashBordDocShare = $logDao->getLogDashBordLastData($conditionDocShare);

		$roomUseCount = 0;
		$useLogTotalTime = 0;
		$roomUseAmountTime = 0;
		$roomUseNames = [];
		$materialLogIdArray = [];
		$materialLogNameArray = [];
		$lists = [];

		foreach ($LogDashBordRoom as $key => $value) {
			// room使用回数、時間を取得
			// アクティブなroomの取得
			$sendJsonData = json_decode($value["send_data"], true);

			// 重複、nullがあるものは除外
			if (!in_array($sendJsonData["room_name"], $roomUseNames,true) && $sendJsonData["room_name"]!="null") {
				// room名(roomの重複をなくすために必要=>取得用ではなく条件分岐用)
				array_push($roomUseNames, $sendJsonData["room_name"]);
			}
		}
		$length = 1000;
		for($offset = 0; $offset < count($roomUseNames); $offset=$offset+$length){
			$slice_array = array_slice($roomUseNames, $offset, $length);
			// 作成日が指定期間内かを条件にする
			$useRoomCountCondition = $this->setUseRoomCountCondition($form["start_period_date"], $form["end_period_date"], "create_date", $user["client_id"], $slice_array, $form["select_user_data"], true);
			// roomの使用回数を取得
			$getRoomUseCount = $logDao->getRoomUseCount($useRoomCountCondition);
			$count = count($getRoomUseCount);
	
			// 同room名がある場合は別処理
			if ($count > 0) {
				foreach ($getRoomUseCount as $roomData) {
					$roomUseCount++;
					$useLogTotalTime = strtotime($roomData["etime"]) - strtotime($roomData["stime"]);
					$roomUseAmountTimes += $useLogTotalTime;
				}
			}
		}
		foreach ($LogDashBordDocShare as $key => $value) {
			// 使用した資料を取得
			$sendMaterialJson = json_decode($value["send_data"],true);
			if(!is_null($sendMaterialJson["materialId"]) && !in_array($sendMaterialJson["materialId"],$materialLogIdArray,true)){
				array_push($materialLogIdArray,$sendMaterialJson["materialId"]);
			}
		}
		for($offset = 0; $offset < count($materialLogIdArray); $offset=$offset+$length){
			$slice_array = array_slice($materialLogIdArray, $offset, $length);
			$materialIdCondition  = " AND material_id in ('".implode("','", $slice_array)."')";
			$materialCondition = $this->setMaterialCondition($form["start_period_date"], $form["end_period_date"], "create_date", $user["client_id"], $form["select_user_data"]);
					$materialLogNames = $logDao->getLogMaterialList(
						$materialCondition,
						$materialIdCondition
					);
					$materialLogNameArray = array_merge($materialLogNameArray,$materialLogNames);
		}
		// 資料名と回数をカウント
		$materialNameNumArray = array_count_values($materialLogNameArray);
		foreach($materialNameNumArray as $key => $materialLogNameCount){
			array_push($lists,[$key,$materialLogNameCount."回"]);
		}

		// 全roomの接続時間合計を時間表記に変更
		$roomUseAmountTime = floor($roomUseAmountTimes / 3600);
		$result["roomUseCount"] = $roomUseCount;
		$result["roomUseAmountTime"] = $roomUseAmountTime;

		$title = ['資料名', '使用回数'];
		$result["pagerLists"] = $lists;
		if($pageCount == 1){
			$sortList = array_slice($lists, $pageCount-1 , 20);
			array_unshift($sortList, $title);
		}else if($pageCount == NULL){
			$sortList = array_slice($lists, 0 , 20);
			array_unshift($sortList, $title);
		}else{
			$sortList = array_slice($lists, (20*$pageCount)-20 , 20);
			array_unshift($sortList, $title);
		}
		$result["lists"] = $sortList;

		return $result;
	}

	/**
	 * 操作ログ一覧を取得
	 * @param unknown $form
	 * @param unknown $screenSession
	 * @return Application_Pager
	 */
	public function getLogList($form, &$screenSession) {

		// daoの宣言
		$logDao = Application_CommonUtil::getInstance('dao', "LogDao", $this->db);

		// セッション取得
		$session = Application_CommonUtil::getSession(self::IDENTIFIER);

		$user = $this->user;
		$condition = "";

		// セッションの初期化
		if($screenSession->isnew == true){
			$screenSession->order     = 'a.create_time';	// FIXME ここが後で、create_dateになったら変更する
			$screenSession->page      = 1;
			$screenSession->pagesize  = 100;
			$screenSession->ordertype = 'desc';	// 任意
		}
		// パラメータをセッションに格納
		foreach($form as $key=>$val){
			$screenSession->$key = $val;
		}
		//key module ,val default

		$freeWord = "";	// 検索条件を画面へ戻すためのに一時保存
		$where = array(" a.client_id = '{$user["client_id"]}' ");

		// 検索ボタンが押下された場合、ページを初期化する
		if(array_key_exists("free_word", $form)){
			$screenSession->page = 1;
		}

		// 検索ボタンが押下された場合、検索条件を作成し、ページを初期化する
		if(!empty($screenSession->free_word)){
			$freeWord   = $screenSession->free_word;
			$escapeText = $this->escape($screenSession->free_word);

			$where[] = " AND (a.action_name LIKE '%".$escapeText."%' OR AES_DECRYPT(b.staff_name,@key) LIKE '%".$escapeText."%') ";
		}

		// 条件が設定されている場合のみ使用
		if (0 < count($where)) {
			$condition = implode($where);
		}

		$count   = $logDao->getLogCount($condition);
		$logList = $logDao->getLogList(
			$condition,
			$screenSession->order,
			$screenSession->ordertype,
			$screenSession->page,
			$screenSession->pagesize
		);

		$list = new Application_Pager(array(
			"itemData"  => $logList,						// リスト（未スライス）
			"itemCount" => $count,						// リスト（未スライス）
			"perPage"   => $screenSession->pagesize,	// ページごと表示件数
			"curPage"   => $screenSession->page,		// 表示するページ
			"order"     => $screenSession->order,		// ソートカラム名
			"orderType" => $screenSession->ordertype,	// asc or desc
		));

		// CSV出力で使用する為に検索条件をセッションに保存
		$session->condition = $condition;
		$session->ordertype = $screenSession->ordertype;
		$result["list"] = $list;

		return $result;
	}

	/**
	 * CSVデータを取得
	 * @return string
	 */
	public function getCsvResult() {

		$csvHeaderDict = array(
			'create_date' => '日付',
			'staff_name'  => '担当者名',
			'action_name' => '操作内容'
			//'send_data'   => '送信データ'	// 必要な場合は入れる。しかしAAの場合と、CEの場合で分ける必要がある？
		);

		$csvBodyKeys = array_keys($csvHeaderDict);
		$csvHeader   = array_values($csvHeaderDict);

		// ヘッダー項目を作成
		$csvData = "";
		$csvData .= join(",", $csvHeader) . "\n";

		// 架電のアプローチ画面に表示するデータを取得する
		$csvBodyList = $this->getRawCsvResult();

		foreach ($csvBodyList as $csvBodyRow) {

			$rowList   = array();
			$rowString = "";

			foreach ($csvBodyKeys as $key) {
				$rowList[] = $csvBodyRow[$key];
			}

			$rowString = join(",", $rowList);
			$csvData .= $rowString . "\n";
		}

		return $csvData;
	}

    /**
     * 代理店の顧客の操作ログ一覧を取得
     * @param unknown $form
     * @param unknown $screenSession
     * @return Application_Pager
     */
    public function getDistributorClientLogList($form, &$screenSession) {

		// daoの宣言
		$logDao = Application_CommonUtil::getInstance('dao', "LogDao", $this->db);

		$user = $this->user;
		$condition = "";

		// セッションの初期化
		if($screenSession->isnew == true){
			$screenSession->order     = 'a.create_time';
			$screenSession->page      = 1;
			$screenSession->pagesize  = 100;
			$screenSession->ordertype = 'desc';
		}
		// パラメータをセッションに格納
		foreach($form as $key=>$val){
			$screenSession->$key = $val;
		}

		// 検索ボタンが押下された場合、ページを初期化する
		if(array_key_exists("free_word", $form)){
			$screenSession->page = 1;
		}

		// 検索.
		$count   = $logDao->getDistributorClientLogCount($user["client_id"], $this->escape($screenSession->free_word));
		$logList = $logDao->getDistributorClientLogList(
			$user["client_id"],
			$this->escape($screenSession->free_word),
			$screenSession->order,
			$screenSession->ordertype,
			$screenSession->page,
			$screenSession->pagesize
		);


		$list = new Application_Pager(array(
			"itemData"  => $logList,                    // リスト（未スライス）
			"itemCount" => $count,                      // リスト（未スライス）
			"perPage"   => $screenSession->pagesize,    // ページごと表示件数
			"curPage"   => $screenSession->page,        // 表示するページ
			"order"     => $screenSession->order,       // ソートカラム名
			"orderType" => $screenSession->ordertype,   // asc or desc
		));

		$result["list"] = $list;

		return $result;
    }


	/**
	 * 代理店の顧客の CSVデータを取得
	 * @return string
	 */
	public function getDistributorClientCsvResult($form, &$screenSession) {

		ini_set("memory_limit", "-1"); // 160万行のCSV出力も４Gメモリーが必要だった 今後増やしてゆくくらいなら無制限にしておく.
		ini_set("post_max_size", "1024M");
		ini_set('mysql.connect_timeout', 1200);
		ini_set('max_execution_time', 1200);

		$csvData = "";

		// daoの宣言
		$logDao = Application_CommonUtil::getInstance('dao', "LogDao", $this->db);

		$user = $this->user;

		$csvHeaderDict = array(
			'create_time' => '日付',
			'client_name' => '企業名',
			'staff_name'  => '担当者名',
			'action_name' => '操作内容'
		);

		// ヘッダー項目を作成
		$csvData .= join(",", array_values($csvHeaderDict)) . "\n";

		// ログ重出結果の書き込み.
		$logList = $logDao->getDistributorClientLogList(
			$user["client_id"],
			$form["free_word"],
			'a.create_time',
			$form["ordertype"]
		);
		foreach ($logList as $row) {
			$rowList   = [];
			foreach (array_keys($csvHeaderDict) as $key) {
				$rowList[] = $row[$key];
			}
			$csvData .= join(",", $rowList) . "\n";
		}
		return $csvData;
	}


	/**
	 * CSV整形前のCSVデータを取得
	 * @param unknown $screenSession
	 * @return multitype:
	 */
	public function getRawCsvResult() {

		// daoの宣言
		$logDao = Application_CommonUtil::getInstance('dao', "LogDao", $this->db);

		// セッション取得
		$session = Application_CommonUtil::getSession(self::IDENTIFIER);


		// 通常の検索と同じロジックを使用するため、パラメータを設定
		$order     = 'a.create_time';  // FIXME 個々のカラムがcreate_dateになったら変更する
		$page      = 1;
		$pagesize  = 10000;
		$ordertype = $session->ordertype;

		// 一覧表の検索条件を設定
		$user = $this->user;

		$condition = $session->condition;

		$count = $logDao->getLogCount($condition);
		$result = array();

		// カウントを超すまでリクエストを投げる。
		while ((($page - 1) * $pagesize) < $count) {

			$logList = $logDao->getLogList(
				$condition,
				$order,
				$ordertype,
				$page,
				$pagesize
			);

			$result = array_merge($result, $logList);
			$page++;
		}

		return $result;
	}
}