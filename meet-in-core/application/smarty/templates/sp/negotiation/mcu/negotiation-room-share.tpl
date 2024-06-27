<div class="modal_share_room" id="modal_share_room">
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
		<span id="meetin_room_url">{$serverAddress}/rooms/{$room_name}
		<!--https://meet-in.jp/rooms/xxxxxxxx-->
		</span>
	</div>
	<div class="btn_area" style="margin-top: 20px;text-align: center;">
	  	<button type="button" id="icon_copy_sentence" class="room_copy_btn">
			<span class="copy_btn_inner"><img src="/img/lp/ico-mail.png" >招待文をコピー</span>
		</button>
		<button type="button" id="icon_copy_url" class="room_copy_btn" >
			<span class="copy_btn_inner"><img src="/img/lp/ico-copy_FFFFFF.png">URLをコピー</span>
		</button>
		<div class="copy_msg_area" id="copy_msg" style="color: #b2b2b2;margin-top: 10px;"></div>
	</div>
	<!-- 右上閉じるボタン -->
	<div class="negotiation_modal_close" id="room-share-close" >
	</div>
</div>
<!-- ルーム共有領域 -->
<div class="share_message_area">
	<span class="share_message" id="share_message"></span>
</div>
<!-- ルーム共有領域 END-->