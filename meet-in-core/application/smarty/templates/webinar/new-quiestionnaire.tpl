{include file="./common/header.tpl"}

<script src="/js/webinar.js?{$application_version}"></script>

{literal}
<style>
.new_quiestionnaire_page_main_content {
    width: 100%;
    height: 100%;
    background: #EEEEEE;
    padding-top: 50px;
    margin-bottom: 130px;
}

.new_quiestionnaire_page_sub_content {
    width: 880px;
    height: 100%;
    margin: 0 auto;
    padding-top: 50px;
}

.new_quiestionnaire_page_title_area {
    margin-top: 84px;
    font-size: 20px;
    color: #333333;
    font-family: ヒラギノ角ゴシック;
    font-weight: bold;
}

#new_quiestionnaire_title_icon {
    margin-top: -2px;
}

.new_quiestionnaire_top_content {
    width: 100%;
    height: 60px;
    background: #FFFFFF;
    margin-top: 38px;
    display: flex;
    margin-bottom: 70px;
}

.new_quiestionnaire_top_left_content {
    width: 300px;
    line-height: 60px;
    border-right: 1px solid #EEEEEE;
}

.new_quiestionnaire_top_right_content {
    width: 100%;
}

.new_quiestionnaire_top_right_area {
    width: 100%;
    height: 100%;
}

.new_quiestionnaire_top_left_area {
    width: 100%;
    display: flex;
    padding-left: 28px;
} 

.new_quiestionnaire_title {
    width: 427px;
    height: 40px;
}

.new_quiestionnaire_title {
    width: 427px;
    height: 40px;
    margin-top: 8px;
    margin-left: 7px;
    border-radius: 4px;
    border: 1px solid #ccc;
    font-size: 14px;
    padding-left: 8px;
}

.quiestionnaire_red_area {
    width: 39px;
    height: 15px;
    background: #E16A6C;
    text-align: center;
    line-height: 15px;
    color: #FFFFFF;
    margin-top: 22px;
    margin-left: 19px;
}

.quiestionnaire_red_area_text {
    font-size: 12px;
}

.new_quiestionnaire_middle_content {
    width: 100%;
    margin: 0 auto;
    margin-top: 50px;
}

.new_quiestionnaire_middle_content_main {
    width: 100%;
    margin: 0 auto;
    background: #FFFFFF;
    margin-top: 50px;
}

.new_quiestionnaire_name_area {
    width: 100%;
    height: 60px;
    background: #FFFFFF;
    display: flex;
    border-bottom: 1px solid #EEEEEE;
}

.new_quiestionnaire_input_area {
    width: 100%;
    height: 60px;
    background: #FFFFFF;
    display: flex;
    border-bottom: 1px solid #EEEEEE;
}

.new_quiestionnaire_content_area {
    width: 100%;
    height: 104px;
    background: #FFFFFF;
    display: flex;
    border-bottom: 1px solid #EEEEEE;
}

.new_quiestionnaire_name_left_area {
    width: 223px;
    line-height: 60px;
    border-right: 1px solid #EEEEEE;
}

.new_quiestionnaire_input_left_area {
    width: 223px;
    line-height: 60px;
    border-right: 1px solid #EEEEEE;
}

.new_quiestionnaire_input_right_area {
    display: flex;
}

.input_box {
    margin-left: 17px;
    line-height: 59px;
}

.new_quiestionnaire_content_left_area {
    width: 223px;
    line-height: 60px;
    border-right: 1px solid #EEEEEE;
}

.new_quiestionnaire_text_area {
    width: 100%;
    display: flex;
    padding-left: 28px;
}

.new_quiestionnaire_content_input {
    width: 630px;
    height: 88px;
    font-size: 14px;
    border: 1px solid #ccc;
    border-radius: 4px;
    margin-left: 7px;
    margin-top: 6px;
    padding-left: 8px;
    resize: none;
    outline: none;
    overflow: scroll;
}

.new_quiestionnaire_answer_area {
    width: 100%;
    height: 100%;
    background: #FFFFFF;
    display: flex;
}

.new_quiestionnaire_answer_left_area {
    width: 468px;
    line-height: 60px;
    border-right: 1px solid #EEEEEE;
}

.new_quiestionnaire_answer_right_area {
    padding-bottom: 7px;
}

.add_answer_form_button {
    width: 111px;
    height: 30px;
    background: #D8D8D8;
    margin-left: 7px;
}

.add_answer_form_button_area {
    width: 656px;
    margin-top: 15px;
    margin-bottom: 30px;
}

input[type="text"]:focus {
    outline: 0;
}

.answer_input_area {
    width: 460px;
    height: 160px;
    overflow: scroll;
}

.add_quiestionnaire_button {
    width: 111px;
    height: 30px;
    background: #D8D8D8;
    margin-top: 20px;
}

.new_quiestionnaire_middle_content_name_area {
    margin-bottom: -40px;
}

.quiestionnaire_add_data_button_area {
    width: 100%;
    height: 100px;
    margin-top: 50px;
    text-align: center;
}

