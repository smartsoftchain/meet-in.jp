<?php
/**
 * スクリプトを新しいテーブルに移行する
 * @var unknown_type
 */
try{
	debugMeg("ScriptChange_begin");
	// バッチに関するDAOをまとめたモデル
	$manager = getInstance('Manager','BatchCommon');
	$talkBindManager = getInstance('Manager','TalkBind');
	$scriptRelationManager = getInstance('Manager','ScriptRelation');
	$talkBindManager = getInstance('Manager','TalkBind');
	$talkScriptManager = getInstance('Manager','TalkScript');
	$talkAnswerManager = getInstance('Manager','TalkAnswer');
	$talkParentManager = getInstance('Manager','TalkParent');
	
	// 既存のスクリプト情報を取得する
	$scriptList = $manager->getAllScript();
	error_log("scriptCount:".count($scriptList));
	$updateCount = 0;
	foreach($scriptList as $script){
		// 台本に登録する
		$talkBind = array();
		$talkBind["client_id"] = $script["project_clientid"];
		$talkBind["talk_script_name"] = $script["script_name"];
		$talkBind["description"] = "";
		$talkBind["talk_script_url"] = $script["script_url"];
		$talkBind["talk_script_type"] = "2";
		$talkBind["staff_type"] = "";
		$talkBind["staff_id"] = "0";
		$talkBind["del_flg"] = $script["script_del_flg"];
		$talkBindId = $talkBindManager->regist($talkBind);
		// プロジェクトと紐付けを行う
		$scriptRelation = array();
		$scriptRelation["client_id"] = $script["project_clientid"];
		$scriptRelation["project_id"] = $script["script_projectid"];
		$scriptRelation["talk_bind_id"] = $talkBindId;
		$scriptRelation["del_flg"] = $script["script_del_flg"];
		$scriptRelationManager->regist($scriptRelation);
		$updateCount++;
	}
	
	error_log("updateCount:".$updateCount);
	
	// ==============================
	// デフォルトのテンプレートを登録する
	// ==============================
	// talk_scriptの登録データ
	$talkScriptList = array();
	$talkScriptList[] = array("talk_key"=>"script_div_0", "title"=>"【受付突破】", "talk"=>"お世話になっております。\nアイドマ・ホールディングスの○○と申します。\n（午前中）○○社長はいらっしゃってますでしょうか？\n（午後）○○社長お戻りですか？orお手隙でしょうか？\n（夕方以降）○○社長まだいらっしゃいますか？", "talk_hierarchy"=>"0");
	$talkScriptList[] = array("talk_key"=>"script_div_1", "title"=>"【受付に用件を聞かれた時】", "talk"=>"本日、恐縮ながら御社のHPを拝見して、初めてご連絡させて頂いた者なんですけれども、\n当社が御社のような〇〇業界の企業様に特化して、\n新規のお客様を戦略的に集めてくるお手伝いをしている会社でございまして、\n御社の事業内容を拝見して、もしご紹介できればと思いご連絡させて頂いた次第でございます。", "talk_hierarchy"=>"1");
	$talkScriptList[] = array("talk_key"=>"script_div_2", "title"=>"【不在の場合】", "talk"=>"かしこまりました。\nそれでは急ぎではないので、また改めさせて頂きます。\n若し宜しければ、担当ご責任者の方のお名前をお伺いしても宜しいでしょうか？\n（お伺いした後に）\nかしこまりました。お忙しい所失礼致しました。有難うございました。", "talk_hierarchy"=>"1");
	$talkScriptList[] = array("talk_key"=>"script_div_3", "title"=>"【受付突破できず】", "talk"=>"かしこまりました。お忙しい所失礼致しました。有難うございました。", "talk_hierarchy"=>"1");
	$talkScriptList[] = array("talk_key"=>"script_div_4", "title"=>"【本人と通話】", "talk"=>"お忙しいところ、恐れ入ります。株式会社〇〇の〇〇と申します。\nすみません、突然のお電話で大変恐縮なのですが、御社のHPを拝見して、\nお手伝い出来る点があるのではないかと思い、ご連絡させて頂きました。\n\n……以下省略……\n\nもちろん、今すぐ何かがある訳ではないかと思うのですが、\n今後の何かあった時の参考として、\n来週の●●日と●●日に近くに伺っており、お時間を20～30分程度頂戴できればと思っております。\nもし差支えなければ、来週○曜日か○曜日等、ご都合はいかがでしょうか？", "talk_hierarchy"=>"1");
	$talkScriptList[] = array("talk_key"=>"script_div_5", "title"=>"【確認とヒアリング】", "talk"=>"かしこまりました。お忙しいところ、ありがとうございます。\nそれでは、○○日の○○時に○○という者がお伺いさせて頂き、\n詳細をお伝えさせて頂ければと思っております。\n※氏名・住所確認\n※できれば氏名・役職・部署名・メールアドレス\n最後に、お伺いする際に少しでも御社にメリットのあるお話しをさせて頂こうと思っておりますが、2点お伺いさせて頂いても宜しいでしょうか？\n・○○○○？\n・○○○○？", "talk_hierarchy"=>"1");
	$talkScriptList[] = array("talk_key"=>"script_div_6", "title"=>"【資料請求】", "talk"=>"資料でもご確認いただけますが、他社様の事例や、御社であればどのようなご提案が可能、予算などから御社が求められている情報も提供できると思っておりますので、、若し宜しければ20分程度お時間を頂くことはいかがでしょうか？", "talk_hierarchy"=>"1");
	$talkScriptList[] = array("talk_key"=>"script_div_7", "title"=>"【資料を要望】", "talk"=>"かしこまりました。\nそれではメールにて資料をお送りさせて頂きます。\n＜氏名・役職・部署名・メールアドレス・お礼へ＞", "talk_hierarchy"=>"1");
	$talkScriptList[] = array("talk_key"=>"script_div_8", "title"=>"【ニーズの把握】", "talk"=>"お忙しい所、大変失礼いたしました。\n一点だけご質問したいのですが、\n御社で今後、このようなニーズというのは出る可能性はございますでしょうか？\n", "talk_hierarchy"=>"1");
	$talkScriptList[] = array("talk_key"=>"script_div_9", "title"=>"【今後のニーズあり】", "talk"=>"どうもありがとうございます。\n今後ニーズが出てきた際の参考材料として、簡単な概要資料などをメールにてお送りしてもよろしいでしょうか？\n※確認事項\n＜氏名・役職・部署名・メールアドレス＞", "talk_hierarchy"=>"1");
	$talkScriptList[] = array("talk_key"=>"script_div_10", "title"=>"【ニーズがなさそう】", "talk"=>"かしこまりました。お忙しいところ、大変失礼いたしました。", "talk_hierarchy"=>"1");
	$talkScriptList[] = array("talk_key"=>"script_div_11", "title"=>"【資料は必要ない場合】", "talk"=>"かしこまりました。お忙しいところ、大変失礼いたしました。", "talk_hierarchy"=>"1");
	$talkScriptList[] = array("talk_key"=>"script_div_12", "title"=>"【お礼】", "talk"=>"本日は大変貴重なお時間を頂きどうも有難うございました。それでは当日は何卒宜しくお願い致します。", "talk_hierarchy"=>"1");
	$talkScriptList[] = array("talk_key"=>"script_div_13", "title"=>"うまくいくの？", "talk"=>"⇒はい。なぜかというと、実際にお会い頂けるかご不安かと思いますので\n「どのようにしたらお会い頂けるか？」というテレマーケティングのプランも・・・・・・・", "talk_hierarchy"=>"1");
	$talkScriptList[] = array("talk_key"=>"script_div_14", "title"=>"今営業困ってない", "talk"=>"⇒仰る通りだと思います。実は、当社も今はそういった状況のお客様がほとんでございまして、・・・・・・・", "talk_hierarchy"=>"1");
	$talkScriptList[] = array("talk_key"=>"script_div_15", "title"=>"新規開拓しなくても、お客いるから", "talk"=>"⇒仰る通りだと思います。実は、当社も今はそういった状況のお客様がほとんでございまして、・・・・・・・", "talk_hierarchy"=>"1");
	$talkScriptList[] = array("talk_key"=>"script_div_16", "title"=>"案件で忙しいくらい", "talk"=>"⇒仰る通りだと思います。実は、当社も今はそういった状況のお客様がほとんでございまして、・・・・・・・", "talk_hierarchy"=>"1");
	
	// talk_answerの登録データ
	$answerList = array();
	$answerList[] = array("talk_script_id"=>"1", "answer_name"=>"不在", "answer_type"=>"1");
	$answerList[] = array("talk_script_id"=>"1", "answer_name"=>"用件を聞かれる", "answer_type"=>"1");
	$answerList[] = array("talk_script_id"=>"1", "answer_name"=>"本人と通話", "answer_type"=>"1");
	$answerList[] = array("talk_script_id"=>"1", "answer_name"=>"受付突破できず", "answer_type"=>"1");
	$answerList[] = array("talk_script_id"=>"2", "answer_name"=>"本人と通話", "answer_type"=>"1");
	$answerList[] = array("talk_script_id"=>"2", "answer_name"=>"不在", "answer_type"=>"1");
	$answerList[] = array("talk_script_id"=>"2", "answer_name"=>"受付突破できず", "answer_type"=>"1");
	$answerList[] = array("talk_script_id"=>"5", "answer_name"=>"資料請求", "answer_type"=>"1");
	$answerList[] = array("talk_script_id"=>"5", "answer_name"=>"日程をいただける", "answer_type"=>"1");
	$answerList[] = array("talk_script_id"=>"5", "answer_name"=>"調整が難しい", "answer_type"=>"1");
	$answerList[] = array("talk_script_id"=>"5", "answer_name"=>"うまくいくの？", "answer_type"=>"2");
	$answerList[] = array("talk_script_id"=>"5", "answer_name"=>"今営業困ってない", "answer_type"=>"2");
	$answerList[] = array("talk_script_id"=>"5", "answer_name"=>"新規開拓しなくても、お客いるから", "answer_type"=>"2");
	$answerList[] = array("talk_script_id"=>"5", "answer_name"=>"案件で忙しいくらい", "answer_type"=>"2");
	$answerList[] = array("talk_script_id"=>"6", "answer_name"=>"お礼", "answer_type"=>"1");
	$answerList[] = array("talk_script_id"=>"7", "answer_name"=>"日程をいただける", "answer_type"=>"1");
	$answerList[] = array("talk_script_id"=>"7", "answer_name"=>"資料を要望", "answer_type"=>"1");
	$answerList[] = array("talk_script_id"=>"8", "answer_name"=>"お礼", "answer_type"=>"1");
	$answerList[] = array("talk_script_id"=>"9", "answer_name"=>"ニーズがありそう", "answer_type"=>"1");
	$answerList[] = array("talk_script_id"=>"9", "answer_name"=>"ニーズがなさそう", "answer_type"=>"1");
	$answerList[] = array("talk_script_id"=>"10", "answer_name"=>"お礼へ", "answer_type"=>"1");
	$answerList[] = array("talk_script_id"=>"10", "answer_name"=>"資料は必要ない", "answer_type"=>"1");
	
	// talk_parentの登録データ
	$parentList = array();
	$parentList[] = array("talk_script_id"=>"2", "parent_key"=>"script_div_1", "parent_answer"=>"answer_script_div_0_用件を聞かれる");
	$parentList[] = array("talk_script_id"=>"3", "parent_key"=>"script_div_2", "parent_answer"=>"answer_script_div_0_不在");
	$parentList[] = array("talk_script_id"=>"3", "parent_key"=>"script_div_2", "parent_answer"=>"answer_script_div_1_不在");
	$parentList[] = array("talk_script_id"=>"4", "parent_key"=>"script_div_3", "parent_answer"=>"answer_script_div_0_受付突破できず");
	$parentList[] = array("talk_script_id"=>"4", "parent_key"=>"script_div_3", "parent_answer"=>"answer_script_div_1_受付突破できず");
	$parentList[] = array("talk_script_id"=>"5", "parent_key"=>"script_div_4", "parent_answer"=>"answer_script_div_0_本人と通話");
	$parentList[] = array("talk_script_id"=>"5", "parent_key"=>"script_div_4", "parent_answer"=>"answer_script_div_1_本人と通話");
	$parentList[] = array("talk_script_id"=>"6", "parent_key"=>"script_div_5", "parent_answer"=>"answer_script_div_4_日程をいただける");
	$parentList[] = array("talk_script_id"=>"6", "parent_key"=>"script_div_5", "parent_answer"=>"answer_script_div_6_日程をいただける");
	$parentList[] = array("talk_script_id"=>"7", "parent_key"=>"script_div_6", "parent_answer"=>"answer_script_div_4_資料請求");
	$parentList[] = array("talk_script_id"=>"8", "parent_key"=>"script_div_7", "parent_answer"=>"answer_script_div_6_資料を要望");
	$parentList[] = array("talk_script_id"=>"9", "parent_key"=>"script_div_8", "parent_answer"=>"answer_script_div_4_調整が難しい");
	$parentList[] = array("talk_script_id"=>"10", "parent_key"=>"script_div_9", "parent_answer"=>"answer_script_div_8_ニーズがありそう");
	$parentList[] = array("talk_script_id"=>"11", "parent_key"=>"script_div_10", "parent_answer"=>"answer_script_div_8_ニーズがなさそう");
	$parentList[] = array("talk_script_id"=>"12", "parent_key"=>"script_div_11", "parent_answer"=>"answer_script_div_9_資料は必要ない");
	$parentList[] = array("talk_script_id"=>"13", "parent_key"=>"script_div_12", "parent_answer"=>"answer_script_div_5_お礼");
	$parentList[] = array("talk_script_id"=>"13", "parent_key"=>"script_div_12", "parent_answer"=>"answer_script_div_7_お礼");
	$parentList[] = array("talk_script_id"=>"13", "parent_key"=>"script_div_12", "parent_answer"=>"answer_script_div_9_お礼へ");
	$parentList[] = array("talk_script_id"=>"14", "parent_key"=>"script_div_13", "parent_answer"=>"answer_script_div_4_うまくいくの？");
	$parentList[] = array("talk_script_id"=>"15", "parent_key"=>"script_div_14", "parent_answer"=>"answer_script_div_4_今営業困ってない");
	$parentList[] = array("talk_script_id"=>"16", "parent_key"=>"script_div_15", "parent_answer"=>"answer_script_div_4_新規開拓しなくても、お客いるから");
	$parentList[] = array("talk_script_id"=>"17", "parent_key"=>"script_div_16", "parent_answer"=>"answer_script_div_4_案件で忙しいくらい");
	
	// 全クライアントデータを取得する
	$clientList = $manager->getAllClient();
	error_log("clientCount:".count($clientList));
	$registCount = 0;
	foreach($clientList as $client){
		$talkBind = array(
				"client_id"=>$client["client_id"],
				"talk_script_name"=>"サンプルトーク",
				"description"=>"",
				"talk_script_url" => "",
				"talk_script_type" => "1",
				"staff_type"=>"AA",
				"staff_id"=>"45",
				"del_flg"=>0
		);
		$talkBindId = $talkBindManager->regist($talkBind);
		
		// talk_scriptの登録処理
		foreach($talkScriptList as $talkScript){
			$talkScript["talk_bind_id"] = $talkBindId;
			$talkScriptManager->regist($talkScript);
		}
		// talk_answerの登録処理
		foreach($answerList as $answer){
			$answer["talk_bind_id"] = $talkBindId;
			$talkAnswerManager->regist($answer);
		}
		// talk_parentの登録処理
		foreach($parentList as $parent){
			$parent["talk_bind_id"] = $talkBindId;
			$talkParentManager->regist($parent);
		}
		$registCount++;
	}
	
	error_log("registCount:".$registCount);
	
	debugMeg("ScriptChange_end");
}
catch (Exception $err){
	debugMeg("想定外の例外：".$err->getMessage());
}

/**
 * デバッグメッセージ
 * @param unknown $actionName	処理名
 */
function debugMeg($actionName){
	error_log($actionName.":".date("Y-m-d H:i:s")."\n");
}