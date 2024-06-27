<script id="room-share-modal-template" type="text/x-handlebars-template">
<!--<div class="mi_modal_default">-->
<div class="negotiation_modal_roomshare">
  <div id="meetin_room_name" hidden="">{$room_name}</div>
	<div class="title_logo" >
		<span class="icon-parsonal-puls"></span>
	</div>
	<div class="title_header">
		ルームを共有する
	</div>
	<div class="message_label" >
		現在のルームは下記になります。URLを共有して招待しましょう
	</div>
	<div class="room_url_label">
		<span id="meetin_room_url">{$serverAddress}/room/{$room_name}
      <!--https://meet-in.jp/room/xxxxxxxx-->
    </span>
	</div>
  <div class="btn_area" style="margin-top: 20px;">
    <button type="button" id="copy_url_in_room" class="room_copy_btn_in_room">
			<span class="copy_btn_inner"><img src="/img/lp/ico-copy_FFFFFF.png">URLをコピー</span>
		</button>
    <button type="button" id="copy_sentence_in_room" class="room_copy_btn_in_room">
			<span class="copy_btn_inner"><img src="/img/lp/ico-mail.png">招待文をコピー</span>
		</button>
    {if $is_operator == 1}
    <button type="button" id="sms_send_in_room" class="sms_send_btn_in_room">
			<span class="copy_btn_inner"><img src="/img/lp/ico-sms-in-room.svg">SMS送信</span>
		</button>
    {/if}
    <div class="copy_msg_area" id="copy_msg" style="color: #b2b2b2;margin-top: 10px;"></div>
  </div>
	<!-- 右上閉じるボタン -->
  <div class="negotiation_modal_close" id="room-share-close" >
  </div>
</div>

<!-- ルーム共有領域 -->
<div class="share_message_area" id="share_message_area">
	<span class="share_message" id="share_message"></span>
</div>
<!-- ルーム共有領域 END-->
</script>

<!-- SMS送信時のメッセージエリア （送信後のモーダル閉じて表示するため、script外に記載）-->
	<div id="sms_send_message_area_in_room" class="sms_send_message_area_in_room">
		<div class="sms_send_message_in_room"></div>
	</div>
<!-- SMS送信時のメッセージエリア END-->