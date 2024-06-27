{include file="./common/header.tpl"}
<!-- ====================================== モーダルコンテンツ[start] ====================================== -->
<div class="modal-content model_call_operator_wrap" id="modal-content"> <!-- id="db-log2"	-->
	<div class="mi_modal_shadow"></div>
	<div class="inner-wrap mi_modal_default">
	</div>
</div>
<!-- ====================================== モーダルコンテンツ[end] ======================================== -->



{literal}

<script>
	var isJSON = function(arg) {
		arg = (typeof arg === "function") ? arg() : arg;
		if(typeof arg !== "string") {
			return false;
		}
		try {
			arg = (!JSON) ? eval("(" + arg + ")") : JSON.parse(arg);
			return true;
		} catch(e) {
			return false;
		}
	};
	$(function (){

		// ブラウザバック時
		if (window.performance.navigation.type == 2) {
			location.reload();
		}

		var clientId = "{/literal}{$clientDict.client_id}{literal}";
		// アイドマ担当者のIDを画面表示時１度設定する
		var checkAAStaffList = jQuery.parseJSON('{/literal}{$checkAAStaffListJson}{literal}');
		// アイドマ担当者ボタンのイベント
		$(".detail_open").click(function(){
			$("#modal-content").show();
			// モーダル内のタグを削除する
			$("div.inner-wrap").empty();
			// スタッフリスト取得
			$.ajax({
				url: "/admin/get-client-staff-list",
				type: "POST",
				dataType: "text",
				data: {
					"staff_type" : $('input[id=staff_type]').val(),
					"staff_id"   : $('input[id=staff_id]').val(),
				},
			}).done(function(res) {
				if(isJSON(res)) {
					staffList = jQuery.parseJSON(res);
					// テンプレート生成
					var template = Handlebars.compile($('#aa-staff-modal-template').html());
					$('div.inner-wrap').append(template({
						"aaStaffList": staffList,
					}));
					// チェックを付ける
					for (var i = 0; i < checkAAStaffList.length; i++) {
						staffId = checkAAStaffList[i];
						$("#aa_staff_id_"+staffId).prop("checked",true);
					}
				} else {
					$("#modal-content").hide();
					return false;
				}
			}).fail(function(res) {
				$("#modal-content").hide();
				return false;
			});
			// モーダルを表示する為のクリックイベントを発生させる
			$('.modal-open').trigger("click");
		});

		// アイドマ担当者選択モーダル内の検索の実行
		$(document).on('click', '[id=on_free_word]', function(){
			var name = $("#free_word").val();
			if(name == ""){
				name = "";
				$("tr.idsselect").attr("style", "");
			}else{
				var reg = new RegExp(name);
				$("tr.idsselect").css("display", "none");
				$("td#name").each(function (i) {
					i = i+1;
					if($(this).text().match(reg)){
						$(this).parent("tr").toggle();
					}
				});
			}
		});
		// アイドマ担当者選択モーダル内の検索欄のクリア
		$(document).on('click', '.search_close_button', function(){
			$("#free_word").val("");
			$("tr.idsselect").attr("style", "");
		});

		// アイドマ担当者モーダルの選択するボタン押下時のイベント
		$(document).on('click', '[id=decision]', function(){
			var userName;
			$('#retrieval_value').focus();
			var checked = $("[name='aa_staff_id[]']:checked");

			ids = [];
			$.each(checked, function(idx, row){
				if(idx == 0){
					userName = $("#aa_staff_name_"+row.value).val();
				}else if(idx == 1){
					userName = userName+"他";
				}
				ids.push(row.value);
			});
			// 次回表示時に使用する為グローバル変数へ設定する
			checkAAStaffList = ids;
			// アイドマ担当者欄に名前を設定する
			$("span#aa_staff_name").empty();
			$("span#aa_staff_name").append(userName);
			// モーダルを閉じる
//			$('.modal-close').trigger("click");
			$("#modal-content").hide();
		});

		$(".modal-content").on('click','.modal-close',function(){
			$("#modal-content").hide();
		});

		$("[name=submit_button]").click(function(){
			$("#submit_button").prop("disabled", true);
			$("#submit_button").text("登録中です...");
			$("#client_form").submit();
		});

		// 編集画面へ遷移
		$("*[name^=edit_]").click(function(){
			var ids = $(this).attr("name").split("_");
			var url = "/admin/staff-regist?staff_type=" + ids[1] + "&staff_id=" + ids[2] + "&client_id=" + ids[3];
			$(location).attr("href", url);
		});

		// 担当者の削除処理
		$("#del_chk").click(function(){
			if(!confirm('チェックされたアカウントを削除します。よろしいですか？')) {
				return;
			}
			var cnt = 0
			for (var i=0 ; i==i ; i++ ) {
				var doc = "del_" + i;
				if ( document.getElementById( doc ) == null ) {
					break;
				}
				if ( document.getElementById( doc ).checked ) {
					var ids = document.getElementById( doc ).value.split("_");
					cnt++;
					// 担当者削除処理を非同期にて行う
					$.ajax({
						url: "staff-delete",
						type: "POST",
						data: {staff_type : ids[0], staff_id : ids[1]},
						//dataType: 'json',
						success: function(result) {
							if(result == 1){
//								alert("削除に成功しました");
//								location.reload();
							}else{
								alert("削除に失敗しました");
								location.reload();
							}
						}
					});
				}
			}
			if (cnt>0) {
				alert("削除に成功しました");
				location.reload();
			} else {
				alert("削除対象がありません");
			}
		});

// 文字起こし
		var remainingHourElement = '#negotiation_audio_text_remaining_hour';
		var remainingLimitElement = '#negotiation_audio_text_time_limit_second';
		function negotiationAudioTextTimeLimitSecondReadonly(element, isReadonly) {
			if(isReadonly) {
				$(element).css("background-color" ,"#F5F5F5")
			} else {
				$(element).css("background-color" ,"#FFFF")
			}
		}
		negotiationAudioTextTimeLimitSecondReadonly(remainingLimitElement, $(remainingHourElement).val() == "" || $(remainingHourElement).val() == 0);
		$(remainingHourElement).on('focus', function () {
			$(this).data('befor', this.value);
		}).on('input', function() {
			negotiationAudioTextTimeLimitSecondReadonly(remainingLimitElement, this.value == "" || this.value < 1)
			const max_remaining_hour = 999;
			if(max_remaining_hour < this.value){
				this.value = max_remaining_hour;
			}
			if(this.value < 0){
				this.value = "";
			}
			if($(this).data('befor') == "") {
				$(remainingLimitElement).val(this.value);
			}
			if(this.value == "0"){
				negotiationAudioTextTimeLimitSecondReadonly(remainingHourElement, true);
				negotiationAudioTextTimeLimitSecondReadonly(remainingLimitElement, false);
			} else {
				negotiationAudioTextTimeLimitSecondReadonly(remainingHourElement, false);
			}
		});
　　// 音声分析も同様にReadOnly処理を追加
		var remainingVoiceAnalysisHourElement = '#negotiation_audio_analysis_remaining_hour';
		var remainingVoiceAnalysisLimitElement = '#negotiation_audio_analysis_time_limit_second';
		function negotiationAudioTextTimeLimitSecondReadonly(element, isReadonly) {
			if(isReadonly) {
				$(element).css("background-color" ,"#F5F5F5")
			} else {
				$(element).css("background-color" ,"#FFFF")
			}
		}
		negotiationAudioTextTimeLimitSecondReadonly(remainingVoiceAnalysisLimitElement, $(remainingVoiceAnalysisHourElement).val() == "" || $(remainingVoiceAnalysisHourElement).val() == 0);
		$(remainingVoiceAnalysisHourElement).on('focus', function () {
			$(this).data('befor', this.value);
		}).on('input', function() {
			negotiationAudioTextTimeLimitSecondReadonly(remainingVoiceAnalysisLimitElement, this.value == "" || this.value < 1)
			const max_remaining_hour = 999;
			if(max_remaining_hour < this.value){
				this.value = max_remaining_hour;
			}
			if(this.value < 0){
				this.value = "";
			}
			if($(this).data('befor') == "") {
				$(remainingVoiceAnalysisLimitElement).val(this.value);
			}
			if(this.value == "0"){
				negotiationAudioTextTimeLimitSecondReadonly(remainingVoiceAnalysisHourElement, true);
				negotiationAudioTextTimeLimitSecondReadonly(remainingVoiceAnalysisLimitElement, false);
			} else {
				negotiationAudioTextTimeLimitSecondReadonly(remainingVoiceAnalysisHourElement, false);
			}
		});

		// 文字起こし、音声分析の基本契約時間が 0のときに限り, 即時反映ボタンのdisabledを外す。
		const negotiationAudioTextRemainingHour = $('#negotiation_audio_text_remaining_hour').val(); // 文字起こし基本時間
		const negotiationAudioAnalysisRemainingHour = $('#negotiation_audio_analysis_remaining_hour').val(); // 音声分析基本時間

		// 文字起こし 
		if (negotiationAudioTextRemainingHour && Number(negotiationAudioTextRemainingHour) === 0) {
			$('#audio_text_reflect_button').prop('disabled', false);
		} else {
			$('#audio_text_reflect_button').prop('disabled', true);
		}
		// 音声分析 
		if (negotiationAudioAnalysisRemainingHour && Number(negotiationAudioAnalysisRemainingHour) === 0) {
			$('#audio_analysis_reflect_button').prop('disabled', false);
		} else {
			$('#audio_analysis_reflect_button').prop('disabled', true);
		}

			// 文字起こし即時反映ボタン押下時
		$('#audio_text_reflect_button').click(function() {
			updateNegotiationAudioTextTimeLimitSecondImmediately();
		});

		// 音声分析即時反映ボタン押下時
		$('#audio_analysis_reflect_button').click(function() {
			updateNegotiationAudioAnalysisTimeLimitSecondImmediately();
		});

		// 文字起こし即時反映ボタン押下時のPOST処理
		function updateNegotiationAudioTextTimeLimitSecondImmediately() {
			const inputAudioTextTime = $('#negotiation_audio_text_remaining_hour').val();
			
			$.ajax({
				url: "/admin/update-negotiation-audio-text-time-immediately",
				type: "POST",
				dataType: "json",
				data: {
				"clientId" : clientId,
				"inputTime" : inputAudioTextTime
				},
			}).done(function(result) {
				if (result['status'] === '1') {
					// ボタンのdisabled化
					$('#audio_analysis_reflect_button').prop('disabled', true);
					// 成功したら画面を更新
					location.reload();
				} else if (result['status'] === '0') {
					console.log('失敗', result['errorList']);
					alert("文字起こしの即時反映に失敗しました");
					location.reload();
				}
			}).fail(function(result) {
					alert("文字起こし時間の即時反映に失敗しました");
					location.reload();
			});
		}

		// 音声分析即時反映ボタン押下時のPOST処理
		function updateNegotiationAudioAnalysisTimeLimitSecondImmediately() {
			const inputAudioAnalysisTime = $('#negotiation_audio_analysis_remaining_hour').val();
			
			$.ajax({
				url: "/admin/update-negotiation-audio-analysis-time-immediately",
				type: "POST",
				dataType: "json",
				data: {
					"clientId" : clientId,
					"inputTime" : inputAudioAnalysisTime
				},
			}).done(function(result) {
				if (result['status'] === '1') {
					// ボタンのdisabled化
					$('#audio_analysis_reflect_button').prop('disabled', true);
					// 成功したら画面を更新
					location.reload();
				} else if (result['status'] === '0') {
					console.log('失敗', result['errorList']);
					alert("音声分析時間の即時反映に失敗しました");
					location.reload();
				}
			}).fail(function(result) {
				alert("音声分析時間の即時反映に失敗しました");
				location.reload();
			});
		}


		// tabUI
		$("#nav-tab").on("click", "[role=tab]", function() {
			const clickedTabRef = $(this).attr("href");
			// クリックされたタブの領域を表示、それ以外非表示
			$("#nav-tab").find('li').each( function() {
				const tabRef = $(this).attr("href");
				if (tabRef === clickedTabRef) {
					$(tabRef).show();
					$(this).addClass("active")
				} else {
					$(tabRef).hide();
					$(this).removeClass("active")
				}
			});
		});

		// ----------メール設定タブ----------

		// MTA設定追加時に必要な次のインデックス番号を生成
		// function _getNextIndex() {
		// 	var max_index = 0;
		// 	$("#mta-setting table").each(function() {
		// 
		// 		var current_sender_address_name = $(this).find(".sender_address").attr("name");
		// 
		// 		console.log("name : ", current_sender_address_name);
		// 
		// 		if (current_sender_address_name.match(/^mta_setting\[([0-9]+)\]\[sender_address\]$/)) {
		// 			max_index = Math.max(max_index, (+RegExp.$1));
		// 		}
		// 	});
		// 
		// 	return (max_index + 1);
		// }

		// MTA設定の追加
		$("#add-new-mta-setting").on("click", function() {
			const template = Handlebars.compile($('#sender-mail-info-template').html());

			// 現在の[name='mta_setting']の最大のインデックス値に+1した、値を取得する。
			// var next_index = _getNextIndex();

			$("#mta-setting").append(template);
		});
		// 新規のMTA設定の削除
		$(document).on("click", ".delete-new-mta-setting", function() {
			$(this).closest('div[name="mta-setting-template"]').remove();
		});

		$("#mta_submit_button").on("click", function() {
			let sendData = [];
			$("[name=mta-setting-template]").each(function() {
				let mtaSetting = {
					"sender_address" : $(this).find("[name=sender_address]").val(),
					"sender_smtp_server" : $(this).find("[name=sender_smtp_server]").val(),
					"sender_smtp_port" : $(this).find("[name=sender_smtp_port]").val(),
					"ehlo_user" : $(this).find("[name=ehlo_user]").val(),
					"ehlo_password" : $(this).find("[name=ehlo_password]").val(),
					"dsn_server" : $(this).find("[name=dsn_server]").val(),
					"dsn_port" : $(this).find("[name=dsn_port]").val(),
					"dsn_user" : $(this).find("[name=dsn_user]").val(),
					"dsn_password" : $(this).find("[name=dsn_password]").val(),
					"note" : $(this).find("[name=note]").val(),
				};
				sendData.push(mtaSetting);
			})
			const sendDataJson = JSON.stringify(sendData)
			$.ajax({
				url: "/mta-setting/create",
				type: "POST",
				dataType: "json",
				data: {
					"settings" : sendDataJson
				},
			}).done(function(result) {
				if(result["status"] === true) {
					alert("ドメインを作成しました");
					// モーダルを閉じる
					$("#modal-content").hide();
					location.reload();
				} else if(result["status"] === false) {
					alert(result["result"].join('\n'));
				} else {
					alert("サーバーエラーです。管理者にお問い合わせください。")
				}
			}).fail(function(res) {
					alert("サーバーエラーです。管理者にお問い合わせください。")
			});
		});
		// 新規ドメイン追加モーダル
		$("#add-domain-button").click(function() {
			$("#modal-content").show();
			// モーダル内のタグを削除する
			$("div.inner-wrap").empty();
			// テンプレート生成
			const template = Handlebars.compile($('#add-domain-modal-template').html());
			$('div.inner-wrap').append(template);
			// モーダルを表示する為のクリックイベントを発生させる
			$('.modal-open').trigger("click");
		});
		// 新規ドメイン登録ボタン押下時
		$(document).on("click", "#add-domain-decision", function() {
			// TODO
			$.ajax({
				url: "/domain-setting/create",
				type: "POST",
				dataType: "text",
				data: {
					"domain" : $("#domain-input").val()
				},
			}).done(function(res) {
				result = jQuery.parseJSON(res);
				if(result["status"] === true) {
					alert("ドメインを作成しました");
					// モーダルを閉じる
					$("#modal-content").hide();
					location.reload();
				} else if(result["status"] === false) {
					alert(result["result"].join('\n'));
				} else {
					alert("サーバーエラーです。管理者にお問い合わせください。")
				}
			}).fail(function(res) {
					alert("サーバーエラーです。管理者にお問い合わせください。")
			});
		});

		// ドメイン削除時の挙動
		$(".delete-domain").click(function() {
			if(confirm($(this).data("domain") + "を削除します")) {
				const id = $(this).data("id");
				// TODO
				$.ajax({
					url: "/domain-setting/delete",
					type: "POST",
					dataType: "text",
					data: {
						"id" : id
					},
				}).done(function(res) {
					result = jQuery.parseJSON(res);
					if(result["status"] === true) {
						alert("ドメインを削除しました");
						// モーダルを閉じる
						$("#modal-content").hide();
						location.reload();
					} else if(result["status"] === false) {
						alert(result["result"].join('\n'));
					} else {
						alert("サーバーエラーです。管理者にお問い合わせください。")
					}
				}).fail(function(res) {
						alert("サーバーエラーです。管理者にお問い合わせください。")
				});
			}
		})
		// ドメイン設定table内table表示ロジック
		$(function() {
			const table = $("#send-email-table")

			const _getTemplate = function(type) {
				return Handlebars.compile($(`#send-email-domain-${type}-template`).html());
			}

			table.on("click", "[data-type]", async function() {
				var type = $(this).data("type")
				const template = _getTemplate(type);
				const id = $(this).data("id");
				const parentTableRow = $(this).parents("tr");
				const nextTableRow = parentTableRow.next();
				var domain = parentTableRow.data("domain");
				if (type == "spf") {
					const  dns  = jQuery.parseJSON(await $.get(`/domain-setting/fetch-row?id=${id}`))
					// 次の行がappendされたものだった場合一旦削除
					if (nextTableRow.hasClass("appended")) {
						nextTableRow.remove();
					}
					// toggle
					if ($(this).hasClass("current")) {
						nextTableRow.remove();
						parentTableRow.find(".current").each(function() {
							$(this).removeClass("current");
						})
					} else {
						parentTableRow.after(template({dns: dns}))
						$(this).addClass("current");
					}
				} else {
					if (nextTableRow.hasClass("appended")) {
						nextTableRow.remove();
					}
					// toggle
					if ($(this).hasClass("current")) {
						nextTableRow.remove();
						parentTableRow.find(".current").each(function() {
							$(this).removeClass("current");
						})
					} else {
						parentTableRow.after(template({domain: domain}))
						$(this).addClass("current");
					}
				}
			})

	    $('input[name="client_type"]:radio').change(function()
	    {
			switch($(this).val())
			{
				case "1":
					if(!confirm('入力内容が削除されます。よろしいですか?')) {
						$('#client_type_2').prop('checked', true);
						return;
					}
					$("#purchasing_client_account_cnt").val("");
					$("#distributor_salesstaff_name").val("");
					$("#distributor_salesstaff_email").val("");
					$("#distributor_salesstaff_ccemail").val("");

					$("#client_type_user").show();
					$("#client_type_distributor").hide();
					break;

				case "2":
					if(!confirm('「購入経路」の入力内容が削除されます。よろしいですか?')) {
						$('#client_type_1').prop('checked', true);
						return;
					}
					$("#distribution_channel_client_name").val("");
					$("#distribution_channel_client_id").val("");

					$("#client_type_distributor").show();
					$("#client_type_user").hide();
					break;
			}
	    });

	    $('input[name="distribution_channel_client_name"]').on('change', function () {
			let client_id = $("#distributor_list option[value='" + $(this).val() + "']").data('hidden-value');
			$('#distribution_channel_client_id').val(client_id);
	    });

	});

	// 二要素認証のON/OFF表示
	function checkAuthenticationState() {

		let isChecked = $('[name=check_auth]').prop('checked');
		let isOn = '#FFA000';
		let isOff = '#B1B1B1';
		let color = isChecked ? isOn : isOff;
		let value = isChecked ? 1 : 0;
		$(".switchArea label").css('background-color', color);
		$('[name=two_factor_authenticate_flg]').val(value);
	}

	// 初期読み込み時
	checkAuthenticationState();

	$('[name=check_auth]').change(function() {
		checkAuthenticationState();
	});

});



