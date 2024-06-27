
const postURL = (URL, formData, responseType) => 
{
  return new Promise((resolve, reject) => {
    let xhr = new XMLHttpRequest();
    xhr.open("POST", URL, true);
    xhr.responseType = responseType || 'text';
    xhr.addEventListener("load", event => {
      if (event.target.status !== 200) {
        reject(new Error(`${event.target.status}: ${event.target.statusText}`));
      }
      if (responseType == '' || responseType == 'text') {
        resolve(event.target.responseText);
      } else if (responseType == 'blob') {
        resolve(event.target.response);
      }
    });
    xhr.send(formData);
  });
}

const getURL = (URL, formData, responseType) => 
{
  return new Promise((resolve, reject) => {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", URL, true);
    xhr.responseType = responseType || 'text';
    xhr.addEventListener("load", event => {
      if (event.target.status !== 200) {
        reject(new Error(`${event.target.status}: ${event.target.statusText}`));
      }
      if (responseType == '' || responseType == 'text') {
        resolve(event.target.responseText);
      } else if (responseType == 'blob') {
        resolve(event.target.response);
      }
    });
    xhr.send(formData);
  });
}

const onClickSettingBodypixDialog = (e) => {
	if(e) { e.preventDefault(); }
	
	// 商談画面の場合はゲストの登録を考慮し、ゲストIDを取得する
	var bodypixGuestId = sessionStorage.getItem('bodypixGuestId');
	if(!bodypixGuestId){
		// ゲストIDが存在しない場合は作成する
		sessionStorage.setItem('bodypixGuestId', localStorage.UUID);
		bodypixGuestId = sessionStorage.getItem('bodypixGuestId');
	}
	formData = new FormData();
	getURL('/negotiation/get-bodypix-bkgnd-image-list?bodypixGuestId='+bodypixGuestId, formData, 'text')
  .then(resp => {
//console.log(JSON.parse(resp));
		jsonResp = JSON.parse(resp);
		let gallery_contents = document.getElementById('gallery-contents');
		gallery_contents.textContent = null;
		// 背景画像なし、ぼかしは固定
		const no_effect = document.createElement('div');
		no_effect.classList.add('gallery');
		no_effect.id="bodypix_no_effect";
		no_effect.innerHTML = '<img src="/img/nobackground.png">';
		no_effect.onclick = onClickGalleryImage;

		const blur_effect = document.createElement('div');
		blur_effect.classList.add('gallery');
		blur_effect.id="bodypix_blur_effect";
		blur_effect.innerHTML = '<img src="/img/white-blurred-background.png">';
		blur_effect.onclick = onClickGalleryImage;

		gallery_contents.appendChild(no_effect);
		gallery_contents.appendChild(blur_effect);

		jsonResp.files.forEach((el) => {
			const gallery = document.createElement('div');
			const img = document.createElement('img');
			img.src = el;
			gallery.classList.add('gallery');
			gallery.id = el;
			gallery.onclick = onClickGalleryImage;
			// ユーザー登録画像の場合の処理
			if(el.indexOf('/img/bodypix/') != -1){
				gallery.classList.add('user_add_bodypix');
			}
			gallery.appendChild(img);
			gallery_contents.appendChild(gallery);
			document.getElementById(el).addEventListener('click', (e) => {
				console.log(`gallery click at ${e.target.src}`);
			});
		});
		onOpenBodypixDialog();
		// 画像登録・画像削除・画像編集ボタンの初期化を行う
		initBtnBackgroundImage();
		$("#setting-bodypix-dialog").fadeIn(500);
	});
}

$('#setting-bodypix-dialog-start-button').click(function(){
	onOkBodypixDialog();

	// safariでは映像を自動再生できないため
	if (USER_PARAM_BROWSER === "Safari") {
		setBackgndImgDialog();
	}
});

const onClickGalleryImage = (e) => {
	const et = e.target;
	const gallery = (et.src != null) ? et.parentNode : et;
//console.log(gallery.getAttribute('id'));
	let gallery_contents = document.getElementById('gallery-contents');
	Array.from(gallery_contents.children).forEach((el) => {
		el.classList.toggle('gallery-selected', false);
	});
	gallery.classList.toggle('gallery-selected', true);
}

const settingDropdownMenu = () => {
	document.getElementById("settingDropdown").classList.toggle("show");
}

// BodyPix設定ダイアログを閉じる
$('#setting-bodypix-dialog-cancel-button').click(function(){
	onCancelBodypixDialog();
	$("#setting-bodypix-dialog").fadeOut(500);
});

// 詳細設定の展開
$('#setting-bodypix-detail-title').click(function(){
	$('#setting-bodypix-detail').slideToggle();
});

