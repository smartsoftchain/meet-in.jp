<!-- 名刺表示 start -->
{literal}

<script>
$(function (){
	// 名刺PDFクリック
	$("[id=namecard_download]").click(function() {
//		// 別タブで表示
//		window.open($(this).data('namecard-url'), '_blank');
		// バイナリの送受信のためajaxではなくXMLHttpResquest
		var mime_types = {
			jpg:  'image/jpeg',
			jpeg: 'image/jpeg',
			pdf:  'application/pdf',
		};
		var namecard_url  = $(this).data('namecardUrl');
		var namecard_file = $(this).data('namecardName');
		if (namecard_url != '' && namecard_file != '' ) {
			var namecard_ext  = namecard_url.match(/(.*)(?:\.([^.]+$))/)[2];
			var xhr = new XMLHttpRequest();
			xhr.open('GET', namecard_url, true);
			xhr.responseType = 'arraybuffer';
			xhr.onload = function(e) {
				var blob = new Blob([xhr.response], {"type": mime_types[namecard_ext]});
				var fileName = namecard_file + '.' + namecard_ext;
				// IEの場合は、バイナリのダウンロード方法が変わるため、分岐
				if(getBrowserType() != "IE"){
					$("a[name=download_namcard_link]").attr("href", URL.createObjectURL(blob));
					$("a[name=download_namcard_link]").attr("download", fileName);
					$("a[name=download_namcard_link]")[0].click();
				}else{
					// IEでのダウンロード処理
					window.navigator.msSaveBlob(blob, fileName);
				}
			};
			xhr.send();
		}
		return false;
	});
});

// mailtoにてページリロードを行わせない
function namecard_mailto(){
	var namecard_mailaddress = $("#namecard_mailto").attr("value");

	if(getBrowserType() == "IE" || getBrowserType() == "Edge"){
		// IE,Edgeでのダウンロード処理
		location.href('mailto:' + namecard_mailaddress);
	}else if(getBrowserType() == "Chrome"){
		// Macかどうか判定
		var pf = navigator.platform.toLowerCase();
		var isMac = (pf.indexOf('mac') > -1);
		if(isMac){
			// 別タブをしっかり開いてからでないとメーラが起動しない(Mac-Chrome)
			var winObj = window.open('mailto:' + namecard_mailaddress);
			var winClose = function(){
				winObj.open('','_self').close();
			}
			setTimeout(winClose, 10);
		}else{
			window.open('mailto:' + namecard_mailaddress, '_blank').close();
		}
	}else{
		window.open('mailto:' + namecard_mailaddress , '_blank').close();
	}
}

</script>

<style type="text/css">
<!--
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
  padding: 2px;
  height: 40px;
  color: #fff;
  background-color: #0f507a;
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

.mi_content_title input[type=checkbox],
.mi_table_main2 input[type=checkbox] {
	width: 18px;
	height: 18px;
	margin: 1px;
	padding: 1px;
	vertical-align: middle;
	/*
	-moz-transform-origin: left center;
	-moz-transform: scale( 1.5 , 1.5 );
	-webkit-transform-origin: left center;
	-webkit-transform: scale( 1.5 , 1.5 );
	*/
	-moz-transform: scale( 1.8 , 1.8 );
}

button.mi_default_button2 {
  width: 180px;
  height: 40px;
  background-color: #0f507a;
  color: #fff;
  border: none;
  outline: none;
  font-size: 16px;
}

.mi_preview_button {
	width: 220px;
	float: right;
}

.mi_check_th {
	background-color: #0f507a;
	width: 50px;
	min-width: 50px;
	border-bottom: 1px solid #e8e8e8;
}

.mi_title_th {
	width: 240px;
	border-bottom: 1px solid #e8e8e8;
}

.mi_subtitle_th {
	text-align: left;
	background-color: #0f507a;
	border-bottom: 1px solid #e8e8e8;
}

