<?php

namespace App\Models\Meet;

use App\Models\Base\BaseBargeIn;

class MeetBargeIn extends BaseBargeIn
{
    protected $table = 'meet_conversations';

    // MEET独自の仕様変更が入った場合はメソッドをoverrideして変更する
    // 共通の仕様変更でない場合、Baseを変更しないこと
}
