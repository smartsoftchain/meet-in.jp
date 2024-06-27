{literal}
<style type="text/css">
.negotiation_modal_roomshare {
  position: fixed;
  margin: auto;
	width: 474px;
  height: 329px;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  border-radius:6px
}
.negotiation_modal_roomshare .title_logo
{
	text-align: center;
	color: #b4b4b4;
	margin-top: 45px;
	font-size: 41px;
}
.negotiation_modal_roomshare .title_header
{
	margin-top: 21px;
  font-family: Meiryo;
  font-size: 18px;
  font-weight: bold;
  font-style: normal;
  font-stretch: normal;
  line-height: 1.39;
  letter-spacing: normal;
  text-align: center;
  color: #0081CC;
}
.negotiation_modal_roomshare .message_label
{
	margin-top: 8px;
  font-family: Meiryo;
  font-size: 12px;
  font-weight: normal;
  font-style: normal;
  font-stretch: normal;
  line-height: 1.17;
  letter-spacing: normal;
  text-align: center;
  color: #333333;
}
.negotiation_modal_roomshare .room_url_label
{
	margin-top: 20px;
	font-family: Meiryo;
  font-size: 20px;
  font-weight: bold;
  font-style: normal;
  font-stretch: normal;
  line-height: normal;
  letter-spacing: normal;
  text-align: center;
  color: #0081CC;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

.negotiation_modal_close {
  background: #0081CC url(../img/btn_close.png) no-repeat center center;
	position: absolute;
  top: 0px;
  right: 0px;
  display: block;
  width: 40px;
  height: 40px;
	}
	.negotiation_modal_close:hover { background-color: #A8DBFF;}

  /*コピーするボタン*/
  .room_copy_btn {
    width: 160px;
    height: 40px;
    background-color: #f5f5f5;
  }
  .room_copy_btn:hover { background: #c8c8c8; color: #fff; }

  .copy_btn_inner{
    font-family: Meiryo;
    font-size: 14px;
    font-weight: bold;
    font-style: normal;
    font-stretch: normal;
    line-height: normal;
    letter-spacing: normal;
    text-align: left;
    color: #b2b2b2;
  }
  .copy_btn_inner img{
      vertical-align: middle;
      padding-right: 10px;
      width: 20px;
  }

/* 招待文をコピするために表示するメッセージ文領域 */
.share_message_area{
	position: absolute;
	top: 0;
	left: -999;
}
.share_message{
	font-size: 0;
	height: 0;
	width: 0;
}
</style>
{/literal}

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
		<span id="meetin_room_url">{$serverAddress}/rooms/{$room_name}
      <!--https://meet-in.jp/room/xxxxxxxx-->
    </span>
	</div>
  <div class="btn_area" style="margin-top: 20px;">
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
<div class="share_message_area" id="share_message_area">
	<span class="share_message" id="share_message"></span>
</div>
<!-- ルーム共有領域 END-->
</script>