.mi_content_textarea {
	color: #6e6e6e;
	width: 340px;
	height: 150px;
	padding: 10px 10px 0px 10px;
	border: 1px solid #e8e8e8;
}

.listtable {
	min-width: 100%;	/* ■ */
	background: #fff;
	padding: 10px;
}

.modal-content-preview {
	display: none;
	position: fixed;
	height: 100%;
	width: 100%;
	top: 0%;
	left: 0%;
	z-index: 100000001;
}
.mi_namecard_modal_shadow{
    opacity: 0.1;
}

.modal-content-preview .inner-wrap {
	position: absolute;
	z-index: 503;
	height: 92%;
	width: 80%;
	max-height: 600px;
	max-width: 1100px;
	background: #f5f5f5;
}


.modal-content .list-area.hgt3,
.modal-content .edit-area.hgt3 {
	/*margin-top: 2px;*/
}

.modal-content .list-area .listtable th {
	padding: 6px 10px 3px 10px;
	font-size: 1em;
	line-height: 1.2;
	text-align: left;
}

.modal-content .list-area .listtable td {
	padding: 11px 10px 8px 10px;
	font-size: 0.9em;
	line-height: 1.2;
}


/*-------------------------------------
	（モーダル）基本型
--------------------------------------*/
.mi_close_icon {
	width: 29px !important;
	height: 27.2px !important;
	padding: 0;
	background: #d8d8d8;
}
.mi_modal_default .mi_close_icon span{
	color: #000000;
}
#namecard_close:hover{
/*    background-color: #ffaa00*/
    background-color: #0f507a
}
/*--------
  名刺部分
----------*/
@media (max-width: 1090px){
	/*.modal-content-preview .inner-wrap{*/
		/*width: auto !important;*/
	/*}*/
	.namecard-photo-text{
		width: auto;
	}
}
@media (max-width: 960px){
	.modal-content-preview .inner-wrap{
		width: 1092px !important;
		max-width: 40em !important;
        height: 92% !important;
	}
}
@media (max-height: 580px){
    .modal-content-preview .inner-wrap{
        height: 92% !important;
    }
    .mi_namecard_contents{
        height: 100%;
    }
}
.mi_namecard_title{
	/*padding-bottom:2px;*/
	padding: 0.7em 1.4em !important;
}
.mi_namecard_detail_header{
	/*padding: 0.2em 1em !important;*/
	padding: 0.6em 1em !important;
}
#feature-item-1,#feature-item-2, #feature-item-3, #feature-item-4{
    flex: 0 0 95%;
    max-width: none;
}
#mi_namecard_detail{
    overflow: auto;
    overflow-x: hidden;
    height: 90%;
}
.namecard_contents_none{
    color:red;
    margin: 10px 14px;
}
.namecard_url_href{
	color: #0e4fca;
	text-decoration: underline;
}
#namecard_close_icon{
	padding: 0;
}

-->
</style>
{/literal}

<!-- ====================================== モーダルコンテンツ[start] ====================================== -->
<div class="modal-content-preview" id="modal-content-preview-namecard">
	<div class="mi_namecard_modal_shadow"></div>
    <div class="inner-wrap mi_modal_default" id="namecard-area">
	</div>
</div>
<!-- ====================================== モーダルコンテンツ[end] ======================================== -->

{literal}
<script id="namecard-modal-template" type="text/x-handlebars-template">


