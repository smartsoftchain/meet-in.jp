<!DOCTYPE html>
<html>
<head>
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>ミーティング</title>
<meta charset="utf-8">
<meta name="description" content="">
<meta name="author" content="">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<link rel="shortcut icon" href="/img/favicon.ico">
<link rel="stylesheet" href="/css/reset.css?{$application_version}">
<link rel="stylesheet" href="/css/sp/meeting.css?{$application_version}">
<link rel="stylesheet" href="/css/sp/button.css?{$application_version}">
<link rel="stylesheet" href="/css/chat_board.css?{$application_version}">
<link rel="stylesheet" href="/css/fonts.css?{$application_version}">
<link rel="stylesheet" href="/css/namecard.css?{$application_version}" media="screen and (max-width:1024px)">
<link rel="stylesheet" href="/css/namecard.css?{$application_version}" media="screen and (max-width:959px)">
<link rel="stylesheet" href="/css/namecard.css?{$application_version}" media="screen and (max-width:559px)">
<link rel="stylesheet" href="/css/sp/meeting.css?{$application_version}" media="screen and (orientation: landscape) and (max-width: 480px)">
<script type="text/javascript" src="/js/jquery-1.11.2.min.js"></script>
<script type="text/javascript" src="https://code.jquery.com/ui/1.11.4/jquery-ui.min.js"></script>
<script type="text/javascript" src="/js/sp/negotiation/meeting.js?{$application_version}"></script>

<!-- web移植 -->
<script src="/js/jquery-1.11.2.min.js?{$application_version}"></script>
<script src="/js/jquery-ui.min.js?{$application_version}"></script>
<script src="/js/jquery.ui.touch-punch.min.js?{$application_version}"></script>
<script src="/js/jquery.cookie.js?{$application_version}"></script>
<script src="/js/tooltipster.bundle.min.js?{$application_version}"></script>
<script src="/js/common.js?{$application_version}"></script>
<script src="/js/design.js?{$application_version}"></script>
<script src="/js/uuid.js?{$application_version}"></script>
<script src="/src/handlebars-v3.0.3.js?{$application_version}"></script>

<script src="/js/sp/negotiation/share_memo.js?{$application_version}"></script>
<script src="/js/sp/negotiation/write_line.js?{$application_version}"></script>
<script src="/js/sp/negotiation/white_board.js?{$application_version}"></script>
<script src="/js/sp/negotiation/chat_board.js?{$application_version}"></script>
<script src="/js/sp/negotiation/meetin_db.js?{$application_version}"></script>
<script src="/js/sp/negotiation/material_upload.js?{$application_version}"></script>
<script src="/js/sp/negotiation/negotiation_sync.js?{$application_version}"></script>
<script src="/js/less.min.js?{$application_version}" type="text/javascript"></script>
<script src="/js/sp/negotiation/negotiation_namecard.js?{$application_version}"></script>
<script src="/js/platform.js?{$application_version}"></script>
<script src="/js/sp/negotiation/e_contract.js?{$application_version}"></script>
<script src="/js/sp/negotiation/audio_text.js?{$application_version}"></script>
<script src="/js/negotiation/sentiment_analysis.js?{$application_version}"></script>