</script>


<style type="text/css">

<!--

.icon-delete {
  *zoom: expression(this.runtimeStyle['zoom'] = '1', this.innerHTML = '&#xe915;');
}

/* 必須のスタイル */
.required {
	margin-left: 8px;
	padding: 2px 5px;
	font-size: 12px;
	font-weight: bold;
	line-height: 1.0;
	color: #fff;
	background: #df6b6e;
}

.clickable {
	cursor: pointer;
}

.text-truncate {
	text-overflow: ellipsis;
	overflow: hidden;
	white-space: nowrap;
}

.ml-auto {
	margin-left: auto;
}
.mx-auto {
	margin: 0 auto; 
}

.outline-dark-btn {
	display: inline-block;
	color: #DBDBDB;
	text-align: center;
	vertical-align: middle;
	background-color: white;
	border: 1px solid #DBDBDB;
	padding: .5rem .75rem;
	line-height: 1.5;
	border-radius: .25rem;
}

.mi_table_main2 {
  margin: 0 auto;
  height: auto;
  width: 960px;
  border: 2px ridge;
}

.mi_table_main_wrap2 {
  width: 960px;
  max-width: 960px;
}

.mi_table_main2 tr {
  border: 2px ridge;
}

.mi_table_main2 th {
  height: 40px;
  color: #fff;
  background-color: #ffaa00;
  font-weight: normal;
  text-align: center;
  vertical-align: middle;
  white-space: nowrap;
  border-right: 2px ridge;
}

