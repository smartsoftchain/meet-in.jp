<?php

namespace App\Http\Controllers\Api\Meet;

use App\Http\Controllers\Api\Base\BaseBargeInController;
use App\Jobs\Meet\RegisterBargeIns;
use App\Models\Meet\MeetBargeIn;

class BargeInController extends BaseBargeInController
{
    public function __construct(MeetBargeIn $model)
    {
        $this->model = $model;
        $this->registerJob = new RegisterBargeIns();
    }
}
