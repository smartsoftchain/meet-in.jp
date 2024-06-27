<div class="modal-content" id="modal-content-mail">
	<div class="mi_modal_shadow"></div>
	<div class="inner-wrap mi_modal_default modal_content_mail_area">
		<div class="mcm_header">
			<div class="mcm_header_title">送信メール作成</div>
			<div class="mi_close_icon modal-close mcm_close_icon">
				<span class="icon-close mcm_icon-close"></span>
			</div>
		</div>
		<div class="mcm_contents">
			<div class="mcm_destination_area">
				<div class="mcm_destination_title">メールテンプレート</div>
				<div class="mcm_destination_data">
					<select name="select_mail_template" class="mcm_mail_body_select">
					</select>
				</div>
			</div>
			<div class="mcm_destination_area">
				<div class="mcm_destination_title">送信者名</div>
				<div class="mcm_destination_data">
					<input type="text" class="text_long" name="sender_name" value="" />
				</div>
			</div>
			<div class="mcm_destination_area">
				<div class="mcm_destination_title">送信者アドレス</div>
				<div class="mcm_destination_data">
					<input type="text" class="text_long" name="sender_address" value="" />
				</div>
			</div>
			<div class="mcm_destination_area">
				<div class="mcm_destination_title">宛先</div>
				<div class="mcm_destination_data view_destination_area" name="view_destination_text">
					
				</div>
			</div>
			<div class="mgt_20">
				<div class="mgb_10">件名</div>
				<div class="mcm_mail_subject_data">
					<input type="text" class="text_long2" name="mail_subject" value="" />
				</div>
			</div>
			<div class="mgt_20">
				<div class="mgb_10">ウェビナータグを使用する</div>
				<div class="mcm_mail_subject_data">
					<select name="select_webinar" class="mcm_mail_body_select">
					</select>
				</div>
			</div>
			<div class="mcm_mail_body_area">
				<div class="mgb_10">本文</div>
				<div class="mcm_mail_body_data_area">
					<div class="mcm_mail_body_data_head">
						<div>
							<span class="mcm_mail_body_select_title">差し込みタグ</span>
							<select name="select_mail_embedded" class="mcm_mail_body_select">
							</select>
						</div>
						<div class="mgt_20">
							<span class="mcm_mail_body_select_title">ウェビナー差し込みタグ</span>
							<select name="select_webinar_embedded" class="mcm_mail_body_select">
								<option value="">選択してください。</option>
							</select>
						</div>
					</div>
					<div class="mcm_mail_body_data_textarea">
						<a id="mail_type" name="mail_type" style="display:none;"></a>
						<textarea id="mail_body" name="mail_body" class="textarea_mail_body"></textarea>
					</div>
				</div>
			</div>
			<div class="mcm_appended_area mgt_20">
				<div class="mgb_10">添付ファイル（添付ファイルの最大容量は10Mまでで、３つまでです。）</div>
				<div class="mcm_appended_names">
				</div>
				<div class="mcm_appended_draggable_area" id="mcm_appended_draggable_area">
					<div class="mcm_appended_draggable_message">
						ファイルをドラッグ＆ドロップしてください。<br><br>
						<a href="javascript:void(0);" name="lnk_upload_appended">ファイルを追加</a>
						<input type="file" name="file_upload_appended" class="display_none">
					</div>
				</div>
			</div>
			{* <div class="mcm_send_date_area mgt_40"> 日時指定送信は、2021.8末実装予定とのことで、一旦コメントアウト*}
				{* <div class="">送信時間を選択</div>
				<div class="mcm_send_date_select">
					<label><input type="radio" class="radio_send_date_status" name="send_date_status" value="1" />今すぐ送信</label>
					<label><input type="radio" class="radio_send_date_status mgl_20" name="send_date_status" value="2" />日時を指定する</label>
				</div> *}
				{* <div class="mgb_10 mgt_20">送信日時</div>
				<div class="mcm_send_date_input">
					<input type="text" class="text_date mgr_10" name="send_date" value="" />
					<input type="text" class="text_postcode1 mgr_unset" name="send_hour" value="" maxlength="2"/>
					<input type="text" class="text_postcode1" name="send_minute" value="" maxlength="2"/>
				</div> *}
			{* </div> *}
		</div>
		<div class="mcm_btn_confirme_area">
			<button type="button" name="button_mail_confirme" class="mi_default_button">送信内容確認</button>
		</div>
	</div>
