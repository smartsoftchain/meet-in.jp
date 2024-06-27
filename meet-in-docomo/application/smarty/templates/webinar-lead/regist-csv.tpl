{include file="./common/header.tpl"}

<script src="/js/webinar_lead.js?{$application_version}"></script>
<link rel="stylesheet" href="/css/webinar.css?{$application_version}">
{literal}
<script>
$(function (){
});

</script>
{/literal}

<!-- メインコンテンツ start -->
<div id="mi_main_contents">
	<!-- トップナビ start -->
	<div id="mi_top_nav">
		<!-- パンくずリスト start -->
		<div class="mi_breadcrumb_list">
			<a href="/index/menu">TOP</a>&nbsp;&gt;&nbsp;
			<a href="/webinar-lead/list">ウェビナーリード一覧</a>&nbsp;&gt;&nbsp;
			ウェビナーリードCSV登録
		</div>
		<!-- パンくずリスト end -->
	</div>
	<!-- トップナビ end -->

	<!-- コンテンツエリア start -->
	<div id="mi_content_area">

		<!-- コンテンツタイトル start -->
		<div class="mi_content_title mgb_unset">
			<h1><span class="icon-folder mi_content_title_icon"></span>ウェビナーリードCSV登録</h1>
		</div>
		<!-- コンテンツタイトル end -->

		<!-- アップロード種別領域 begin -->
		<div class="lead_upload_type_area">
			<label><input type="radio" class="" name="regist_type" value="1" checked="checked"/>メールアドレスの重複をそのまま登録する</label>
			<br>
			<label><input type="radio" class="" name="regist_type" value="2"/>メールアドレスで重複を一意にする</label>
			<br>
			<label>メールアドレスで重複を一意にする場合は、CSVファイルのデータを元にデータベースのデータを纏めます。</label>
		</div>
		<!-- アップロード種別領域 end -->

		<!-- CSVアップロード領域 begin -->
		<div class="lead_upload_csv_area">
			<div class="drop_csv_area">
				<div class="drop_csv_message">インポートしたいCSVファイルをここにドラッグ＆ドロップしてください</div>
				<label for="uploadCsvFile" class="select_file">
					ファイルを選択
					<input type="file" id="uploadCsvFile" name="upload_csv_file" class="display_none">
				</label>
			</div>
		</div>
		<!-- CSVアップロード領域 end -->

		<!-- エラーメッセージ表示エリア begin -->
		<p class="errmsg mb10 upload_csv_error_area">
			下記にエラーがあります。<br />
			<strong>
			</strong>
		</p>
		<!-- エラーメッセージ表示エリア end -->

		<!-- CSVアップロードファイル表示領域 begin -->
		<div class="mi_table_main_wrap display_lead_upload_csv_area">
			<label>読み込み行を選択してください。</label>
			<table class="mi_table_main width_unset">
				<thead>
					<tr>
						<th>選択</th>
						<th>名前</th>
						<th>フリガナ</th>
						<th>電話番号</th>
						<th>メールアドレス</th>
						<th>郵便番号</th>
						<th>住所</th>
						<th>企業名</th>
						<th>部署</th>
						<th>役職</th>
						<th>備考</th>
					</tr>
				</thead>
				<tbody class="display_csv_tbody">
					
				</tbody>
			</table>
		</div>
		<!-- CSVアップロードファイル表示領域 end -->
		<!-- CSV登録ボタン表示領域 begin -->
		<div class="btn_client_submit_area display_lead_upload_csv_area">
			<button type="button" name="btn_csv_upload" class="mi_default_button">登録する</button>
		</div>
		<!-- CSV登録ボタン表示領域 end -->
	</div>
	<!-- コンテンツエリア end -->

</div>
<!-- メインコンテンツ end -->

{include file="./common/footer.tpl"}
