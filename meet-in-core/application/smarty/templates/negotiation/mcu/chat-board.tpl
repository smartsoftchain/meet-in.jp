<!-- チャットの外側部分 -->
<div id="chat_board_area" class="ui-widget-content chat_board_area">
	<!-- チャットのコンテンツ(外側部分) -->
	<div class="chat_board_contents">

		<!-- ヘッダー部分 -->
		<div class="chat_board_head">
			<span class="icon-comment-02 mi_memo_icon" style="margin-left: 10px; font-size: 15px;"></span>
			<div class="chat_board_head_right">
				<span class="icon-close chat_board_close"></span>
			</div>
			<div class="clear_both"></div>
		</div>

		<!-- タイムライン部分 -->
		<div class="chat_board_timeline">
			<div id="chat_board_messages" class="chat_board_messages">
			</div>
		</div>

		<!-- テキストボックス、送信ボタン -->
		<div class="chat_board_send_box">
			<textarea id="chat_board_send_message" placeholder="メッセージを入力"></textarea>
			<div class="chat_board_flex_box">
				<input type="checkbox" id="select_sendMode_checkbox"><span class="chat_board_checkbox_text">Enterで送信</span>
				<button id="chat_board_send">送信</button>
			</div>
		</div>
	</div>
</div>