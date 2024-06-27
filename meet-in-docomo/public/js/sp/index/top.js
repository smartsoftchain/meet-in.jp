$(function(){
  $('#open').on('click', function() {
    $('#overlay, #optionsModal').fadeIn();
  });

  $('#close, #overlay').on('click', function() {
      $('#overlay, #optionsModal').fadeOut();
  });

  locateCenter();
  $(window).resize(locateCenter);

  function locateCenter() {
    let w = $(window).width();
    let h = $(window).height();

    let cw = $('#optionsModal').outerWidth();
    let ch = $('#optionsModal').outerHeight();

    $('#optionsModal').css({
      'left': ((w - cw) / 2) + 'px',
      'top': ((h - ch) / 2) + 'px'
    });
  }
});
