{include file="./common/header.tpl"}

<script src="/js/webinar_question.js?{$application_version}"></script>
<link rel="stylesheet" href="/css/webinar.css?{$application_version}">

<!-- メインコンテンツ start -->
<div id="mi_main_contents" class="questionnaire_content">
	<!-- トップナビ start -->
	<div id="mi_top_nav">
		<!-- パンくずリスト start -->
		<div class="mi_breadcrumb_list">
			<a href="/index/menu">TOP</a>&nbsp;&gt;&nbsp;
			ウェビナー一覧
		</div>
		<!-- パンくずリスト end -->
	</div>
	<!-- トップナビ end -->

	<!-- コンテンツエリア start -->
	<div id="mi_content_area">
		<!-- コンテンツタイトル start -->
		<div class="mi_content_title mi_content_questionnaire_title">
			<span class="icon-folder mi_content_title_icon"></span>
			<h1>ウェビナー詳細</h1>
        </div>
        <!-- コンテンツタイトル end -->

        <!-- タブ start -->
		<div class="webinar_count_tab_wrap">
            <div class="webinar_count_tab_area">
                <a href=""><div class="webinar_count_tab">概要</div></a>
                <a href=""><div class="webinar_count_tab">アンケート結果</div></a>
                <a href=""><div class="webinar_count_tab">参加者一覧（1000人）</div></a>
            </div>
        </div>
        <!-- タブ end -->

        <!-- セミナータイトル start -->
        <div class="seminar_title">
            セミナータイトル
            <p class="seminar_title_detail">{$list_name}</p>
        </div>
        <!-- セミナータイトル end -->

		<!-- テーブル start -->
        <div class="mi_table_main_wrap webinar_list_area">
            <table class="mi_table_main question_list">
                <thead>
                    <tr>
                        <th>形式</th>
                        <th>アンケート名</th>
                        <th>回答率</th>
                        <th>実施日時</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {foreach from=$list item='row'}
                    <tr class="question_history"
                    data-history-id={$row.history_id} 
                    data-question={$row.question} 
                    data-answer-percentage={$row.answer_percentage} 
                    data-participant={$row.participant} 
                    data-answer-type={$row.answer_type} 
                    data-questionnaire-id={$row.questionnaire_id} 
                    >
                        {if $row.answer_type eq 2}
                            <td>記述式</td>
                        {elseif $row.answer_type eq 1}
                            <td>二択式</td>
                        {elseif $row.answer_type eq 0}
                            <td>選択式</td>
                        {/if}
                        <td class="title">{$row.title}</td>
                        <td class="answer_percentage">{$row.answer_percentage}％</td>
                        <td>{$row.holding_date}</td>
                        <td> > </td>
                    </tr>
                    {/foreach}
                </tbody>
            </table>
        </div>
		<!-- テーブル end -->
	</div>
	<!-- コンテンツエリア end -->

    <!-- モーダル start -->
    <div class="modal_content" style="display: none;">
        <p class="modal_title">アンケート集計結果を表示しています</p>
        <div class="modal_body">
            <div class="modal_item">
                <div class="item_explanation">
                    <span class="square_icon"></span>
                    質問内容
                </div>
                <p class="item_detail question_body"></p>
            </div>
            <div class="modal_item">
                <div class="item_block">
                    <div class="item_explanation">
                        <span class="square_icon"></span>
                        結果
                    </div>
                    <div class="item_detail">
                        <p class="item_sub_title">回答率</p>
                        <p class="question_result">50%（50／100人が回答）</p>
                    </div>
                    <p class="item_sub_title">内訳</p>
                    <div class="item_detail detail">
                        <ul class="vote_block">
                        </ul>
                    </div>
                </div>
            </div>
        </div>
        <div class="modal_close_btn">キャンセル</div>
    </div>
    <div class="modal_overlay" style="display: none;"></div>
    <!-- モーダル end -->

</div>
<!-- メインコンテンツ end -->


{include file="./common/footer.tpl"}
