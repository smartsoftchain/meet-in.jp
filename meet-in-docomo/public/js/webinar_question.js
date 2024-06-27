/**
 * ウェビナーアンケート関連で使用するJS
 */
$(function () {

  // アンケート結果詳細の情報取得
  $('.question_list tbody tr').on('click', function () {
    // webinar_questionnaire_historyテーブルのid
    var history_id = $(this).data('history-id')
    // 質問内容
    var question = $(this).data('question')
    // アンケート全体に対する回答率
    var answer_percentage = $(this).data('answer-percentage')
    // ウェビナー参加者数
    var participant = $(this).data('participant')
    // 回答形式
    var answer_type = $(this).data('answer-type')
    // questionnaireテーブルのid
    var questionnaire_id = $(this).data('questionnaire-id')

    $.ajax({
      url: "/Questionnaire/get-answer",
      type: "POST",
      dataType: "json",
      data: {
        history_id : history_id,
        question: question,
        answer_percentage: answer_percentage,
        participant: participant,
        answer_type: answer_type,
        questionnaire_id: questionnaire_id
      },
    }).done(function(res) {
      var html = ''
      var answer_length = 0
      if(res.answer_type === '0' || res.answer_type === '1') {
        res.detail.forEach(function(element, index){
          html += '<li><span>' + element.answer + '</span>'+'<span>' + element.answer_count + '票 </span></li>'
          answer_length = answer_length + Number(element.answer_count)
        });
        document.querySelector('ul.vote_block').innerHTML = html;
        $('.question_result').html(res.answer_percentage+'%'+'('+answer_length+'/'+participant+'人が回答)')
      }else{
        res.detail.forEach(function(element, index){
          html += '<li><span>' + element.answer + '</span></li>'
          answer_length = answer_length + Number(element.answer_count)
        });

        document.querySelector('ul.vote_block').innerHTML = html;
        $('.question_result').html(res.answer_percentage+'%'+'('+res.detail.length+'/'+participant+'人が回答)')
      }
      $('.question_body').html(res.question)
    }).fail(function(error) {
      console.log(error)
      alert('詳細情報の取得に失敗しました')
    });
  })
  
  // アンケート結果モーダル表示
  $('.question_list td').on('click', function() {
    $('.modal_content').show();
    $('.modal_overlay').show();
  })

  // アンケート結果モーダル非表示
  $('.modal_close_btn').on('click', function() {
    $('.modal_content').hide();
    $('.modal_overlay').hide();
  })

  // モーダルの外側をクリックした際に、モーダルを非表示
  $('.modal_overlay').on('click', function () {
    $('.modal_content').hide();
    $('.modal_overlay').hide();
  });

  
});