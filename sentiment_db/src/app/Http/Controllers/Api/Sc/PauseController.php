<?php

namespace App\Http\Controllers\Api\Sc;

use App\Http\Controllers\Api\Base\BasePauseController;
use App\Jobs\Sc\RegisterPauses;
use App\Models\Sc\ScPause;

class PauseController extends BasePauseController
{
    public function __construct(ScPause $model)
    {
        $this->model = $model;
        $this->registerJob = new RegisterPauses();
    }
}
