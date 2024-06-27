$(function () {
	// １ページあたりの表示件数
	const MAX_VIEW_COUNT = 6;
	// よくある質問と答え
	var allFaqList = [
		{"link" : "/lp/qa/1031faq_answer.html#answer_01", "title" : "ミーティングに参加するにはどうすればよいですか？"},
		{"link" : "/lp/qa/1031faq_answer.html#answer_02", "title" : "スマートフォンでmeet inを利用できますか？"},
		{"link" : "/lp/qa/1031faq_answer.html#answer_03", "title" : "他の人を招待するにはどうすればよいですか？"},
		{"link" : "/lp/qa/1031faq_answer.html#answer_04", "title" : "ビデオカメラが動作していません。"},
		{"link" : "/lp/qa/1031faq_answer.html#answer_05", "title" : "音声がつながりません。"},
		{"link" : "/lp/qa/1031faq_answer.html#answer_06", "title" : "画面を共有するにはどうすればよいですか？"},
		{"link" : "/lp/qa/1031faq_answer.html#answer_07", "title" : "資料を表示させたあと、画面から消すにはどうすればよいですか？"},
		{"link" : "/lp/qa/1031faq_answer.html#answer_08", "title" : "他のオンライン会議ツールとは何が違いますか？"},
		{"link" : "/lp/qa/1031faq_answer.html#answer_09", "title" : "ライトプランとスタンダードプランの違いがわかりません。"},
		{"link" : "/lp/qa/1031faq_answer.html#answer_10", "title" : "サポート体制はどうなっていますか？"},
		{"link" : "/lp/qa/1031faq_answer.html#answer_11", "title" : "meet inの推奨動作環境は？"},
		{"link" : "/lp/qa/1031faq_answer.html#answer_12", "title" : "meet inの利用で準備するものは？"},
		{"link" : "/lp/qa/1101faq_answer.html#answer_01", "title" : "無料体験版の利用方法が知りたいです。"},
		{"link" : "/lp/qa/1101faq_answer.html#answer_02", "title" : "有料プランになると何が使えますか"},
		{"link" : "/lp/qa/1101faq_answer.html#answer_03", "title" : "無料体験期間が終わり、引き続き使用したい。どこで手続きをしますか？"},
		{"link" : "/lp/qa/1101faq_answer.html#answer_04", "title" : "どのようなお支払方法がありますか？"},
		{"link" : "/lp/qa/1101faq_answer.html#answer_05", "title" : "プランの契約後、解約はいつでもできますか？"},
		{"link" : "/lp/qa/1101faq_answer.html#answer_06", "title" : "スタンダードプランのストレージ容量とは何ですか？"},
		{"link" : "/lp/qa/1101faq_answer.html#answer_07", "title" : "ストレージの容量は月間での制限ですか？"},
		{"link" : "/lp/qa/1101faq_answer.html#answer_08", "title" : "複数のアカウントで利用できますか？"},
		{"link" : "/lp/qa/1101faq_answer.html#answer_09", "title" : "請求書、領収書を発行したい"},
		{"link" : "/lp/qa/1101faq_answer.html#answer_10", "title" : "契約期間はどのくらいですか？"},
		{"link" : "/lp/qa/1101faq_answer.html#answer_11", "title" : "契約期間満了後に解約はできますか？"},
		{"link" : "/lp/qa/1101faq_answer.html#answer_12", "title" : "契約後にキャンセルはできますか？"},
		{"link" : "/lp/qa/1101faq_answer.html#answer_13", "title" : "サービス利用開始状況の確認方法"},
		{"link" : "/lp/qa/1101faq_answer.html#answer_14", "title" : "他プランへの変更について"},
		{"link" : "/lp/qa/1101faq_answer.html#answer_15", "title" : "他プランへの変更方法"},
		{"link" : "/lp/qa/1101faq_answer.html#answer_16", "title" : "プランのご契約を間違えた場合"},
		{"link" : "/lp/qa/1102faq_answer.html#answer_01", "title" : "アカウントIDについて"},
		{"link" : "/lp/qa/1102faq_answer.html#answer_02", "title" : "アカウントID作成・削除"},
		{"link" : "/lp/qa/1102faq_answer.html#answer_03", "title" : "パスワードを忘れた場合"},
		{"link" : "/lp/qa/1102faq_answer.html#answer_04", "title" : "パスワードの変更"},
	];
	// ページ指定リンクの件数(ページ数なので繰り上げ)
	const MAX_PAGE_COUNT = Math.ceil(allFaqList.length / MAX_VIEW_COUNT);
	// デフォルトページno
	var currentPageNo = 0;

	// ====================== 画面表示時の初期化 begin ===================================
	// ページ表示時の最初の項目
	var viewFAQList = getFAQ(currentPageNo);
	// 画面に表示する
	viewFAQ(viewFAQList);
	// ページャーのページリンクを表示する
	viewPageLink();
	// ページャーのnextとprevリンク表示
	viewNextPrevLink(currentPageNo);
	// ======================= 画面表示時の初期化 end ===================================

	/**
	 * ページを指定し、よくある質問を取得する
	 */
	function getFAQ(pageNo){
		// 表示する質問
		var result = [];
		// データ取得を行う起点(1ページ6つ表示する)
		var startingPoint = pageNo * MAX_VIEW_COUNT;
		for(var i = startingPoint;  i < (startingPoint + MAX_VIEW_COUNT);  i++ ){
			if(allFaqList[i]){
				// データが取得できた場合のみ設定する
				result.push(allFaqList[i]);
			}
		}
		// 戻り値を返す
		return result;
	}

	/**
	 * 表示対象のよくある質問を、タグに整形し表示する
	 */
	function viewFAQ(currentViewFAQList){
		// 現在のよくある質問を削除する
		$("#faq_area").empty();
		// 表示対象のよくある質問ループ
		for(var i = 0;  i < currentViewFAQList.length;  i++ ){
			// 設定するデータをローカル変数に設定（デバッグをやりやすいように）
			var link = currentViewFAQList[i]["link"];
			var title = currentViewFAQList[i]["title"];
			// タグを作成する
			var liTag = '<li><img alt="" class="mi_faq_img" src="/img/FAQ/icon_question.svg"> <span class="mi_faq_list_text"><a href="'+link+'">'+title+'</a></span></li>';
			//console.log(liTag);
			// タグを追加する
			$("#faq_area").append(liTag);
		}
	}
	/**
	 * ページャーのページリンク表示
	 */
	function viewPageLink(){
		for(var i = 0;  i < MAX_PAGE_COUNT;  i++ ){
			// システム上は0ページだが、人が認識できるように見た目だけ1ページから始まるようにする
			var viewNo = i + 1;
			var pageLink = '<li class="pagination__group" id="change_faq_page_'+i+'"><a class="pagination__item" href="javascript:void(0)">'+viewNo+'</a></li>';
			// タグを追加する
			if(i == 0){
				// 最初のみprevタグの後ろに追加する
				$("#peger_prev").after(pageLink);
			}else{
				// 最初以外は、前のタグの後に追加する
				var targetId = "#change_faq_page_" + (i - 1);
				$(targetId).after(pageLink);
			}
		}
	}
	/**
	 * ページャー表示
	 */
	function viewNextPrevLink(pageNo){
		var pegerTag = '';
		if(pageNo == 0){
			// 先頭ページの場合はprevが存在しないので非表示にする
			$("#peger_prev").hide();
		}else{
			// 先頭ページ以外では表示する
			$("#peger_prev").show();
		}
		if(pageNo == (MAX_PAGE_COUNT - 1)){			// カウントは1から始まるので1引く
			// 最終ページの場合はnextが存在しないので非表示にする
			$("#peger_next").hide();
		}else{
			// 最終ページ以外では表示する
			$("#peger_next").show();
		}
	}
	// prevリンク押下時のイベント
	$(document).on('click', '#peger_prev', function(){
		// currentページを変更
		currentPageNo = currentPageNo - 1;
		// ページ表示時の最初の項目
		var viewFAQList = getFAQ(currentPageNo);
		// 画面に表示する
		viewFAQ(viewFAQList);
		// ページャーのnextとprevリンク表示
		viewNextPrevLink(currentPageNo);
	});

	// nextリンク押下時のイベント
	$(document).on('click', '#peger_next', function(){
		// currentページを変更
		currentPageNo = currentPageNo + 1;
		// ページ表示時の最初の項目
		var viewFAQList = getFAQ(currentPageNo);
		// 画面に表示する
		viewFAQ(viewFAQList);
		// ページャーのnextとprevリンク表示
		viewNextPrevLink(currentPageNo);
	});

	// ページリンク押下時のイベント
	$(document).on('click', '[id^=change_faq_page_]', function(){
		// currentページを変更
		currentPageNo = parseInt($(this).attr("id").split("_").pop());
		// ページ表示時の最初の項目
		var viewFAQList = getFAQ(currentPageNo);
		// 画面に表示する
		viewFAQ(viewFAQList);
		// ページャーのnextとprevリンク表示
		viewNextPrevLink(currentPageNo);
	});
	/**
	 * よくある質問の検索
	 */
	$(document).on('click', '#btn_search', function(){
		// 検索結果表示領域を初期化する
		$("#search_faq_area").empty();
		// 検索文字列を取得
		var searchStr = $("[name=search]").val();
		if(searchStr != ""){
			for(var i = 0;  i < allFaqList.length;  i++ ){
				// 設定するデータをローカル変数に設定（デバッグをやりやすいように）
				var link = allFaqList[i]["link"];
				var title = allFaqList[i]["title"];
				// 検索文字列に部分一致するデータのみ表示する
				if(title.indexOf(searchStr) > -1){
					// タグを作成する
					var liTag = '<li><img alt="" class="mi_faq_img" src="/img/FAQ/icon_question.svg"> <span class="mi_faq_list_text"><a href="'+link+'">'+title+'</a></span></li>';
					// タグを追加する
					$("#search_faq_area").append(liTag);
				}
			}
			// 検索結果が存在しない場合はメッセージを表示する
			if($("#search_faq_area").find("li").length == 0){
				var liTag = '<li>キーワードに一致するQ&Aが見つかりませんでした。</li>';
				// タグを追加する
				$("#search_faq_area").append(liTag);
			}
		}
	});

});