</head>
{if $room_mode == 2}
<body class="monitoring_mode">
{else}
<body>
{/if}


	<div class="content__wrap iphonex_safe_area" id="content__wrap">
		<div class="full_screen__wrap">
			<!-- 現在のレイアウト種別を判定するための値 -->
			<input type="hidden" name="layout_type" value="icon"/>
			<div class="video_area_wrap">
				{include file="./negotiation/negotiation-target-video.tpl" video_id='0' this_id=$user_id}
				{include file="./negotiation/negotiation-target-video.tpl" video_id='1' this_id=$user_id}
				{include file="./negotiation/negotiation-target-video.tpl" video_id='2' this_id=$user_id}
				{include file="./negotiation/negotiation-target-video.tpl" video_id='3' this_id=$user_id}
				{include file="./negotiation/negotiation-target-video.tpl" video_id='4' this_id=$user_id}
				{include file="./negotiation/negotiation-target-video.tpl" video_id='5' this_id=$user_id}
				{include file="./negotiation/negotiation-target-video.tpl" video_id='6' this_id=$user_id}
				{include file="./negotiation/negotiation-share-screen.tpl"}
			</div>
		</div>
		<!-- ミーティング画面 -->
		<div id="meeting__wrap">
			<div class="meeting__header">
				<div class="meeting__header--timeWrap">
					{if $room_mode == 2}<span>同席モード</span>{/if}
					<span class="meeting__header--timeMark"></span><span id="time"></span>
				</div>
			</div>
			<div class="meeting__headerlogo" id="meeting__headerlogo">
				<img src="/img/sp/png/sp_header_icon.png" class="meeting__header--logo">
			</div>

			<!-- ノック機能 start -->
			<div class="alert-enter-locked-room" id="alert_enter_locked_room">
				<img src="/img/sp/png/sp_header_icon.png" class="meeting__header--logo">
				<div class="title-area" id="title_area">入室リクエストがあります</div>
				<div class="btn-area" id="btn_list_enter_locked_room_open">リストを表示</div>
			</div>
			<div class="list-enter-locked-room" id="list_enter_locked_room">
				<div class="list-filter"></div>
				<div class="list-backgroud">
					<div class="list-header">
						<div class="title-enter-room-request">入室リクエスト</div>
						<div class="title-room-over-capacity">※参加人数が上限に達しています</div>
						<div class="btn-close" id="btn_list_enter_locked_room_close"><img src="/img/icon_close_white.png"></div>
					</div>
					<div class="contents"  id="contents"></div>
				</div>

			</div>
			<!-- ノック機能 end -->

			<div class="meeting__menuBtn" id="meeting__menuBtn">
				<img src="/img/sp/png/sp_menu_btn.png" class="meeting__sidebar--btn">
			</div>
			<div class="meeting__sidebar" id="meeting__sidebar">
				<img src="/img/sp/png/front_camera.png" class="meeting__sidebar--btn" id="change_camera">
				<img src="/img/sp/png/imageupload.png" class="meeting__sidebar--btn" id="trigger_access_photos">
				<input type="file" name="access_photos" id="access_photos" class="access_photos" />
				<img src="/img/sp/png/add_user.png" class="meeting__sidebar--btn" id="button_room_share">
				<img src="/img/sp/svg/sp_raise_hand_icon.svg" class="meeting__sidebar--btn  {if $room_mode == 2}view_only_control_footer{/if}" id="button_raise_your_hand">
				<img src="/img/sp/svg/sp_good_reaction_icon.svg" class="meeting__sidebar--btn  {if $room_mode == 2}view_only_control_footer{/if}" id="button_good_reaction">
				<!--<img src="/img/sp/png/mute.png" class="meeting__sidebar--btn" id="change_sidebarMute">-->
			</div>
			<!-- ユーザーリアクションツールチップエリア start -->
			<div id="reaction_tooltips_area_sp">
			</div>
			<!-- ユーザーリアクションツールチップエリア end -->
			<!-- 縮小表示の場合に下記ビデオを表示する領域だった場所
			<div class="meeting__members--wrap" id="meeting__members--wrap">
			</div>
			-->
			<div class="meeting__footer {if $room_mode == 2}zindex1001{/if}">
				<img src="/img/sp/png/movie.png" class="meeting__footer--btn-v {if $room_mode == 2}view_only_control_footer{/if}" id="button_camera">
				<img src="/img/sp/png/mike.png" class="meeting__footer--btn-v {if $room_mode == 2}view_only_control_footer{/if}" id="button_mic">
				<img src="/img/sp/png/newchaticon.png" class="meeting__footer--btn-v {if $room_mode == 2}view_only_control_footer{/if}" id="button_chat_board">
				<img src="/img/sp/png/pen.png" class="meeting__footer--btn-v {if $room_mode == 2}view_only_control_footer{/if}" id="change_paint">
				<img src="/img/sp/png/done.png" class="meeting__footer--btn-v" id="sp_negotiation_finish">
			</div>
		</div>
		<!-- ミーティング画面 -->

		<!-- 非推奨環境モーダル -->
		<div  style="display: none" class="non_reccomend_modal">
			<div class="content">
				<ul class="cause">
				</ul>
				<div class="link">
				</div>
				<button class="button" onclick="closenonReccomendModal()">このまま続ける</button>
			</div>
		</div>
		<!-- 非推奨環境モーダル END-->

		<!-- チャット画面 -->
		<div class="chat__wrap" id="chat__wrap">
			<div class="chat__return" id="chat__return">
				<img src="/img/sp/svg/chat_return.svg">
			</div>
			<div id="chat_board_messages" class="chat__content">
				<!-- チャットメッセージが表示される領域 -->
			</div>
			<div class="chat__footer" id="chat__footer">
				<div class="chat__addComment" id="chat__addComment">
					<img src="/img/sp/svg/add_comment.svg">
				</div>
				<div class="chat__textArea">
					<textarea id="chat_board_send_message" name="chat_board_send_message" rows="8" cols="80"></textarea>
				</div>
				<div id="send_chat_message" class="chat__addEmoji icon-menu-02 icon_send_chat_message"></div>
			</div>
		</div>
		<!-- チャット画面 END-->

		<!-- ペイント画面 -->
		<div id="white_board_area" class="chat__paint">
			<div class="paint__content">
				<div class="paint__header">
					<div class="btn_reset paint__header--undo">削除</div>
					<div class="paint__header--done" id="paint_done">完了</div>
				</div>
				<!-- キャンバス領域　ホワイトボード begin -->
				<div class="canvas_area not-touch-move-area">
					<canvas id="white_board" class="white_board"></canvas>
				</div>
				<!-- キャンバス領域 end -->
				<!-- パレットエリア start -->

				<div class="color_palet_circle">
					<img src="/img/sp/png/imgPen.png" id="imgPen">
				</div>
				<div class="paint__footer">
					<div class="paint__footerClose">
						<span class="cancel-icon"></span>
						閉じる
					</div>
					<div class="paint__sideBtn">
						<div class="left_icon_highlight paint__sideBtn--img"><img src="/img/sp/svg/pen2__Icon.svg"></div>
						<div class="left_icon_pen paint__sideBtn--img"><img src="/img/sp/svg/pen1__Icon.svg"></div>
						<div class="left_icon_touch"><img src="/img/sp/svg/Shape Copy 6.svg"></div>
					</div>
					<div class="color__palet">
						<div class="mi_white color__white"></div>
						<div class="mi_black color__black selected_color_frame"></div>
						<div class="mi_green color__green"></div>
						<div class="mi_yellow color__yellow"></div>
						<div class="mi_red color__red"></div>
						<div class="mi_blue color__blue"></div>
					</div>
				</div>
				<!-- パレットエリア end -->
			</div>
		</div>
		<!-- ペイント画面 END -->

		<!-- 共有メモ画面 begin -->
		<div class="share_memo_area" id="share_memo_area">
			<div class="share_memo_close" id="share_memo_close">
				<img src="/img/sp/svg/chat_return.svg">
			</div>
			<div id="share_memo_messages" class="share_memo_messages">
				<!-- 共有メモメッセージが表示される領域 -->
				<textarea class="share_memo_text"></textarea>
			</div>
