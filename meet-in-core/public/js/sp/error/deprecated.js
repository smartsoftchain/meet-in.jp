/**
 * URLコピークリックで現在のURLをコピーする
 */
$(document).on('click','#room_copy', function() {
  //elmはtextareaノード
  var elm = $("#room")[0];

  //select()でtextarea内の文字を選択
  elm.select();

  //rangeでtextarea内の文字を選択
  var range = document.createRange();
  range.selectNodeContents(elm);
  var sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
  elm.setSelectionRange(0, 999999);

  //execCommandを実施
  document.execCommand("copy");

  confirm('URLをコピーしました');
});

$(function () {

  $("#ios_version").text(RECOMMENDED_CHECK.RECOMMENDED_SAFARI_VERSION);

  $(window).on("orientationchange resize", function(){
    setLandscape();
  });
  setLandscape();

});

function setLandscape() {
  if(Math.abs(window.orientation) === 90) {
    $("body").addClass("landscape");
  } else {
    $("body").removeClass("landscape");
  }
}
