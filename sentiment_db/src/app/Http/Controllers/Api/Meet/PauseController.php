<?php

namespace App\Http\Controllers\Api\Meet;

use App\Http\Controllers\Api\Base\BasePauseController;
use App\Jobs\Meet\RegisterPauses;
use App\Models\Meet\MeetPause;

class PauseController extends BasePauseController
{
    public function __construct(MeetPause $model)
    {
        $this->model = $model;
        $this->registerJob = new RegisterPauses();
    }
}