<!--
			<div class="share_memo_footer">
				<span class="share_memo_download share_memo_fontsize icon_download not-touch-move-area">
					<a href="javascript:void(0);">
						<img src="/img/doc-save.png" alt="CSVダウンロード" onmouseover="this.src='/img/doc-save-hover.png'" onmouseout="this.src='/img/doc-save.png'">
					</a>
				</span>
				<a href="" name="download_share_memo" download=""></a>
			</div>
 -->
		</div>
		<!-- 共有メモ画面 end-->

		<!-- 文字起こし画面 begin -->
		<div id="negotiation-audio-text-area" class="audio-text-area-sp">

			<!-- タイトルエリア begin -->
			<div class="audio-text-header">
				<img class="audio_text_img" src="/img/sp/svg/audio_text.svg">
				<span class="audio-text-header-text">文字起こし</span>
				<span class="audio-text-download-span">
					<a href="#" onclick="downloadAudioTextFile();return false" class="audio-text-download-button-label">
						ダウンロード
					</a>
				</span>
			</div>
			<!-- タイトルエリア end -->

			<!-- コンテンツエリア begin -->
			<div class="audio-text-content">
				<div class="audio-text-boxarea" id="audio-text-boxarea"></div>
				<div class="audio-text-pagenation-area" id="audio-text-pagenation-area">
					<div id="audio-text-pagenation" class="audio-text-pagenation"></div>
				</div>
			</div>
			<!-- コンテンツエリア end -->

			<!-- ボタンエリア begin -->
			<div class="audio-text-footer">
				<span id="audio-textarea-resize-button" class="icon-upward"></span>
			</div>
			<!-- ボタンエリア end -->
		</div>
		<!-- 文字起こし画面 end-->

		<!-- 電子契約画面 begin -->
		<div id="e_contract_area" class="room_e_contract">

			<!-- タイトルエリア begin -->
			<div class="e_contract_header_area">
				<span class="icon-folder"></span>
				<h2 class="e_contract_header_title">電子契約書新規作成</h1>
			</div>
			<!-- タイトルエリア end -->

			<!-- パートナーコンテンツエリア start -->
			<div id="partners">

				<!-- コンテンツ start -->
				<div class="e_contract_setting_area">

					<!-- タイトル表示エリア begin -->
					<div id="e_contract_title_1" class="e_contract_title_area">
						<h2>1.契約書・宛先の設定</h2>
						<p>
							契約を交わす相手の情報を入力し、契約書にサインを行う順番を設定してください。<br>
							サインをする順番は、詳細情報パネルをドラッグ&ドロップで移動するか、位置変更ボタンをクリックしてください。
						</p>
					</div>
					<!-- タイトル表示エリア end -->

					<!-- フォームエリア begin -->
					<div class="partner_setting_form_area">

						<div class="partner_setting_table">
							<div class="partner_setting_template_row">
								<div class="partner_setting_table_label">契約書タイトル<span class="require">必須</span></div>
								<div>
									<input type="text" name="case_title" id="case_title" placeholder="入力してください" class="partner_setting_title_input e_contract_info_text" value="{$form.name|escape}">
								</div>
							</div>
							<div class="partner_setting_template_row">
								<div class="partner_setting_table_label">テンプレート名<span class="require">必須</span></div>
								<div id="e_contract_document_td">
									<div class="partner_setting_template_select">
										<select id="e_contract_document_id">
											<option value='' disabled selected style='display:none;'>選択してください</option>
											{foreach from=$documentList item=row}
												<option value="{$row.id}" {if $row.id == $eContractDocumentId}selected{/if}>{$row.name}</option>
											{/foreach}
										</select>
									</div>
								</div>
							</div>
							<div class="partner_setting_template_row">
								<div class="partner_setting_table_label">契約金額の有無</div>
								<div>
									<input type="radio" id="have_amount" name="have_amount" value="1" class="e_contract_info_radio" /> あり
									<input type="radio" id="have_amount" name="have_amount" value="0" class="e_contract_info_radio" checked="checked" /> なし
								</div>
							</div>
							<div class="partner_setting_template_row" id="amount_row">
								<div class="partner_setting_table_label">契約金額</div>
								<div>
									<input id="amount" name="amount" type="number" placeholder="入力してください" class="partner_setting_title_input2 e_contract_info_text"> 円
								</div>
							</div>
							<div class="partner_setting_template_row">
								<div class="partner_setting_table_label">合意日</div>
								<div>
									<input type="date" id="agreement_date" name="agreement_date" value="{$form.agreementDate|escape}" class="e_contract_info_text" />
								</div>
							</div>
							<div class="partner_setting_template_row">
								<div class="partner_setting_table_date">
									<div class="partner_setting_table_date_item">
										<div class="partner_setting_table_label">発効日</div>
										<input type="date" id="effective_date" name="effective_date" value="{$form.effectiveDate|escape}" class="partner_setting_table_date_item e_contract_info_text" />
									</div>
									<div>
										<div class="partner_setting_table_label">終了日</div>
										<input type="date" id="expire_date" name="expire_date" value="{$form.expireDate|escape}" class="partner_setting_table_date_item e_contract_info_text" />
									</div>
								</div>
							</div>
							<div class="partner_setting_template_row">
								<div class="partner_setting_table_label">契約自動更新の有無</div>
								<div>
									<input type="radio" name="auto_renewal" id="auto_renewal" value="1" class="e_contract_info_radio" /> あり
									<input type="radio" name="auto_renewal" id="auto_renewal" value="0" class="e_contract_info_radio" checked="checked" /> なし
								</div>
							</div>
							<div class="partner_setting_template_row">
								<div class="partner_setting_table_label">任意の管理番号</div>
								<div>
									<input type="text" id="management_number" name="management_number" placeholder="入力してください" class="partner_setting_title_input e_contract_info_text">
								</div>
							</div>
							<div class="partner_setting_template_row">
								<div class="partner_setting_table_label">任意のコメント</div>
								<div>
									<input type="text" id="comment" name="comment" placeholder="入力してください" class="partner_setting_title_input e_contract_info_text">
								</div>
							</div>
							<div class="partner_setting_partner_row">
								<div class="partner_setting_table_label_partner">宛先</div>
								<div id="partner-area">

									<div class="partner_setting_item">
										<div class="partner_setting_item_header">
											<p><span class="icon-parsonal"></span><span class="partner_setting_item_count">1人目</span>：1番目に契約書にサインを行う人</p>
										</div>
										<div class="partner_setting_input_area">
											<div class="partner_setting_input_row">
												<label>氏名<span class="require">必須</span></label>
												<input type="text" id="lastname" name="lastname" class="partner_setting_input_name lastname e_contract_info_text" placeholder="田中"><input type="text" id="firstname" name="firstname" class="partner_setting_input_name firstname e_contract_info_text" placeholder="太郎">
											</div>
											<div class="partner_setting_input_row">
												<label>企業名</label>
												<input type="text" name="organization_name" placeholder="入力してください" class="partner_setting_input organization_name e_contract_info_text">
											</div>
											<div class="partner_setting_input_row">
												<label>役職</label>
												<input type="text" name="title" placeholder="入力してください" class="partner_setting_input title e_contract_info_text">
											</div>
											<div class="partner_setting_input_row">
												<label>メールアドレス<span class="require">必須</span></label>
												<input type="email" id="email" name="email" placeholder="aaaaa@aaaaa.jp" class="partner_setting_input email e_contract_info_text">
											</div>
											<div class="partner_setting_input_row">
                        <label>認証コード<span class="note">（8文字以上の半角英数字）</span><span class="require">必須</span></label>
												<p class="sign-text-note">認証コードを設定してください。<br>作成した電子契約を閲覧したいときに使います。</p>
                        <input type="text" id="password" name="password" class="partner_setting_input_name password e_contract_info_text">
                      </div>
											<div id="authorization-code" class="partner_setting_input_row">
                        <label>電話番号<span class="note">（ハイフンなし）</span></label>
                        <p class="authorization-code-note"></p>
                        <input type="number" id="tel" name="tel" class="partner_setting_input_name e_contract_info_text">
                      </div>
                      <input type="hidden" name="token" id="token" class="token" value="">
										</div>
									</div>

								</div>
							</div>
							<div id="partner-add" class="partner_setting_partner_add">追加</div>

						</div>
						<div class="btn_client_submit_area">
							<button type="button" id="e_contract_cancel" class="mi_default_button mi_cancel_btn mi_btn_m hvr-fade">キャンセル</button>
							<button type="button" id="submit_button" class="mi_default_button">入力者設定へ</button>
						</div>

						<!-- データエリア begin -->
						<input type="hidden" name="client_id" value="{$user.client_id|escape}" />
						<input type="hidden" name="staff_type" value="{$user.staff_type|escape}" />
						<input type="hidden" name="staff_id" value="{$user.staff_id|escape}" />
						<a href="" id="download_contract" download></a>
						<!-- データエリア end -->

					</div>
					<!-- フォームエリア begin -->

				</div>
				<!-- コンテンツ end -->

			</div>
			<!-- パートナーコンテンツエリア end -->


			<!-- インプットコンテンツエリア start -->
			<div id="inputs" style="background: #fff;">

				<!-- コンテンツ start -->
				<div class="e_contract_setting_area">

					<!-- タイトル表示エリア begin -->
					<div id="e_contract_title_2" class="e_contract_title_area">
						<h2>2.入力者の設定</h2>
						<p>
							各パーツの入力者を設定し、自分が入力する部分へ入力をしてください。<br>
							各パーツの編集ボタンをクリックする事で、設定メニューを表示することができます。
						</p>
					</div>
					<!-- タイトル表示エリア end -->

					<!-- 契約書情報エリア begin -->
					<div id="caseInfoArea"></div>
					<!-- 契約書情報エリア end -->

					<!-- ファイル表示エリア begin -->
					<div class="form_setting_file_area">
						{* <p>契約書 <span id="fileCount"></span>件</p> *}
						<div id="fileNameList"></div>
					</div>
					<!-- ファイル表示エリア end -->

					<!-- 契約書エリア begin -->
					<div id="documentArea"></div>
					<!-- 契約書エリア begin -->

					<!-- 契約者エリア begin -->
					<div class="form_setting_partner_area" id="partnerArea">
						<p class="form_setting_partner_title">契約者</p>
						<p class="form_setting_partner_description">電子契約書の送付先と送付される順番です。</p>
					</div>
					<!-- 契約者エリア begin -->

					<!-- メッセージエリア begin -->
					<div id="messageArea" class="form_setting_message_area">
						<p class="form_setting_partner_description">電子契約書の送付メールにメッセージを挿入したい場合は、下記に入力してください。</p>
						<textarea id="message" name="message" class="form_setting_partner_textarea e_contract_info_message" placeholder="入力してください。"></textarea>
					</div>
					<!-- メッセージエリア end -->

					<!-- buttonエリア begin -->
					<div id="buttonArea" class="button-wrapper">
					</div>
					<!-- buttonエリア end -->

					<!-- データエリア begin -->
					<input type="hidden" id="caseId">
					<!-- データエリアend -->

				</div>
				<!-- コンテンツ end -->

			</div>
			<!-- インプットコンテンツエリア end -->

			<!-- 作成完了エリア begin-->
			<div id="done">
				<div class="e_contract_center">
					<p class="e_contract_item__medium">作成が完了しました</p>
					<p class="e_contract_item__small">電子契約書が作成され送信されました。契約が完了するまで送付した契約書は「電子契約書確認中一覧」にて確認することができます。</p><br>
					<img src="/img/icon___.svg" class="e_contract_img__section"><br>
				</div>

				<div class="button-wrapper">
					<button type="button" id="e_contract_done" class="mi_default_button">閉じる</button>
				</div>
			</div>
			<!-- 作成完了エリア end-->

			<!-- 契約完了エリア begin-->
			<div id="contracted" style="display: none;">
				<div class="e_contract_center">
					<p class="e_contract_item__medium">契約が完了しました</p>
					<p class="e_contract_item__small">電子契約書が契約されました。契約が完了した契約書は「電子契約書完了一覧」にて確認することができます。</p><br>
					<img src="/img/icon___.svg" class="e_contract_img__section"><br>
				</div>

				<div class="button-wrapper">
					<button type="button" id="e_contract_cancel" class="mi_default_button">閉じる</button>
				</div>
			</div>
			<!-- 契約完了エリア end-->

		</div>
		<!-- 電子契約画面 end-->

		<!-- 画像表示領域全体 begin -->
		<div id="sp_document_area" class="sp_document_area">
			<div class="sp_document_content">
				<div class="sp_document_header">
					<div class="sp_document_close" id="sp_document_close">Done</div>
				</div>
				<!-- 画像表示領域 begin -->
				<div class="sp_img_document_area not-touch-move-area">
					<img id="sp_img_document" class="sp_img_document"/>
					<div id="document_text_field"></div>
					<canvas id="sp_img_canvas" class="sp_img_canvas"></canvas>
				</div>
				<!-- パレットエリア start -->

				<div class="color_palet_circle">
					<img src="/img/sp/png/imgPen.png" id="imgPen">
				</div>
				<div class="paint__footer">
					<div class="paint__footerClose">
						<span class="cancel-icon"></span>
						閉じる
					</div>
					<div class="paint__sideBtn">
						<div class="left_icon_highlight paint__sideBtn--img"><img src="/img/sp/svg/pen2__Icon.svg"></div>
						<div class="left_icon_pen paint__sideBtn--img"><img src="/img/sp/svg/pen1__Icon.svg"></div>
						<div class="left_icon_touch"><img src="/img/sp/svg/Shape Copy 6.svg"></div>
					</div>
					<div class="color__palet">
						<div class="mi_white color__white"></div>
						<div class="mi_black color__black selected_color_frame"></div>
						<div class="mi_green color__green"></div>
						<div class="mi_yellow color__yellow"></div>
						<div class="mi_red color__red"></div>
						<div class="mi_blue color__blue"></div>
					</div>
				</div>
				<!-- パレットエリア end -->
				<!-- 画像表示領域 end -->
			</div>
		</div>
		<!-- 画像表示領域全体 end -->

		<!-- コネクト begin -->
		{include file="./negotiation/loading.tpl"}
		<!-- コネクト end -->

		{include file="./negotiation/negotiation-dialog.tpl"}
		<!-- ルーム共有モーダル begin -->
		{include file="./negotiation/negotiation-room-share.tpl"}
		<!-- ルーム共有モーダル end -->

		<!-- 入室要求 start -->
		{if $is_operator == 1}
		<div id="enter_room_dialog_field">
			<div id="enter_room_dialog_background_area" class="mi_modal_shadow" style="z-index:101000000; display:none;">
			</div>
			<div id="enter_room_dialog_area">
			</div>
		</div>
		{/if}
		<!-- 入室要求 end -->

		<!-- 同席モード begin -->
		<input type="hidden" id="room_mode" value="{$room_mode}"/>
		{if $room_mode == 2}
			<div class="view_only_control_contents"></div>
		{/if}
		<!-- 同席モード end -->

		<!-- 汎用ダイアログ start -->
		<div id="common_dialog_area">
		</div>
		<!-- 汎用ダイアログ end -->
		{include file="./negotiation/negotiation-namecard.tpl"}
	</div>

	<!-- 社内通話 begin -->
	<div id="mi_secret_voice_area"></div>
	<!-- 社内通話 begin -->

	<!-- web移植 begin -->
	<input type="hidden" id="connectMaxCount" value="{$connectMaxCount}"/>
	<input type="hidden" id="room_members" name="room_members"/>
	<input type="hidden" id="is_operator" value="{$is_operator}"/>
	<input type="hidden" id="client_id" value="{$client_id}"/>
	<input type="hidden" id="staff_type" value="{$staff_type}"/>
	<input type="hidden" id="staff_id" value="{$staff_id}"/>
	<input type="hidden" id="connection_info_id" value="{$connection_info_id}"/>
	<input type="hidden" id="connect_no" value="{$connect_no}"/>
	<input type="hidden" id="peer_id" value="{$peer_id}"/>
	<input type="hidden" id="peer_video_id" value="{$peer_video_id}"/>
	<input type="hidden" id="peer_audio_id" value="{$peer_audio_id}"/>
	<input type="hidden" id="peer_screen_id" value="{$peer_screen_id}"/>
	<input type="hidden" id="user_id" value="{$user_id}"/>
	<input type="hidden" id="my_user_info" value="{$my_user_info}"/>
	<input type="hidden" id="operator_name" value="{$user.staff_name}"/>
	<input type="hidden" id="client_name" value="{$user.client_name}"/>
	<input type="hidden" id="screen_type" value="{$screen_type}"/>
	<input type="hidden" id="wait_connect_table_string" value="{$wait_connect_table_string}"/>
	<input type="hidden" id="enter_negotiation_datetime" value="{$smarty.now|date_format:'%Y/%m/%d %H:%M:%S'}"/>

	<input type="hidden" id="video_background_image" value="{$video_background_image}"/>
	<input type="hidden" id="send_bandwidth" value="{$send_bandwidth}"/>
	<input type="hidden" id="receive_bandwidth" value="{$receive_bandwidth}"/>
	<input type="hidden" id="browser" value="{$browser}"/>
	<input type="hidden" id="isMobile" value="{$isMobile}"/>
	<input type="hidden" id="application_version" value="{$application_version}"/>
	<input type="hidden" id="e_contract_credential" value="{$e_contract_credential}"/>
	<input type="hidden" id="tell_token" name="tell_token"/>
	<!-- ルーム対応 -->
	<input type="hidden" id="room_locked" value="{$room_locked}"/>
	<input type="hidden" id="document_material_id" value="{$document_material_id}"/>
	<input type="hidden" id="document_uuid" value="{$document_uuid}"/>
	<input type="hidden" id="document_user_id" value="{$document_user_id}"/>
	<input type="hidden" id="desktop_notify_flg" value="{if ($user.desktop_notify_flg == '')}1{else}{$user.desktop_notify_flg}{/if}"/>
	<!-- 名刺表示(現在表示している名刺情報) -->
	<input type="hidden" id="ShowNameCard_client_id" value="{$client_id}"/>
	<input type="hidden" id="ShowNameCard_staff_type" value="{$staff_type}"/>
	<input type="hidden" id="ShowNameCard_staff_id" value="{$staff_id}"/>
	<input type="hidden" id="Room_name" value="{$room_name}"/>
	<input type="hidden" id="Collabo_site" value="{$collabo_site}"/>
	{if $is_operator == 1}
		<input type="hidden" id="target_peer_id" value="{$target_peer_id}"/>
	{/if}
	<script type="text/javascript" src="/js/WebRTC/key.js?{$application_version}"></script>
	<script type="text/javascript" src="/js/WebRTC/skyway.js?{$application_version}"></script>
	<script type="text/javascript" src="/js/WebRTC/skyway-recorder-1.0.1.js?{$application_version}"></script>
	<script type="text/javascript" src="/js/WebRTC/screenshare.js?{$application_version}"></script>
	<script type="text/javascript" src="/js/WebRTC/screencapture.js?{$application_version}"></script>
	<script type="text/javascript" src="/js/MeetinAPI.js?{$application_version}"></script>
	<script type="text/javascript" src="/js/Utility.js?{$application_version}"></script>
	<script type="text/javascript" src="/js/WebRTC/MeetinDefault.js?{$application_version}"></script>
	<script type="text/javascript" src="/js/WebRTC/MeetinUtility.js?{$application_version}"></script>
	<script type="text/javascript" src="/js/WebSocket/MeetinWebSocketManager.js?{$application_version}"></script>
	<script type="text/javascript" src="/js/WebSocket/MeetinWebSocketProcManager.js?{$application_version}"></script>
	<script type="text/javascript" src="/js/WebRTC/MeetinConnectionManager.js?{$application_version}"></script>
	<script type="text/javascript" src="/js/WebRTC/MeetinMediaManager.js?{$application_version}"></script>
	<script type="text/javascript" src="/js/WebRTC/MeetinCoreManager.js?{$application_version}"></script>
	<script type="text/javascript" src="/js/WebRTC/MeetinRTC_tab_capture.js?{$application_version}"></script>
	<script type="text/javascript" src="/js/flash/swfobject.js?{$application_version}"></script>
	<script type="text/javascript" src="/js/flash/flashUtility.js?{$application_version}"></script>

	<script type="text/javascript" src="/js/negotiation/negotiation_secret_voice.js?{$application_version}"></script>
	<script type="text/javascript" src="/js/sp/negotiation/negotiation_manager.js?{$application_version}"></script>
	<script type="text/javascript" src="/js/sp/negotiation/negotiation_interface_common.js?{$application_version}"></script>
	<script type="text/javascript" src="/js/sp/negotiation/negotiation_interface_init.js?{$application_version}"></script>
	<script type="text/javascript" src="/js/sp/negotiation/negotiation_interface_reconnect.js?{$application_version}"></script>
	<script type="text/javascript" src="/js/sp/negotiation/negotiation_interface_camera.js?{$application_version}"></script>
	<script type="text/javascript" src="/js/sp/negotiation/negotiation_interface_mic.js?{$application_version}"></script>
	<script type="text/javascript" src="/js/sp/negotiation/negotiation_interface_screen.js?{$application_version}"></script>
	<script type="text/javascript" src="/js/sp/negotiation/negotiation_interface_command_receive.js?{$application_version}"></script>
	<script type="text/javascript" src="/js/sp/negotiation/negotiation_interface_command_send.js?{$application_version}"></script>
	<script type="text/javascript" src="/js/sp/negotiation/negotiation_video.js?{$application_version}"></script>
	<script type="text/javascript" src="/js/common/check_system_requirements.js?{$application_version}" charset="utf-8"></script>
	<script type="text/javascript" src="/js/sp/negotiation/negotiation_main.js?{$application_version}"></script>
	<script type="text/javascript" src="/js/sp/negotiation/negotiation_event_func.js?{$application_version}"></script>
	<script type="text/javascript" src="/js/sp/negotiation/negotiation_reaction_func.js?{$application_version}"></script>
	<script type="text/javascript" src="/js/negotiation/negotiation_conversation.js?{$application_version}"></script>
	<script type="text/javascript" src="/js/sp/negotiation/negotiation_enter_room.js?{$application_version}"></script>
	<script type="text/javascript" src="/js/sp/negotiation/negotiation_exit_room.js?{$application_version}"></script>
	<script type="text/javascript" src="/js/sp/negotiation/negotiation_setting_camera.js?{$application_version}"></script>
	<script type="text/javascript" src="/js/sp/negotiation/negotiation_extra_function.js?{$application_version}"></script>
	<script type="text/javascript" src="/js/sp/negotiation/get_oldest_user_id.js?{$application_version}"></script>
	<script type="text/javascript" src="/js/sp/negotiation/material.js?{$application_version}"></script>
	<script type="text/javascript" src="/js/sp/negotiation/negotiation_login.js?{$application_version}"></script>
	<script type="text/javascript" src="/js/share_room_url.js?{$application_version}"></script>
	<!-- web移植 end -->

	<script id="guest-end-modal-template" type="text/x-handlebars-template">
		<div class="mi_modal_default">
			<div class="mi_gest_close_mesg mi_modal_type_m">
				<p>
				本日はお忙しいところ<br>
				誠にありがとうございました。<br>
				閉じるをクリックして終了してください。
				</p>
				<div class="btn_a" align="center">
					<button type="button" name="btn_guest_end" class="mi_default_button mi_gest_close_buton hvr-fade">閉じる</button>
				</div>
			</div>
		</div>
	</script>

</body>
</html>