.quiestionnaire_add_data_button {
    width: 160px;
    height: 40px;
    background: #ffaa00;
    border-radius: 2px;
}

</style>
{/literal}

<div class="new_quiestionnaire_page_main_content">
    <div class="new_quiestionnaire_page_sub_content">
        <form method="POST" action="/webinar/quiestionnaire">
        <div class="new_quiestionnaire_page_title_area">
            <span class="icon-folder mi_content_title_icon" id="new_quiestionnaire_title_icon"></span>
            <span class="new_quiestionnaire_page_title_text">
                アンケート集新規作成
            </span>
        </div>
        
        <div class="new_quiestionnaire_top_content">
            <div class="new_quiestionnaire_top_left_content">
                <div class="new_quiestionnaire_top_left_area">
                    <span>アンケート集名</span>
                    <div class="quiestionnaire_red_area">
                        <span class="quiestionnaire_red_area_text">必須</span>
                    </div>
                </div>
            </div>
            <div class="new_quiestionnaire_top_right_content">
                <div class="new_quiestionnaire_top_right_area">
                    <input type="text" name="quiestionnaire_group_name" class="new_quiestionnaire_title" id="quiestionnaire_group_name">
                </div>
            </div>
        </div>

        <div class="new_quiestionnaire_middle_content" id="new_quiestionnaire_middle_content_1">
            <div class="new_quiestionnaire_middle_content_name_area">アンケート1</div>
            <div class="new_quiestionnaire_middle_content_main" id="new_quiestionnaire_middle_content_main1">
                <div class="new_quiestionnaire_name_area">
                    <div class="new_quiestionnaire_name_left_area">
                        <div class="new_quiestionnaire_text_area">
                            <span>アンケート名</span>
                            <div class="quiestionnaire_red_area">
                                <span class="quiestionnaire_red_area_text">必須</span>
                            </div>
                        </div>
                    </div>
                    <div class="new_quiestionnaire_name_right_area">
                        <input type="text" name="quiestionnaire_name1" class="new_quiestionnaire_title" id="quiestionnaire_name">
                    </div>
                </div>

                <div class="new_quiestionnaire_input_area">
                    <div class="new_quiestionnaire_input_left_area">
                        <div class="new_quiestionnaire_text_area">
                            <span>質問形式</span>
                        </div>
                    </div>
                    <div class="new_quiestionnaire_input_right_area">
                        <div class="input_box">
                            <input type="checkbox" name="quiestionnaire_input_type1" value=0 class="input_check_box" checked="checked" id="first_checkbox">
                            <span>3択以上</span>
                        </div> 
                        <div class="input_box">
                            <input type="checkbox" name="quiestionnaire_input_type1" value=1 class="input_check_box" id="second_checkbox">
                            <span>2択(はい・いいえ)</span>
                        </div>
                        <div class="input_box">
                            <input type="checkbox" name="quiestionnaire_input_type1" value=2 class="input_check_box" id="third_checkbox">
                            <span>記述式</span>
                        </div> 
                    </div>
                </div>

                <div class="new_quiestionnaire_content_area">
                    <div class="new_quiestionnaire_content_left_area">
                        <div class="new_quiestionnaire_text_area">
                            <span>質問内容</span>
                            <div class="quiestionnaire_red_area">
                                <span class="quiestionnaire_red_area_text">必須</span>
                            </div>
                        </div>
                    </div>
                    <div class="new_quiestionnaire_content_right_area">
                        <input type="text" name="quiestionnaire_content1" value="" placeholder="" class="new_quiestionnaire_content_input" maxlength="255" rows="10" cols="50">
                    </div>
                </div>

                <div class="new_quiestionnaire_answer_area" id="new_quiestionnaire_answer_area1">
                    <div class="new_quiestionnaire_answer_left_area">
                        <div class="new_quiestionnaire_text_area">
                            <span>回答</span>
                        </div>
                    </div>
                    <div class="new_quiestionnaire_answer_right_area" id="new_quiestionnaire_answer_right_area1">
                        <div class="answer_input_area" id="answer_input_area">
                            <input type="text" name="quiestionnaire_answer1[]" placeholder="" class="new_quiestionnaire_title" id="select_text1">
                            <input type="text" name="quiestionnaire_answer1[]" placeholder="" class="new_quiestionnaire_title" id="select_text2">
                            <input type="text" name="quiestionnaire_answer1[]" placeholder="" class="new_quiestionnaire_title" id="select_text3">
                            <input type="text" name="quiestionnaire_answer1[]" placeholder="" class="new_quiestionnaire_title" id="select_text4">
                        </div>
                        <div class="add_answer_form_button_area">
                            <button type="button" class="add_answer_form_button" id="add_answer_text_form">追加</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <button class="add_quiestionnaire_button" id="add_quiestionnaire_button" type="button">追加</button>
        <div class="quiestionnaire_add_data_button_area">
            <button type="submit" class="quiestionnaire_add_data_button" id="quiestionnaire_add_data_button">登録する</button>
        </div>
    </form>
    </div>
</div>
{include file="./common/footer.tpl"}