{{#if wide_flg}}
<div class="mi_namecard_contents">
	<div class="mi_namecard_title">プロフィール</div>
	<div class="mi_namecard_detail" id="mi_namecard_detail">
		<div class="feature-list">
			<div class="feature-item">
				<div class="mi_namecard_detail_header">{{namecard_cate1_title}}</div>
				<div class="mi_namecard_detail_content" id="namecard_staff_info">
					<div class="left">
						<div class="namecard_user_icon" style="background: url('{{namecard_picture_img}}') center center no-repeat; background-size: contain;"></div>
						{{#if namecard_img}}
						<button type="button" name="button" class="mi_pdf_dl_button" id="namecard_download" data-namecard-name="{{namecard_name}}" data-namecard-url="{{namecard_img}}"><span class="namecard_download_title">名刺ダウンロード</span></button>
						{{/if}}
						{{#if namecard_img_none}}
						<div id="namecard_none">&nbsp;</div>
						{{/if}}
						<a href="" download="" name="download_namcard_link"></a>
						<div class="sns-icon">
							{{#if fb_url}}
							<a href="{{fb_url}}" class="mi_facebook" target="_blank"><img src="/img/facebook_bl.png" class="mi_facebook_icon"></a>
							{{/if}}
							{{#if sns_url}}
							<a href="{{sns_url}}" class="mi_facebook" target="_blank"><img src="/img/sns.png" class="mi_facebook_icon"></a>
							{{/if}}
						</div>
					</div>
					<div class="contents">
						<div class="contents_client_name"><p>{{client_name}}</p></div>
						<div>{{department}}</div>
						<div class="contents_staff_executive">{{executive}}</div>
						<div class="contents_staff_name"><p>{{staff_firstname}} {{staff_lastname}}</p></div>
						<div class="contents_staff_nameph">{{staff_firstnamepy}} {{staff_lastnamepy}}</div>
						<div class="contents_small">
							{{#if client_postcode1}}
							<div>〒&nbsp;{{client_postcode1}}-{{client_postcode2}}&nbsp;{{address}}
							</div>
							{{/if}}
							{{#if namecard_email}}
							<span class="namecard-icon icon-mail"></span>&nbsp;Mail：
							<a href="" id="namecard_mailto" class="namecard_url_href" onclick="namecard_mailto(); return false;" value="{{namecard_email}}">{{namecard_email}}</a>
							{{/if}}
							{{#if namecard_url}}
							<div>
								<span class="namecard-icon icon-connect"></span>&nbsp;URL：
								<a href="{{namecard_url}}" class="namecard_url_href" target="_blank">{{namecard_url}}</a>
							</div>
							{{/if}}
							{{#if tel}}
							<div>
								<span class="namecard-icon icon-call"></span>&nbsp;電話番号：{{tel}}
							</div>
							{{/if}}
							{{#if cell}}
							<div>
								<span class="namecard-icon icon-call"></span>&nbsp;携帯番号：{{cell}}
							</div>
							{{/if}}
							{{#if fax}}
							<div>
								<span class="namecard-icon icon-report"></span>&nbsp;FAX：{{fax}}
							</div>
							{{/if}}
						</div>
					</div>
				</div>
			</div>
			<div class="feature-item">
				<div class="mi_namecard_detail_header">{{namecard_cate2_title}}</div>
				<div class="mi_namecard_detail_content" id="namecard_table">
					<table class="namecard-table">
						<tbody>
							<tr class="namecard-table-tr">
								<th class="namecard-table-th"><p>{{namecard_free1_name}}</p></th>
								<td>&nbsp;{{namecard_free1_val}}</td>
							</tr>
							<tr class="namecard-table-tr">
								<th class="namecard-table-th"><p>{{namecard_free2_name}}</p></th>
								<td>&nbsp;{{namecard_free2_val}}</td>
							</tr>
							<tr class="namecard-table-tr">
								<th class="namecard-table-th"><p>{{namecard_free3_name}}</p></th>
								<td>&nbsp;{{namecard_free3_val}}</td>
							</tr>
							<tr class="namecard-table-tr">
								<th class="namecard-table-th"><p>{{namecard_free4_name}}</p></th>
								<td>&nbsp;{{namecard_free4_val}}</td>
							</tr>
							<tr class="namecard-table-tr">
								<th class="namecard-table-th"><p>{{namecard_free5_name}}</p></th>
								<td>&nbsp;{{namecard_free5_val}}</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
			<div class="feature-item">
				<div class="mi_namecard_detail_header">{{namecard_cate3_title}}</div>
				<div class="mi_namecard_detail_content">
					<div class="center">
                        <span class="namecard-photo-contain-preview" style="background-image: url('{{namecard_photo1_url}}');"></span>
						<div class="namecard-photo-text">{{namecard_photo1_desc}}</div>
					</div>
					<div class="center_br"></div>
					<div class="center">
                        <span class="namecard-photo-contain-preview" style="background-image: url('{{namecard_photo2_url}}');"></span>
						<div class="namecard-photo-text">{{namecard_photo2_desc}}</div>
					</div>
				</div>
			</div>
			<div class="feature-item">
				<div class="mi_namecard_detail_header">{{namecard_cate4_title}}</div>
				<div class="mi_namecard_detail_content">
					<div>{{namecard_introduction}}</div>
				</div>
			</div>
	</div>
		<div class="mi_close_icon modal-close" id="namecard_close_icon">
			<span class="icon-close" id="namecard_close"></span>
		</div>
</div>
{{/if}}



{{#if narrow_flg}}
    <div class="mi_namecard_contents">
        <div class="mi_namecard_title">プロフィール</div>
        <div class="mi_namecard_detail" id="mi_namecard_detail">
            <div class="feature-list">
                {{#if namecard_cate1_public_flg}}
                <div class="feature-item"  id="feature-item-1">
                    <div class="mi_namecard_detail_header">{{namecard_cate1_title}}</div>
                    <div class="mi_namecard_detail_content" id="namecard_staff_info">
                        <div class="left">
                            <div class="namecard_user_icon" style="background: url('{{namecard_picture_img}}') center center no-repeat; background-size: contain;"></div>
                            {{#if namecard_img}}
                            <button type="button" name="button" class="mi_pdf_dl_button" id="namecard_download" data-namecard-name="{{namecard_name}}" data-namecard-url="{{namecard_img}}"><span class="namecard_download_title">名刺ダウンロード</span></button>
                            {{/if}}
                            {{#if namecard_img_none}}
                            <div id="namecard_none">&nbsp;</div>
                            {{/if}}
                            <a href="" download="" name="download_namcard_link"></a>
                            <div class="sns-icon">
                                {{#if fb_url}}
                                <a href="{{fb_url}}" class="mi_facebook" target="_blank"><img src="/img/facebook_bl.png" class="mi_facebook_icon"></a>
                                {{/if}}
                                {{#if sns_url}}
                                <a href="{{sns_url}}" class="mi_facebook" target="_blank"><img src="/img/sns.png" class="mi_facebook_icon"></a>
                                {{/if}}
                            </div>
                        </div>
                        <div class="contents">
                            <div class="contents_client_name"><p>{{client_name}}</p></div>
                            <div>{{department}}</div>
                            <div class="contents_staff_executive">{{executive}}</div>
                            <div class="contents_staff_name"><p>{{staff_firstname}} {{staff_lastname}}</p></div>
                            <div class="contents_staff_nameph">{{staff_firstnamepy}} {{staff_lastnamepy}}</div>
                            <div class="contents_small">
								{{#if client_postcode1}}
								<div>〒&nbsp;{{client_postcode1}}-{{client_postcode2}}&nbsp;{{address}}
								</div>
								{{/if}}
								{{#if namecard_email}}
								<span class="namecard-icon icon-mail"></span>&nbsp;Mail：
								<a href="" id="namecard_mailto" class="namecard_url_href" onclick="namecard_mailto(); return false;" value="{{namecard_email}}">{{namecard_email}}</a>
								{{/if}}
								{{#if namecard_url}}
								<div>
									<span class="namecard-icon icon-connect"></span>&nbsp;URL：
									<a href="{{namecard_url}}" target="_blank" class="namecard_url_href">{{namecard_url}}</a>
								</div>
								{{/if}}
								{{#if tel}}
								<div>
									<span class="namecard-icon icon-call"></span>&nbsp;電話番号：{{tel}}
								</div>
								{{/if}}
								{{#if cell}}
								<div>
									<span class="namecard-icon icon-call"></span>&nbsp;携帯番号：{{cell}}
								</div>
								{{/if}}
								{{#if meetin_number}}
								<div>
									<span class="namecard-icon icon-meet-in"></span>&nbsp;meet in番号：{{meetin_number}}
								</div>
								{{/if}}
								{{#if fax}}
								<div>
									<span class="namecard-icon icon-report"></span>&nbsp;FAX：{{fax}}
								</div>
								{{/if}}
                            </div>
                        </div>
                    </div>
                </div>
                {{/if}}
                {{#if namecard_cate2_public_flg}}
                <div class="feature-item"  id="feature-item-2">
                    <div class="mi_namecard_detail_header">{{namecard_cate2_title}}</div>
                    <div class="mi_namecard_detail_content" id="namecard_table">
                        <table class="namecard-table">
                            <tbody>
                            <tr class="namecard-table-tr">
                                <th class="namecard-table-th"><p>{{namecard_free1_name}}</p></th>
                                <td>&nbsp;{{namecard_free1_val}}</td>
                            </tr>
                            <tr class="namecard-table-tr">
                                <th class="namecard-table-th"><p>{{namecard_free2_name}}</p></th>
                                <td>&nbsp;{{namecard_free2_val}}</td>
                            </tr>
                            <tr class="namecard-table-tr">
                                <th class="namecard-table-th"><p>{{namecard_free3_name}}</p></th>
                                <td>&nbsp;{{namecard_free3_val}}</td>
                            </tr>
                            <tr class="namecard-table-tr">
                                <th class="namecard-table-th"><p>{{namecard_free4_name}}</p></th>
                                <td>&nbsp;{{namecard_free4_val}}</td>
                            </tr>
                            <tr class="namecard-table-tr">
                                <th class="namecard-table-th"><p>{{namecard_free5_name}}</p></th>
                                <td>&nbsp;{{namecard_free5_val}}</td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                {{/if}}
                {{#if namecard_cate3_public_flg}}
                <div class="feature-item"  id="feature-item-3">
                    <div class="mi_namecard_detail_header">{{namecard_cate3_title}}</div>
                    <div class="mi_namecard_detail_content">
                        <div class="center">
                            <span class="namecard-photo-contain-preview" style="background-image: url('{{namecard_photo1_url}}');"></span>
                            <div class="namecard-photo-text">{{namecard_photo1_desc}}</div>
                        </div>
                        <div class="center_br"></div>
                        <div class="center">
                            <span class="namecard-photo-contain-preview" style="background-image: url('{{namecard_photo2_url}}');"></span>
                            <div class="namecard-photo-text">{{namecard_photo2_desc}}</div>
                        </div>
                    </div>
                </div>
                {{/if}}
                {{#if namecard_cate4_public_flg}}
                <div class="feature-item"  id="feature-item-4">
                    <div class="mi_namecard_detail_header">{{namecard_cate4_title}}</div>
                    <div class="mi_namecard_detail_content">
                        <div>{{namecard_introduction}}</div>
                    </div>
                </div>
                {{/if}}
            </div>
			<div class="mi_close_icon modal-close" id="namecard_close_icon">
				<span class="icon-close" id="namecard_close"></span>
			</div>
        </div>
{{/if}}

{{#if contents_flg}}
        <div class="namecard_contents_none">
            名刺情報がありません
        </div>
		<div class="mi_close_icon modal-close" id="namecard_close_icon">
			<span class="icon-close" id="namecard_close"></span>
		</div>
{{/if}}
</script>

{/literal}
<!-- 名刺表示時のバックレイアウト begin -->
<div class="namecard_overlay"></div>
<!-- 名刺表示時のバックレイアウト end -->