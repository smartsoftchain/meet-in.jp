<?php

namespace App\Models\Sc;

use App\Models\Base\BaseSentiment;

class ScSentiment extends BaseSentiment
{
    protected $table = 'sc_conversations';

    // SC独自の仕様変更が入った場合はメソッドをoverrideして変更する
    // 共通の仕様変更でない場合、Baseを変更しないこと
}
