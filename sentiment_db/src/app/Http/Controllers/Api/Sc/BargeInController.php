<?php

namespace App\Http\Controllers\Api\Sc;

use App\Http\Controllers\Api\Base\BaseBargeInController;
use App\Jobs\Sc\RegisterBargeIns;
use App\Models\Sc\ScBargeIn;

class BargeInController extends BaseBargeInController
{
    public function __construct(ScBargeIn $model)
    {
        $this->model = $model;
        $this->registerJob = new RegisterBargeIns();
    }
}