.mi_table_main2 td {
  width: auto;
  height: 40px;
  margin: 0px;
  padding: 0px;
  color: #6e6e6e;
  text-align: left;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  border-bottom: 1px solid #c8c8c8;
  vertical-align: middle;
}
.mgl_10{
	margin-left: 10px;
}
/*-------------------------------------
	（モーダル）基本型
--------------------------------------*/
.modal-content {
  display: none;
  position: fixed;
  height: 100%;
  width: 100%;
  top: 0%;
  left: 0%;
	z-index: 501;
}

.modal-content .inner-wrap {
	line-height: 1.2;
	position: absolute;
	z-index: 503;
	height: 70%;
  width: 30%;
	background: #fff;
	padding: 20px 30px;
}

.modal-content .list-area,
.modal-content .edit-area {
	width: 100%;
	max-width: 1180px;
	overflow: auto;
}

/* モーダル */
.modal-content .inner-wrap h5 {
    padding: 5px 0 10px 0;
    font-size: 1.3em;
    font-weight: bold;
    color: #215b82;
}

.f_name_{
	display: inline-block !important;
	width: 150px !important;
	height: 100%;
	padding: 0 10px;
}
.text_short{
	width:60px !important;
	height: 100%;
	padding: 0 10px;
	display: inline-block !important;
}
.text_medium{
	width:200px !important;
	height: 100%;
	display: inline-block !important;
	padding: 0 10px;
}
.text_long{
	width:443px !important;
	height: 100%;
	padding: 0 10px;
	display: inline-block !important;
}

.text_long2{
	width: calc(100% - 255px);
	height: 100%;
	padding: 0 10px;
	display: inline-block !important;
}

.f_mail{width:295px !important;}

/*-----------------------
	モーダル領域
------------------------*/


.modal-overlay {
	display: none;
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
    background-color: rgba(0,0,0,0.4);
	z-index: 500;
}

.modal-open {
	color: #1b75b1;
	text-decoration: underline;
}

.modal-open:hover {
	color: #df6b6e;
	text-decoration: underline;
}


/* エラーメッセージ */
.errmsg {
	font-size: 0.95em;
	line-height: 1.6;
	color: #df6b6d;
	padding-bottom: 15px;
}

.modal-content .list-area.hgt3,
.modal-content .edit-area.hgt3 {
	margin-top: 2px;
	height: 80%;
	height: calc(100% - 145px);
}

.mi_table_main td {
	text-align: left;
}
/*-----------------------
	table装飾
------------------------*/
.listtable {
	min-width: 100%;	/* ■ */
	border-spacing: 0;
	border-collapse: collapse;
	border-width: 1px 0 0 1px;
	border-style: solid;
	border-color: #e5e5e5;
	background: #fff;
}

.listtable tr:nth-child(odd) td {
	background-color: #f6f6f6;
}

.listtable tr:hover td {
	background: #f9e8ca;
}

.listtable tr.nobg td,
.listtable tr.nobg:hover td {
	background: none;
}

.listtable th,
.listtable td {
	border-width: 0 1px 1px 0;
	border-style: solid;
	border-color: #d5d8dc;
	color: #333333;
	line-height: 1.3;
	vertical-align: middle;
	white-space: nowrap;
}
.listtable th {
	padding: 16px 11px 13px 11px;
	background: #cfe8f3;
	font-weight: bold;
}
.listtable td {
	padding: 13px 11px 11px 11px;
	font-size: 0.9em;
	font-weight: normal;
	line-height: 1.6;
}

.listtable.narrow th {
	padding: 12px 11px 9px 11px;
}
.listtable.narrow td {
	padding: 10px 11px 8px 11px;
}

.modal-content .list-area .listtable th {
	padding: 6px 10px 3px 10px;
	font-size: 1em;
	line-height: 1.2;
	text-align: center;
}

.modal-content .list-area .listtable td {
	padding: 11px 10px 8px 10px;
	font-size: 0.9em;
	line-height: 1.2;
}

.modal_search_area{
	text-align:left;
	margin-top: 10px;
	margin-bottom: 20px;
}

.srch-s { width: 65px; line-height: 30px; }
.flt-r { float: right; }

.large2 {
	width: 240px;
	line-height: 47px;
	font-size: 17px;
	font-weight: bold;
}
/*-----------------------
	ドメイン設定table装飾
------------------------*/
.domain_config_table td {
	border: solid 1px #DBDBDB;
	border-collapse: collapse;
}
.domain_config_table .delete_column {
	width: 100px;
	text-overflow: initial;
}
.domain_config_table td:hover {
	background-color: #fff4e1;
}
.domain_config_table td.delete_column:hover {
	background-color: initial;
}
/* 共通CSSの打ち消し */
.domain_config_table tbody tr:hover {
  	background-color: initial;
}

.domain_status_wrap {
	display: flex;
	vertical-align: center;
	align-items: center;
}

.appended .appended__table {
	overflow: scroll;
}

/* モーダル内 */
.add-domain-form {
	display: flex;
	flex-direction: column;
	text-align: center;
	vertical-align: center;
	align-items: center;
}
/*-----------------------
	タブUI
------------------------*/

#negotiation_audio_text_remaining_hour,
#negotiation_audio_analysis_remaining_hour {
	width: 60px !important;
}

#negotiation_audio_text_time_limit_second{
	width: 120px !important;
}

.client_regist .mi_tabel_title{
    width: 225px;
}

input[type="date"] {
  color: #333;
  width: 374px;
  height: 40px;
  position: relative;
  border: 1px solid #B1B1B1;
  border-radius: 4px;
  padding: 0 10px;
}

input[type="date"]::-webkit-inner-spin-button{
  -webkit-appearance: none;
}

input[type="date"]::-webkit-clear-button{
  -webkit-appearance: none;
}

input[type=date]::-webkit-calendar-picker-indicator {
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: 0;
}

.mi_table_main_wrap {
	max-height: none;
	min-height: auto;
	margin-bottom: 50px;
}

h3:before {
  content: "";
  width: 12px;
  height: 12px;
  background-color: #ffaa00;
  display: inline-block;
  margin-right: 3px;
}

.mi_table_main_wrap .client_type_area {
	padding: 20px 20px;
}

.audio_text_term_area, .audio_analysis_term_area {
	height: 35px;
}

.client_type_area dt {
	padding: 15px 0px 0;
}

.client_type_area input {
	height: 35px;
}

.mi_tabel_content a{
	color: blue;
	border-bottom: 1px solid blue;
}

.mi_tabel_content a:visited{
	color: blue;
}


.nav-tabs {
	border-bottom: 3px solid #DBDBDB;
	display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -ms-flex-wrap: wrap;
    flex-wrap: wrap;
    padding-left: 0;
    margin-bottom: 0;
    list-style: none;
    justify-content: flex-end;
	margin-top: 2em;
	margin-bottom: 2em;
}
.nav-tabs .nav-item {
	width: 100px;
	margin-left: .5em;
	text-align: center;
    border: 1px solid transparent;
    border-top-left-radius: .25rem;
    border-top-right-radius: .25rem;
	display: block;
    padding: .5rem 1rem;
	cursor: pointer;
	background: #FFFFFF
}
.nav-tabs .nav-item.active {
	background-color: #ffe1a0
}
.immediate_reflect_button {
	width: 100px;
  height: 25px;
  margin-left: 20px;
}
.immediate_reflect_button:hover {
	opacity: 0.7;
}
.immediate_reflect_button:disabled {
	background: #b4b4b4;
	pointer-events: none;
}
.audio_specification_description {
	white-space: normal;
	width: 470px;
	font-size: 11px;
	line-height: 2.0;
	color: #6E6E6E;
}

td.mi_tabel_content.td_redirect {
	height: auto;
}