</div>
<div class="modal-content" id="modal-content-mail-confirme">
	<div class="mi_modal_shadow"></div>
	<div class="inner-wrap mi_modal_default modal_content_mail_area">
		<div class="mcm_header">
			<div class="mcm_header_title">送信メール内容の確認</div>
			<div class="mi_close_icon modal-close mcm_close_icon">
				<span class="icon-close mcm_icon-close"></span>
			</div>
		</div>
		<div class="mcm_contents_confirme">
			<div class="mgb_20">下記の内容でメールを送信します。よろしければ送信をクリックしてください。</div>
			<div class="error_mail_confirme_area"><!-- エラー表示領域 --></div>
			{* <div class="mail_confirme_send_date">送信予定日時<span name="confirme_send_date"></span></div> *}
			<div class="mcm_confirme_area">
				<div class="mcm_destination_confirme">
					<div class="mcmdc_title">送信者名</div>
					<div class="mcmdc_data" name="confirme_sender_name"></div>
				</div>
				<div class="mcm_destination_confirme">
					<div class="mcmdc_title">送信者アドレス</div>
					<div class="mcmdc_data" name="confirme_sender_address"></div>
				</div>
				<div class="mcm_destination_confirme">
					<div class="mcmdc_title">宛先</div>
					<div class="mcmdc_destination_text" name="confirme_view_destination_text"></div>
				</div>
				<div class="mcm_destination_confirme">
					<div class="mcmdc_title">件名</div>
					<div class="mcmdc_data" name="confirme_mail_subject"></div>
				</div>
				<div class="mcm_mail_body_confirme">
					<textarea id="confirme_mail_body" name="confirme_mail_body" class="textarea_mail_body_confirme" readonly></textarea>
				</div>
				<div class="mcm_appended_confirme">
					<div class="mcmdc_title">添付ファイル</div>
					<div class="mcmdc_appended_names_data" name="confirme_appended_names"></div>
				</div>
			</div>
		</div>
		<div class="mcm_btn_confirme_area">
			<div><button type="button" name="btn_send_mail" class="mi_default_button">送信</button></div>
			<div class="mgt_20"><button type="button" name="btn_cancel_mail" class="mi_cancel_btn">キャンセル</button></div>
		</div>
	</div>
</div>
<div class="modal-content" id="modal-content-mail-complete">
	<div class="mi_modal_shadow"></div>
	<div class="inner-wrap mi_modal_default modal_content_mail_area height400">
		<div class="mcmc_icon_area">
			<img src="/img/webinar_complete_check.png" alt="" />
		</div>
		<div class="mcmc_message_area">
			送信が完了しました。
			{* 送信が完了しました。 TODO: 2021.8末 実装予定の送信予約機能実装時に文言を戻す*}
		</div>
		<div class="mcmc_btn_complete_area">
			<div><button type="button" name="btn_mail_complete" class="mi_default_button">閉じる</button></div>
		</div>
	</div>
</div>
<div class="modal-content" id="modal-content-display-mail">
	<div class="mi_modal_shadow"></div>
	<div class="inner-wrap mi_modal_default modal_content_mail_area">
		<div class="mcm_header">
			<div class="mcm_header_title">送信内容</div>
			<div class="mi_close_icon modal-close mcm_close_icon close_modal_display_mail">
				<span class="icon-close mcm_icon-close"></span>
			</div>
		</div>
		<div class="mcm_contents_confirme">
			<div class="mail_confirme_send_date">送信予定日時<span name="confirme_send_date"></span></div>
			<div class="mcm_confirme_area">
				<div class="mcm_destination_confirme">
					<div class="mcmdc_title">送信者名</div>
					<div class="mcmdc_data" name="confirme_sender_name"></div>
				</div>
				<div class="mcm_destination_confirme">
					<div class="mcmdc_title">送信者アドレス</div>
					<div class="mcmdc_data" name="confirme_sender_address"></div>
				</div>
				<div class="mcm_destination_confirme">
					<div class="mcmdc_title">宛先</div>
					<div class="mcmdc_destination_text" name="confirme_view_destination_text"></div>
				</div>
				<div class="mcm_destination_confirme">
					<div class="mcmdc_title">件名</div>
					<div class="mcmdc_data" name="confirme_mail_subject"></div>
				</div>
				<div class="mcm_mail_body_confirme" id="confirme_mail_body" name="confirme_mail_body"></div>
				<div class="mcm_appended_confirme">
					<div class="mcmdc_title">添付ファイル</div>
					<div class="mcmdc_appended_names_data" name="confirme_appended_names"></div>
				</div>
			</div>
		</div>
		<div class="mcm_btn_confirme_area">
			<div class="mgt_20"><button type="button" class="mi_cancel_btn close_modal_display_mail">閉じる</button></div>
		</div>
	</div>
</div>