td.mi_tabel_content.td_redirect input {
	height: 42px;
}

td.mi_tabel_content.td_redirect span {
	display: block;
	font-size: 11px;
	margin: 5px 0 0;
}

-->
</style>

{/literal}


<!-- メインコンテンツ start -->
<div id="mi_main_contents">
	<!-- トップナビ start -->
	<div id="mi_top_nav" class="acount_manage_on">
		<ul>
			{if $user.staff_type=="AA"}
			<li class="">
				<a href="/admin/staff-list?staff_type=AA" class="hvr-underline-from-center">
					<span class="icon-parsonal mi_default_label_icon"></span>
					<div class="">AAアカウント管理</div>
				</a>

			</li>
			<li class="mi_select">
				<a href="/admin/client-list" class="hvr-underline-from-center">
					<span class="icon-company mi_default_label_icon"></span>
					<div class="">クライアント管理</div>
				</a>
			</li>
			<li class="">
				<a href="/admin/distributor-list" class="hvr-underline-from-center">
					<span class="icon-company mi_default_label_icon"></span>
					<div class="">販売店管理</div>
				</a>
			</li>
			{else if $user.staff_type=="CE"}
			<li class="mi_select">
				<a href="/admin/client-edit?staff_type={$user.staff_type}&client_id={$user.client_id}&ret=top" class="hvr-underline-from-center">
					<span class="icon-company mi_default_label_icon"></span>
					<div class="">クライアント管理</div>
				</a>
			</li>
				{if $user.client_type=="2"}
				<li class="">
					<a href="/admin/distributor-client-list?client_id={$user.client_id}" class="hvr-underline-from-center">
						<span class="icon-company mi_default_label_icon"></span>
						<div class="">販売店管理</div>
					</a>
				</li>
				{/if}
			{/if}


		</ul>

		<!-- パンくずリスト start -->
		<div class="mi_breadcrumb_list">
		<a href="/index/menu">TOP</a>&nbsp;&gt;&nbsp;
		{if $user.staff_type=="AA"}
		<a href="/admin/staff-list?staff_type=AA">AAアカウント管理</a>&nbsp;&gt;&nbsp;
		<a href="/admin/client-list">クライアント／企業アカウント一覧</a>&nbsp;&gt;&nbsp;
		{/if}
		<a href="/admin/client-edit?client_id={$clientDict.client_id}&staff_type={$user.staff_type}{if $pram.ret=="top"}&ret=top{/if}">クライアント／企業情報編集・アカウント一覧</a>
		</div>
		<!-- パンくずリスト end -->

	</div>
	<!-- トップナビ end -->

	<!-- コンテンツエリア start -->
	<div id="mi_content_area">

		<!-- コンテンツタイトル start -->
		<div class="mi_content_title">
			<span class="icon-company mi_content_title_icon"></span>
			<h1>
				クライアント／企業アカウント編集
			</h1>
		</div>
		<!-- コンテンツタイトル end -->

		<!-- 切り替えタブ start -->
		<nav id="nav-tab">
			<ul class="nav-tabs">
				<li class="nav-item active" href="#tab-overview" role="tab"><span>概要</span></li>
				{if $authResult}
					<li class="nav-item" href="#tab-mail-config" role="tab"><span>メール設定</span></li>
				{/if}
			</ul>
		</nav>
		<!-- 切り替えタブ end -->

		<!-- 概要タブ start -->
		<div id="tab-overview">
		
			<!-- エラーメッセージ表示エリア begin -->
			{if $errorList|@count gt 0}
			<p class="errmsg mb10">
				下記にエラーがあります。<br />
				<strong>
					{foreach from=$errorList item=err}
						{foreach from=$err item=e}
							{$e}<br>
						{/foreach}
					{/foreach}
				</strong>
			</p>
			{/if}
			<!-- エラーメッセージ表示エリア end -->
			<form action="/admin/client-edit" method="post" id="client_form" enctype="multipart/form-data">

				<!-- テーブル start -->
				<h3>クライアント情報</h3>
				<div class="mi_table_main_wrap mi_table_input_right_wrap">
					<table class="mi_table_input_right mi_table_main">
						<tbody>
							<tr>
								<th class="mi_tabel_title">ID</th>
								<td class="mi_tabel_content">&nbsp;&nbsp;{if $clientDict.client_id !=''}CA{$clientDict.client_id|string_format:"%05d"}{else}新規{/if}</td>
							</tr>
							<tr>
								<th class="mi_tabel_title">会社名<span class="required">必須</span></th>
								<td class="mi_tabel_content">
									<input type="text" class="text_medium" name="client_name" id="client_name" value="{$clientDict.client_name|escape}" />
								</td>
							</tr>
							<tr>
								<th class="mi_tabel_title">フリガナ<span class="required">必須</span></th>
								<td class="mi_tabel_content">
									<input type="text" class="text_medium" name="client_namepy" id="client_namepy" value="{$clientDict.client_namepy|escape}" />
								</td>
							</tr>
							<tr>
								<th class="mi_tabel_title">住所<span class="required">必須</span></th>
								<td class="mi_tabel_content">
									&nbsp;〒&nbsp;<input type="text" class="text_short" name="client_postcode1" id="client_postcode1" value="{$clientDict.client_postcode1|escape}" />&nbsp;-&nbsp;
									<input type="text" class="text_short" name="client_postcode2" id="client_postcode2" value="{$clientDict.client_postcode2|escape}" />&nbsp;&nbsp;
									<input type="text" class="text_long2" name="client_address" id="client_address" value="{$clientDict.client_address|escape}" />
								</td>
							</tr>
							<tr>
								<th class="mi_tabel_title">電話番号</th>
								<td class="mi_tabel_content">
									<input type="text" class="text_short" name="client_tel1" id="client_tel1" value="{$clientDict.client_tel1|escape}" />&nbsp;-&nbsp;
									<input type="text" class="text_short" name="client_tel2" id="client_tel2" value="{$clientDict.client_tel2|escape}" />&nbsp;-&nbsp;
									<input type="text" class="text_short" name="client_tel3" id="client_tel3" value="{$clientDict.client_tel3|escape}" />
								</td>
							</tr>
							<tr>
								<th class="mi_tabel_title">FAX番号</th>
								<td class="mi_tabel_content">
									<input type="text" class="text_short" name="client_fax1" id="client_fax1" value="{$clientDict.client_fax1|escape}" />&nbsp;-&nbsp;
									<input type="text" class="text_short" name="client_fax2" id="client_fax2" value="{$clientDict.client_fax2|escape}" />&nbsp;-&nbsp;
									<input type="text" class="text_short" name="client_fax3" id="client_fax3" value="{$clientDict.client_fax3|escape}" />
								</td>
							</tr>
							<tr>
								<th class="mi_tabel_title">代表者名<span class="required">必須</span></th>
								<td class="mi_tabel_content">
									<input type="text" class="text_medium" name="client_staffleaderfirstname" id="client_staffleaderfirstname" value="{$clientDict.client_staffleaderfirstname|escape}" placeholder="氏" />
									<input type="text" class="text_medium" name="client_staffleaderlastname" id="client_staffleaderlastname" value="{$clientDict.client_staffleaderlastname|escape}" placeholder="名" />
								</td>
							</tr>
							<tr>
								<th class="mi_tabel_title">代表者メールアドレス<span class="required">必須</span>&nbsp;</th>
								<td class="mi_tabel_content">
									<input type="text" class="text_long" name="client_staffleaderemail" id="client_staffleaderemail" value="{$clientDict.client_staffleaderemail|escape}" />
								</td>
							</tr>
							<tr>
								<th class="mi_tabel_title">HP</th>
								<td class="mi_tabel_content"><input type="text" class="text_long" name="client_homepage" id="client_homepage" value="{$clientDict.client_homepage|escape}" />
								</td>
							</tr>
							<tr>
								<th class="mi_tabel_title">リダイレクト先</th>
								<td class="mi_tabel_content td_redirect">
									<input type="text" class="text_long" name="client_redirect_url" value="{$clientDict.client_redirect_url|escape}" />
									<span>
										※ルーム退出後、ゲストには上記URLページが表示されます。
									</span>
								</td>
							</tr>
							{if $user.staff_type=="AA"}
								<tr>
									<th class="mi_tabel_title">担当メンバーＩＤ</th>
									<td class="mi_tabel_content">
										<input type="hidden" name="aa_staff_id_list" id="aa_staff_id_list" value="{$clientDict.aa_staff_id_list}"/>
										<span id="aa_staff_name" class="select_person">{$clientDict.aa_staff_name}</span>
										<button type="button" class="mi_cancel_btn detail_open mi_btn_m">選択</button>
										<a data-target="modal-content" class="modal-open" style="display:none;"></a>
										<p class="client_staff_alert"></p>
									</td>
								</tr>
						{/if}

						{if $user.staff_type=="AA"}
						<tr>
							<th class="mi_tabel_title">利用タイプ<span class="required">必須</span></th>
							<td>
								<input type="radio" name="usage_type" value="1" {if $clientDict.usage_type == 1}checked{/if}><span>営業支援</span>
								<input type="radio" name="usage_type" value="2" {if $clientDict.usage_type == 2}checked{/if}><span>在宅構築</span>
								<input type="radio" name="usage_type" value="3" {if $clientDict.usage_type == 3}checked{/if}><span>単体利用</span>
								<input type="radio" name="usage_type" value="4" {if $clientDict.usage_type == 4}checked{/if}><span>トライアル</span>
							</td>
						</tr>
						{/if}

						<tr>
							<th class="mi_tabel_title">
								{if $user.staff_type=="AA"}
								音声文字起こし（ h / 月 ）
								{else}
								音声文字起こし（ 時分 / 月 ）
								{/if}
							</th>
							<td class="mi_tabel_content audio_text_term_area">
								{if $user.staff_type=="AA"}
								<div class="audio_text_term_area">total残り時間 { $clientDict.negotiation_audio_text_total_remain_time_hour|escape} 時間 {$clientDict.negotiation_audio_text_total_remain_time_minute|escape} 分</div>
								<div class="audio_text_term_area">基本契約時間 <input type="number" name="negotiation_audio_text_remaining_hour" id="negotiation_audio_text_remaining_hour" value="{$clientDict.negotiation_audio_text_remaining_hour|escape}" /> h (空=無制限 0=使用不可)
									<button type="button" id="audio_text_reflect_button" class="immediate_reflect_button click-fade" disabled>即時反映</button>
								</div>
								<div class="audio_text_term_area">追加時間 <input type="number" name="negotiation_audio_text_add_time" id="negotiation_audio_text_add_time" value="{$clientDict.negotiation_audio_text_add_time|escape}" /> h </div>
								<div class="audio_specification_description">
									※基本契約時間が0時間の場合のみ、即時反映が実行できます。<br>
									※基本契約時間に値を入力して登録した場合は、翌月の1日以降に反映されます。<br>
									※追加時間に入力した値は、即時反映されます。ただ、基本契約時間を消化した上で<br>
									利用可能になり、消化し切るまでは翌月に繰り越されます。
								</div>
								{else}
									{if $clientDict.negotiation_audio_text_remaining_hour == null}
										無制限
									{else}
										<div class="audio_text_term_area">total残り時間 { $clientDict.negotiation_audio_text_total_remain_time_hour|escape} 時間 {$clientDict.negotiation_audio_text_total_remain_time_minute|escape} 分</div>
										<div class="audio_text_term_area">基本契約時間  { $clientDict.negotiation_audio_text_time_limit_hour|escape} 時間 {$clientDict.negotiation_audio_text_time_limit_minute|escape} 分/{$clientDict.negotiation_audio_text_remaining_hour|escape} 時間 (月)</div>
										<div class="audio_text_term_area">追加契約時間  { $clientDict.negotiation_audio_text_add_time_limit_hour|escape} 時間 {$clientDict.negotiation_audio_text_add_time_limit_minute|escape} 分/{$clientDict.negotiation_audio_text_add_time|escape} 時間</div>
									{/if}
								{/if}
							</td>
						</tr>

						<tr>
							<th class="mi_tabel_title">
								{if $user.staff_type=="AA"}
								音声分析（ h / 月 ）
								{else}
								音声分析（ 時分 / 月 ）
								{/if}
							</th>
							<td class="mi_tabel_content audio_analysis_term_area">
								{if $user.staff_type=="AA"}
								<div class="audio_analysis_term_area"> total残り時間 { $clientDict.negotiation_audio_analysis_total_remain_time_hour|escape} 時間 {$clientDict.negotiation_audio_analysis_total_remain_time_minute|escape} 分</div>
								<div class="audio_analysis_term_area">基本契約時間 <input type="number" name="negotiation_audio_analysis_remaining_hour" id="negotiation_audio_analysis_remaining_hour" value="{$clientDict.negotiation_audio_analysis_remaining_hour|escape}" /> h (空=無制限 0=使用不可)
									<button type="button" id="audio_analysis_reflect_button" class="immediate_reflect_button click-fade" disabled>即時反映</button>
								</div>
								<div class="audio_analysis_term_area">追加時間 <input type="number" name="negotiation_audio_analysis_add_time" id="negotiation_audio_analysis_add_time" value="{$clientDict.negotiation_audio_analysis_add_time|escape}" /> h </div>
								<div class="audio_specification_description">
									※基本契約時間が0時間の場合のみ、即時反映が実行できます。<br>
									※基本契約時間に値を入力して登録した場合は、翌月の1日以降に反映されます。<br>
									※追加時間に入力した値は、即時反映されます。ただ、基本契約時間を消化した上で<br>
									利用可能になり、消化し切るまでは翌月に繰り越されます。
								</div>
								{else}
									{if $clientDict.negotiation_audio_analysis_remaining_hour == null}
										無制限
									{else}
										<div class="audio_analysis_term_area">total残り時間 { $clientDict.negotiation_audio_analysis_total_remain_time_hour|escape} 時間 {$clientDict.negotiation_audio_analysis_total_remain_time_minute|escape} 分</div>
										<div class="audio_analysis_term_area">基本契約時間  { $clientDict.negotiation_audio_analysis_time_limit_hour|escape} 時間 {$clientDict.negotiation_audio_analysis_time_limit_minute|escape} 分/{$clientDict.negotiation_audio_analysis_remaining_hour|escape} 時間 (月)</div>
										<div class="audio_analysis_term_area">追加契約時間  { $clientDict.negotiation_audio_analysis_add_time_limit_hour|escape} 時間 {$clientDict.negotiation_audio_analysis_add_time_limit_minute|escape} 分/{$clientDict.negotiation_audio_analysis_add_time|escape} 時間</div>
									{/if}
								{/if}
							</td>
						</tr>

						<tr>
							<th class="mi_tabel_title">クライアントタイプ</th>
							<td class="client_type_area">
								{if $user.staff_type=="AA"}
									{foreach from=$clientTypes item=row}
										<label><input type="radio" name="client_type" id="client_type_{$row.id}" value="{$row.id}" {if $clientDict.client_type == $row.id || $clientDict.client_type == 0 && $row.default}checked{/if}>{$row.typeName}</label>
									{/foreach}
								{else}
									{foreach from=$clientTypes item=row}
										{if $clientDict.client_type == $row.id}
											{$row.typeName}
										{/if}
									{/foreach}
								{/if}

								<div id="client_type_user" {if $clientDict.client_type == 2} style="display: none;"{/if}>
									<dt>購入経路</dt>
									<dd>
									{if $user.staff_type=="AA"}
										<input type="text" autocomplete="on" list="distributor_list" class="text_medium" name="distribution_channel_client_name" id="distribution_channel_client_name" value="{$distributor.client_name|escape}" id="distribution_channel_client_name" />
										<datalist id="distributor_list">
										{foreach from=$distributorList item=row}
											<option value="{$row.client_name}" data-hidden-value="{$row.client_id}">
										{/foreach}
								        </datalist>
								        <input type="hidden" id="distribution_channel_client_id" name="distribution_channel_client_id" value="{$clientDict.distribution_channel_client_id|escape}" />
							        {else}
										{foreach from=$distributorList item=row}
											{if $row.client_id == $clientDict.distribution_channel_client_id}
												{$row.client_name}
											{/if}
										{/foreach}
							        {/if}
							        </dd>
								</div>

								<div id="client_type_distributor" {if $clientDict.client_type != 2} style="display: none;"{/if}>
									<dl>
										<dt>購入企業アカウント数(ID数)</dt>
										<dd>
										{if $user.staff_type=="AA"}
											<input type="number" class="text_medium" name="purchasing_client_account_cnt" id="purchasing_client_account_cnt" value="{$clientDict.purchasing_client_account_cnt|escape}" />
										{else}
											{$clientDict.purchasing_client_account_cnt|escape}
										{/if}
										</dd>

										<dt>代理店営業担当者</dt>
										<dd>
										{if $user.staff_type=="AA"}
											<input type="text" class="text_long" name="distributor_salesstaff_name" id="distributor_salesstaff_name" value="{$clientDict.distributor_salesstaff_name|escape}" />
										{else}
											{$clientDict.distributor_salesstaff_name|escape}
										{/if}
										</dd>

										<dt>代理店営業担当メールアドレス</dt>
										<dd>
										{if $user.staff_type=="AA"}
											<input type="email" class="text_long" name="distributor_salesstaff_email" id="distributor_salesstaff_email" value="{$clientDict.distributor_salesstaff_email|escape}" />
										{else}
											{$clientDict.distributor_salesstaff_email|escape}
										{/if}
										</dd>

										<dt>代理店営業担当 CCメールアドレス</dt>
										<dd>
										{if $user.staff_type=="AA"}
											<input type="email" class="text_long" name="distributor_salesstaff_ccemail" id="distributor_salesstaff_ccemail" value="{$clientDict.distributor_salesstaff_ccemail|escape}" />
										{else}
											{$clientDict.distributor_salesstaff_ccemail|escape}
										{/if}
										</dd>
									</dl>
								</div>
							</td>
						</tr>
						<tr>
							<th class="mi_tabel_title">二要素認証</th>
							<td>
								<div class="switchArea">
									<input type="checkbox" name="check_auth" id="check_auth" {if $clientDict.two_factor_authenticate_flg == 1}checked{/if}>
									<label for="check_auth"><span></span></label>
									<div id="swImg"></div>
									<input type="hidden" name="two_factor_authenticate_flg" value="">
								</div>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
			<!-- テーブル end -->
			<!-- テーブル start -->
			<h3>契約情報</h3>
			<div class="mi_table_main_wrap mi_table_input_right_wrap">
				<table class="mi_table_input_right mi_table_main client_regist">
					<tbody>
						<tr>
							<th class="mi_tabel_title">
								選択中のプラン
							</th>
							<td class="mi_tabel_content">
								{foreach from=$plan item=row}
									{if $clientDict.plan_this_month == $row.id}
										{$row.planName}
									{/if}
								{/foreach}
								{if $user.staff_type=="AA"}
									<input type="hidden" name="plan_this_month" value="{$clientDict.plan_this_month}">
								{/if}
							</td>
						</tr>
						{if $user.staff_type=="AA"}
							<tr>
								<th class="mi_tabel_title">
									プランを変更する<span class="required">必須</span><br>
								</th>
								<td class="mi_tabel_content">
									{foreach from=$plan item=row}
									{if $row.id !==  99}
										<input type="radio" name="plan" id="plan_{$row.id}" value="{$row.id}" {if $clientDict.plan_this_month == $row.id}checked{/if}><label for="plan_{$row.id}">{$row.planName}</label>
										<br>
									{/if}
									{/foreach}
								</td>
							</tr>
						{/if}
						{if $user.staff_type=="AA"}
							<tr>
								<th class="mi_tabel_title">金額</th>
								<td class="mi_tabel_content">
								{if $user.staff_type=="AA"}
									<input type="number" class="text_medium" name="contract_money" id="contract_money" value="{$clientDict.contract_money|escape}" /> 円
								{else}
									{$clientDict.contract_money|escape} 円
								{/if}
								</td>
							</tr>
							<tr>
								<th class="mi_tabel_title">初回発行アカウント数</th>
								<td class="mi_tabel_content">
								{if $user.staff_type=="AA"}
									<input type="number" class="text_medium" name="first_payout_staff_cnt" id="first_payout_staff_cnt" value="{$clientDict.first_payout_staff_cnt|escape}" />
								{else}
									{$clientDict.first_payout_staff_cnt|escape}
								{/if}
								</td>
							</tr>
						<tr>
							<th class="mi_tabel_title">MAXアカウント数</th>
							<td class="mi_tabel_content">
							{if $user.staff_type=="AA"}
								<input type="number" class="text_medium" name="max_payout_staff_cnt" id="max_payout_staff_cnt" value="{$clientDict.max_payout_staff_cnt|escape}" />
							{else}
								{$clientDict.max_payout_staff_cnt|escape}
							{/if}
							</td>
						</tr>
						<tr>
							<th class="mi_tabel_title">契約書添付</th>
							<td class="mi_tabel_content">
								{if $clientDict.contract_file != ""}
								<a href="/cmn-contract/{$clientDict.contract_file|escape}" target="_blank" class="link_contract_file">契約書</a>
								{/if}
								{if $user.staff_type=="AA"}
									<input type="file" name="contract_file" id="contract_file" value="{$clientDict.contract_file|escape}" class="input_contract_file" />
								{/if}
							</td>
						</tr>
						{/if}
						<tr>
						{if $user.staff_type=="AA"}
							<th class="mi_tabel_title">請求書送付先住所</th>
							<td class="mi_tabel_content">
							{if $user.staff_type=="AA"}
								<input type="text" class="text_long" name="billing_address" id="billing_address" value="{$clientDict.billing_address|escape}" />
							{else}
								{$clientDict.billing_address|escape}
							{/if}
							</td>
						</tr>
						<tr>
							<th class="mi_tabel_title">受注日</th>
							<td class="mi_tabel_content">
							{if $user.staff_type=="AA"}
								<input type="date" class="text_medium" name="order_date" value="{$clientDict.order_date|date_format:'%Y-%m-%d'}" />
							{else}
								{if $clientDict.order_date != '0000-00-00 00:00:00'}{ $clientDict.order_date|date_format:'%Y-%m-%d'}{/if}
							{/if}
							</td>
						</tr>
						<tr>
							<th class="mi_tabel_title">契約期間</th>
							<td class="mi_tabel_content">
							{if $user.staff_type=="AA"}
								<input type="date" class="text_medium" name="contract_period_start_date" id="contract_period_start_date" value="{$clientDict.contract_period_start_date|date_format:'%Y-%m-%d'}" />
								〜
								<input type="date" class="text_medium" name="contract_period_end_date" id="contract_period_end_date" value="{$clientDict.contract_period_end_date|date_format:'%Y-%m-%d'}" />
							{else}
								{if $clientDict.contract_period_start_date != '0000-00-00 00:00:00'}{$clientDict.contract_period_start_date|date_format:'%Y-%m-%d'}〜{/if}
								{if $clientDict.contract_period_end_date != '0000-00-00 00:00:00'}{$clientDict.contract_period_end_date|date_format:'%Y-%m-%d'}{/if}
							{/if}
							</td>
						</tr>


						<tr>
							<th class="mi_tabel_title">使用開始日</th>
							<td class="mi_tabel_content">
							{if $user.staff_type=="AA"}
								<input type="date" class="text_medium" name="start_use_date" id="start_use_date" value="{$clientDict.start_use_date|date_format:'%Y-%m-%d'}" />
							{else}
								{if $clientDict.start_use_date != '0000-00-00 00:00:00'}{ $clientDict.start_use_date|date_format:'%Y-%m-%d'}{/if}
							{/if}
							</td>
						</tr>
						<tr>
							<th class="mi_tabel_title">請求先担当者名</th>
							<td class="mi_tabel_content">
							{if $user.staff_type=="AA"}
								<input type="text" class="text_long" name="billing_staff_name" id="billing_staff_name" value="{$clientDict.billing_staff_name|escape}" />
							{else}
								{$clientDict.billing_staff_name|escape}
							{/if}
							</td>
						</tr>
						<tr>
							<th class="mi_tabel_title">請求先担当者メールアドレス</th>
							<td class="mi_tabel_content">
							{if $user.staff_type=="AA"}
								<input type="email" class="text_long" name="billing_staff_email" id="billing_staff_email" value="{$clientDict.billing_staff_email|escape}" />
							{else}
								{$clientDict.billing_staff_email|escape}
							{/if}
							</td>
						</tr>
						<tr>
							<th class="mi_tabel_title">フォローコール開始希望日</th>
							<td class="mi_tabel_content">
							{if $user.staff_type=="AA"}
								<input type="date" class="text_medium" name="follow_call_date" id="follow_call_date" value="{$clientDict.follow_call_date|date_format:'%Y-%m-%d'}" />
							{else}
								{if $clientDict.follow_call_date != '0000-00-00 00:00:00'}{ $clientDict.follow_call_date|date_format:'%Y-%m-%d'}{/if}
							{/if}
							</td>
						</tr>
						{/if}
						{if $user.staff_type=="AA"}
							<tr>
								<th class="mi_tabel_title">ウェビナー基本契約時間<span class="required">必須</span></th>
								<td class="mi_tabel_content">
									<input type="text" placeholder="" class="text_medium" name="webinar_available_time" value="{$clientDict.webinar_available_time|escape}" /><span class="mgl_10">時間</span>
								</td>
							</tr>
							<tr>
								<th class="mi_tabel_title">ウェビナー追加時間</th>
								<td class="mi_tabel_content">
									<input type="text" placeholder="" class="text_medium" name="webinar_add_time" value="{0}" /><span class="mgl_10">時間</span>
								</td>
							</tr>	
							<tr>
								<th class="mi_tabel_title">SalesCrowdクライアントID</th>
								<td class="mi_tabel_content"><input type="text" placeholder="※例:CA00001ならば1を入力" class="text_long" name="salescrowd_client_id" id="salescrowd_client_id" value="{$clientDict.salescrowd_client_id|escape}" />
								</td>
							</tr>
							<tr>
								<th class="mi_tabel_title">備考</th>
								<td class="mi_tabel_content">
									<textarea class="mi_default_input" style="width: 97%;padding: 0 10px;" name="client_comment" id="client_comment" rows="4" cols="120" >{$clientDict.client_comment}</textarea>
								</td>
							</tr>
						{/if}

						</tbody>
					</table>
				</div>
				<!-- テーブル end -->
				<div class="btn_client_submit_area">
					<button type="button" name="submit_button" class="mi_default_button hvr-fade click-fade" id="submit_button">登録する</button>
				</div>
				<input type="hidden" name="client_id" value="{$clientDict.client_id|escape}" />
				<input type="hidden" name="ret" value="{$pram.ret}" />
			</form>
			<!-- コンテンツエリア end -->

			<!-- コンテンツエリア start -->
			<div id="mi_content_area">

				<!-- コンテンツタイトル start -->
				<div class="mi_content_title">
					<span class="icon-parsonal mi_content_title_icon"></span>
					<h1>{if $staffDict.staff_type == "AA"}
							{$staffDict.staff_type}／
						{/if}
						ユーザーアカウント一覧</h1>
					<div class="mi_flt-r">
						<form id="search_form" action="/admin/client-edit?staff_type={$staffDict.staff_type}{if $staffDict.client_id!=''}&client_id={$staffDict.client_id}{/if}" method="get">
							<div class="search_box">
								<input type="text" name="free_word" value="{$freeWord}" placeholder="検索内容を入力してください...">

								<button class="mi_default_button hvr-fade click-fade">
									<span class="icon-search"></span>
								</button>
								<span class="icon-close search_close_button"></span>
							</div>
							<input type="hidden" name="staff_type" value="{$staffDict.staff_type|escape}" />
							<input type="hidden" name="client_id" value="{$staffDict.client_id|escape}" />
						</form>
					</div>
					{if $user.staff_type=="AA" || $user.staff_role == "CE_1"}
						<div class="mi_flt-r">
							<div class="mi_content_title_option">
	                                                        <a href="/admin/download-csv" name="csv_chk" class="csv_chk mi_title_action_btn click-fade" id="csv_chk">
									<span class="icon-download"></span>
									<span>CSV</span>
								</a>
								{if $addStaffFlg}
							
									<a href="/admin/staff-regist?{$staffDict.addURL}" class="mi_title_action_btn click-fade">
										<span class="icon-parsonal-puls"></span>
										<span>追加</span>
									</a>
								{/if}
								<a href="javascript:void(0);" name="del_chk" class="del_chk mi_title_action_btn click-fade" id="del_chk">
									<span class="icon-delete"></span>
									<span>削除</span>
								</a>
							</div>
						</div>
					{/if}
				</div>
				<!-- コンテンツタイトル end -->

				<!-- エラーメッセージ表示エリア begin -->
				{if $err == 1}
					不正なIDです。
				{/if}
				<!-- エラーメッセージ表示エリア end -->

				<!-- ページネーション start -->
				<div class="mi_pagenation">
					<div class="mi_pagenation_result">該当件数 <span>{$list->getCount()}</span>件</div>
					{$list->getLinkParam($pram)}
					{$list->getPerPagePram($pram)}
				</div>
				<!-- ページネーション end -->

				<!-- テーブル start -->
				<div class="mi_table_main_wrap">
					<table class="mi_table_main">
						<thead>
							<tr>
								{if $user.staff_type=="AA" || $user.staff_role == "CE_1"}
									<th class="mi_table_item_1">選択</th>
									<th class="mi_table_item_1">編集</th>
								{/if}
								<th>{$list->getOrderArrow('アカウントID', 'staff_id')}</th>
								<th>{$list->getOrderArrow('名前', 'staff_name')}</th>
								<th>{$list->getOrderArrow('最終ログイン日時', 'enter_login_date')}</th>
								<th>{$list->getOrderArrow('メールアドレス', 'staff_email')}</th>
								<th>{$list->getOrderArrow('権限', 'staff_role')}</th>
							</tr>
						</thead>
						<tbody>
							{assign var=i value="0" scope="global"}
							{foreach from=$list->getList() item=row}
								<tr>
									{if $user.staff_type=="AA" || $user.staff_role == "CE_1"}
										<td class="mi_table_item_1"><input type="checkbox" id="del_{$i++}" value="{$row.staff_type}_{$row.staff_id}"></td>
										<td class="mi_edit_icon"><a href="javascript:void(0)" name="edit_{$row.staff_type}_{$row.staff_id}_{$row.client_id}"><span class="icon-edit"></span></a></td>
									{/if}
									<td>{$row.staff_type|escape}{$row.staff_id|string_format:"%05d"}</td>
									<td>{$row.staff_name}</td>
									<td>{$row.enter_login_date|escape}</td>
									<td>{$row.staff_email|escape}</td>
									<td>
										{if $row.staff_role == $smarty.const.ROLE_ADM}
											管理者
										{elseif $row.staff_role == $smarty.const.ROLE_EMP}
											一般社員
										{elseif $row.staff_role == $smarty.const.ROLE_PRT}
											アルバイト
										{/if}
									</td>
								</tr>
							{/foreach}
						</tbody>
					</table>
				</div>
				<!-- テーブル end -->
			</div>
			<!-- コンテンツエリア end -->
		</div>
		<!-- 概要タブ end -->


		<!-- メール設定タブ start -->
		<div id="tab-mail-config" style="display: none;">
			<!-- コンテンツエリア start -->
			<div id="mi_content_area">

				<!-- コンテンツタイトル start -->
				<div class="mi_content_title">
					<h1>
						MTA設定
					</h1>
				</div>
				<!-- コンテンツタイトル end -->

				<!-- エラーメッセージ表示エリア begin -->
				{if $errorList|@count gt 0}
				<p class="errmsg mb10">
					下記にエラーがあります。<br />
					<strong>
						{foreach from=$errorList item=err}
							{foreach from=$err item=e}
								{$e}<br>
							{/foreach}
						{/foreach}
					</strong>
				</p>
				{/if}
				<!-- エラーメッセージ表示エリア end -->

				<form id="mta-settings" autocomplete="off">

					<!-- 設定(繰り返し) start -->
					<div id="mta-setting">
						{foreach from=$accountMtas item=mta}
							<div name="mta-setting-template">
								<div style="display: flex; justify-content: space-between; align-items: center; margin: 1em auto;">
									<b style="font-size: 1.2em;"></b>
									<button class="delete-new-mta-setting mi_cancel_btn mi_btn_s" style="width:60px;"><span class="icon-close"></span></button>
								</div>

								<div class="mi_table_main_wrap mi_table_input_right_wrap">
									<table class="mi_table_input_right mi_table_main">
										<tbody>
											<tr>
												<th class="mi_tabel_title">送信者メールアドレス<span class="required">必須</span></th>
												<td class="mi_tabel_content">
													<input type="text" class="text_long" name="sender_address" value={$mta.sender_address} />
												</td>
											</tr>
											<tr>
												<th class="mi_tabel_title">SMTPサーバー</th>
												<td class="mi_tabel_content">
													<input type="text" class="text_long" name="sender_smtp_server" value="{$mta.sender_smtp_server}" />
												</td>
											</tr>
											<tr>
												<th class="mi_tabel_title">SMTPポート</th>
												<td class="mi_tabel_content">
													<input type="text" class="text_long" name="sender_smtp_port" value="{$mta.sender_smtp_port}" />
												</td>
											</tr>
											<tr>
												<th class="mi_tabel_title">SMTPユーザ名</th>
												<td class="mi_tabel_content">
													<input type="text" class="text_long" name="ehlo_user" value="{$mta.ehlo_user}" />
												</td>
											</tr>
											<tr>
												<th class="mi_tabel_title">SMTPパスワード</th>
												<td class="mi_tabel_content">
													<input type="password" class="text_long" name="ehlo_password" value="{$mta.ehlo_password}" />
												</td>
											</tr>
											<tr>
												<th class="mi_tabel_title">POPサーバー</th>
												<td class="mi_tabel_content">
													<input type="text" class="text_long" name="dsn_server" value="{$mta.dsn_server}" />
												</td>
											</tr>
											<tr>
												<th class="mi_tabel_title">POPポート</th>
												<td class="mi_tabel_content">
													<input type="text" class="text_long" name="dsn_port" id="" value="{$mta.dsn_port}" />
												</td>
											</tr>
											<tr>
												<th class="mi_tabel_title">POPユーザ名</th>
												<td class="mi_tabel_content">
													<input type="text" class="text_long" name="dsn_user" value="{$mta.dsn_user}" />
												</td>
											</tr>
											<tr>
												<th class="mi_tabel_title">POPパスワード</th>
												<td class="mi_tabel_content">
													<input type="password" class="text_long" name="dsn_password" value="{$mta.dsn_password}" />
												</td>
											</tr>
											<tr>
												<th class="mi_tabel_title">備考</th>
												<td class="mi_tabel_content">
													<textarea class="mi_default_input" name="note" style="width: 97%;padding: 0 10px;" >{$mta.note}</textarea>
												</td>
											</tr>
										</tbody>
									</table>
								</div>
							</div>
						{/foreach}
					</div>
					<!-- 設定(繰り返し) end -->
					<div style="margin: 1em auto;">
						<button type="button" class="mi_default_button mi_btn_s hvr-fade click-fade" id="add-new-mta-setting">追加</button>
					</div>
					<button type="button" name="mta_submit_button" class="mi_default_button hvr-fade click-fade" id="mta_submit_button">登録する</button>
				</form>
			</div>
			<!-- コンテンツエリア end -->

			<!-- コンテンツエリア start -->
			<div id="mi_content_area" style="width: 1000px">

				<!-- コンテンツタイトル start -->
				<div class="mi_content_title">
					<h1>
						ドメイン設定
					</h1>
				</div>
				<!-- コンテンツタイトル end -->
				<div style="margin: 1em auto;">
					<button type="button" class="mi_default_button mi_btn_s hvr-fade click-fade" id="add-domain-button" style="width: auto;"><span class="icon-puls" style="margin-right: .5em;"></span>新規ドメインを追加</button>
				</div>
				<div>
					<table id="send-email-table" class="mi_table_main domain_config_table">
						<thead>
							<tr>
								<th class="delete_column">削除</th>
								<th>ドメイン</th>
								<th>SPF</th>
								<th>Domain KEY</th>
								<th>DNSエントリの確認</th>
								<th>想定されるDNSエントリ</th>
							</tr>
						</thead>
						<tbody>
						{if $accountDomains|@count > 0}
							{foreach from=$accountDomains key=index item=domain}
							<tr data-domain="{$domain.domain}">
								<td data-action="delete" data-id="{$domain.id}" class="delete_column">
									<button class="delete-domain outline-dark-btn mi_btn_s" data-domain="{$domain.domain}" data-id="{$domain.id}" style="width: 60px;"><span class="icon-close" style="vertical-align: super"></span></button>
								</td>
								<td class="clickable">
									<span class="domain_status_wrap"><span class="text-truncate">{$domain.domain}</span></span>
								</td>
								<td data-type="spf" data-id="{$domain.id}" class="clickable">
									<span class="domain_status_wrap"><img src="/img/check-circle.svg" class="ml-auto">検証済み<img src="/img/arrow-down.svg" class="ml-auto"></span>
								</td>
								<td data-type="domainkey" data-id="{$domain.id}" class="clickable">
									<span class="domain_status_wrap"><img src="/img/warning.svg" class="ml-auto">エラー<img src="/img/arrow-down.svg" class="ml-auto"></span>
								</td>
								<td data-type="dns-entry-check">
									<span class="domain_status_wrap"><img src="/img/reload.svg" class="mx-auto"></span>
								</td>
								<td data-type="dns-entry" class="clickable">
									<span class="domain_status_wrap"><img src="/img/search.svg" class="ml-auto"><img src="/img/arrow-down.svg" class="ml-auto"></span>
								</td>
							</tr>
							{/foreach}
						{else}
							<tr>
								<td colspan="6">ドメインが登録されていません</td>
							</tr>
						{/if}
						</tbody>
					</table>
				</div>
			</div>
			<!-- コンテンツエリア end -->
		</div>
		<!-- メール設定タブ end -->

</div>
<!-- メインコンテンツ end -->

{literal}

<!-- アイドマ担当者モーダルテンプレート -->
<script id="aa-staff-modal-template" type="text/x-handlebars-template">
<!-- モーダルタイトル start -->
<div class="mi_content_title">
	<h2>アイドマ担当者選択</h2>
	<div class="search_box modal_search">
		<input type="text" id="free_word" class="keyword-s" name="free_word" placeholder="検索内容を入力してください...">
		<button class="mi_default_button hvr-fade click-fade" id="on_free_word">
			<span class="icon-search"></span>
		</button>
		<span class="icon-close search_close_button"></span>
	</div>
</div>
<!-- モーダルタイトル end -->

<div class="mi_table_main_wrap">
	<table class="mi_table_main idsselect_table">
		<thead>
			<tr>
				<th>選択</th>
				<th>担当者</th>
			</tr>
		</thead>
		<tbody>
			{{#each aaStaffList}}
				<tr class="idsselect">
					<td class="inp mi_table_item_1" style="height: auto;">
						<input type="checkbox" id="aa_staff_id_{{staff_id}}" name="aa_staff_id[]" value="{{staff_id}}"  />
						<input type="hidden" id="aa_staff_name_{{staff_id}}" name="user_name" value="{{staff_name}}" />
					</td>
					<td id="name">{{staff_name}}</td>
				</tr>
			{{/each}}
		</tbody>
	</table>
</div>
<div class="mi_tabel_btn_area">
	<button type="button" name="submit_button" id="decision" class="mi_default_button mi_btn_m mi_btn_m hvr-fade click-fade">選択する</button>
</div>
<div class="mi_close_icon modal-close">
	<span class="icon-close"></span>
</div>

</script>

<!-- 新規ドメイン追加モーダルテンプレート -->
<script id="add-domain-modal-template" type="text/x-handlebars-template">
	<!-- モーダルタイトル start -->
	<div class="mi_content_title">
		<h2>新規ドメインを追加する</h2>
	</div>
	<!-- モーダルタイトル end -->
	<div class="add-domain-form">
		<span>メールアドレスの ＠ の後ろにあるドメイン名を入力してください</span>
		<div style="height: 40px; margin: 3em auto;">
			<input type="text" name="domain" id="domain-input" class="text_medium" />
		</div>
	</div>
	<div class="mi_tabel_btn_area">
		<button type="button" id="add-domain-decision" class="mi_default_button mi_btn_m mi_btn_m hvr-fade click-fade">登録</button>
	</div>
	<div class="mi_close_icon modal-close">
		<span class="icon-close"></span>
	</div>
</script>
<!-- 新規ドメイン追加モーダルテンプレート -->

<!-- 送信者メール情報テンプレート -->
<script id="sender-mail-info-template" type="text/x-handlebars-template">
	<div name="mta-setting-template">
		<div style="display: flex; justify-content: space-between; align-items: center; margin: 1em auto;">
			<b style="font-size: 1.2em;"></b>
			<button class="delete-new-mta-setting mi_cancel_btn mi_btn_s" style="width:60px;"><span class="icon-close"></span></button>
		</div>

		<div class="mi_table_main_wrap mi_table_input_right_wrap">
			<table class="mi_table_input_right mi_table_main">
				<tbody>
					<tr>
						<th class="mi_tabel_title">送信者メールアドレス<span class="required">必須</span></th>
						<td class="mi_tabel_content">
							<input type="text" class="text_long" name="sender_address"/>
						</td>
					</tr>
					<tr>
						<th class="mi_tabel_title">SMTPサーバー</th>
						<td class="mi_tabel_content">
							<input type="text" class="text_long" name="sender_smtp_server"/>
						</td>
					</tr>
					<tr>
						<th class="mi_tabel_title">SMTPポート</th>
						<td class="mi_tabel_content">
							<input type="text" class="text_long" name="sender_smtp_port"/>
						</td>
					</tr>
					<tr>
						<th class="mi_tabel_title">SMTPユーザ名</th>
						<td class="mi_tabel_content">
							<input type="text" class="text_long" name="ehlo_user"/>
						</td>
					</tr>
					<tr>
						<th class="mi_tabel_title">SMTPパスワード</th>
						<td class="mi_tabel_content">
							<input type="password" class="text_long" name="ehlo_password"/>
						</td>
					</tr>
					<tr>
						<th class="mi_tabel_title">POPサーバー</th>
						<td class="mi_tabel_content">
							<input type="text" class="text_long" name="dsn_server"/>
						</td>
					</tr>
					<tr>
						<th class="mi_tabel_title">POPポート</th>
						<td class="mi_tabel_content">
							<input type="text" class="text_long" name="dsn_port"/>
						</td>
					</tr>
					<tr>
						<th class="mi_tabel_title">POPユーザ名</th>
						<td class="mi_tabel_content">
							<input type="text" class="text_long" name="dsn_user"/>
						</td>
					</tr>
					<tr>
						<th class="mi_tabel_title">POPパスワード</th>
						<td class="mi_tabel_content">
							<input type="password" class="text_long" name="dsn_password"/>
						</td>
					</tr>
					<tr>
						<th class="mi_tabel_title">備考</th>
						<td class="mi_tabel_content">
							<textarea class="mi_default_input" name="note"style="width: 97%;padding: 0 10px;" ></textarea>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</script>
<!-- 送信者メール情報テンプレート -->

<!-- ドメイン設定table内tableテンプレート start -->
<script id="send-email-domain-spf-template" type="text/x-handlebars-template">
<tr class="appended">
	<td class="appended__table" colspan="6">
		<table class="domain_inner_table">
			<tr>
				<th class="domain_inner_table_th_title">ドメイン</th>
				<td class="domain_inner_table_td_entry"><p class="domain_inner_table_td_entry_inner">{{dns.host}}</p></td>
			</tr>
			<tr>
				<th class="domain_inner_table_th_title">想定エントリ</th>
				<td class="domain_inner_table_td_entry"><p class="domain_inner_table_td_entry_inner">{{dns.txt}}</p></td>
			</tr>
			<tr>
				<th class="domain_inner_table_th_title">実際のエントリ</th>
				<td class="domain_inner_table_td_entry"><p class="domain_inner_table_td_entry_inner">{{dns.entries}}</p></td>
			</tr>
		</table>
	</td>
</tr>
</script>

<script id="send-email-domain-domainkey-template" type="text/x-handlebars-template">
<tr class="appended">
	<td class="appended__table" colspan="6">
		<table class="domain_inner_table">
			<tr>
				<th class="domain_inner_table_th_title">ドメイン</th>
				<td class="domain_inner_table_td_entry"><p class="domain_inner_table_td_entry_inner">200608._domainkey.{{domain}}</p></td>
			</tr>
			<tr>
				<th class="domain_inner_table_th_title">想定エントリ</th>
				<td class="domain_inner_table_td_entry"><p class="domain_inner_table_td_entry_inner">k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDGoQCNwAQdJBy23MrShs1EuHqK/dtDC33QrTqgWd9CJmtM3CK2ZiTYugkhcxnkEtGbzg+IJqcDRNkZHyoRezTf6QbinBB2dbyANEuwKI5DVRBFowQOj9zvM3IvxAEboMlb0szUjAoML94HOkKuGuCkdZ1gbVEi3GcVwrIQphal1QIDAQAB;</p></td>
			</tr>
			<tr>
				<th class="domain_inner_table_th_title">実際のエントリ</th>
				<td class="domain_inner_table_td_entry"><p class="domain_inner_table_td_entry_inner"></p></td>
			</tr>
		</table>
	</td>
</tr>
</script>

<script id="send-email-domain-domainkeypory-template" type="text/x-handlebars-template">
<tr class="appended">
	<td class="appended__table" colspan="6">
			<table class="domain_inner_table">
			<tr>
				<th class="domain_inner_table_th_title">ドメイン</th>
				<td class="domain_inner_table_td_entry"><p class="domain_inner_table_td_entry_inner">_domainkey.{{domain}}</p></td>
			</tr>
			<tr>
				<th class="domain_inner_table_th_title">想定エントリ</th>
				<td class="domain_inner_table_td_entry"><p class="domain_inner_table_td_entry_inner">t=y; o=~;</p></td>
			</tr>
			<tr>
				<th class="domain_inner_table_th_title">実際のエントリ</th>
				<td class="domain_inner_table_td_entry"><p class="domain_inner_table_td_entry_inner"></p></td>
			</tr>
		</table>
	</td>
</tr>
</script>

<script id="send-email-domain-dns-entry-template" type="text/x-handlebars-template">
	<tr class="appended">
		<td class="appended__table" colspan="6">
			<table class="domain_inner_table">
				<tr>
					<th class="domain_inner_table_th_for">For</th>
					<th class="domain_inner_table_th_domain">ドメイン</th>
					<th class="domain_inner_table_th_txt">種別</th>
					<th class="domain_inner_table_th_entry">エントリ</th>
				</tr>
				<tr>
					<td>SPF</td>
					<td>{{domain}}</td>
					<td>TXT</td>
					<td class="domain_inner_table_td_entry"><p class="domain_inner_table_td_entry_inner">v=spf1 include:aspmx.pardot.com ~all</p></td>
				</tr>
				<tr>
					<td>DomainKey_Policy</td>
					<td>_domainkey.{{domain}}</td>
					<td>TXT</td>
					<td class="domain_inner_table_td_entry"><p class="domain_inner_table_td_entry_inner">t=y; o=~;</p></td>
				</tr>
				<tr>
					<td>DomainKey</td>
					<td>200608._domainkey.{{domain}}</td>
					<td>TXT</td>
					<td class="domain_inner_table_td_entry"><p class="domain_inner_table_td_entry_inner">k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDGoQCNwAQdJBy23MrShs1EuHqK/dtDC33QrTqgWd9CJmtM3CK2ZiTYugkhcxnkEtGbzg+IJqcDRNkZHyoRezTf6QbinBB2dbyANEuwKI5DVRBFowQOj9zvM3IvxAEboMlb0szUjAoML94HOkKuGuCkdZ1gbVEi3GcVwrIQphal1QIDAQAB;</p></td>
				</tr>
			</table>
		</td>
	</tr>
</script>
<!-- ドメイン設定table内tableテンプレート start -->
{/literal}

{include file="./common/footer.tpl"}
