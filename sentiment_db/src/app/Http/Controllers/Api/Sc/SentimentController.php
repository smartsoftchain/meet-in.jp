<?php

namespace App\Http\Controllers\Api\Sc;

use App\Http\Controllers\Api\Base\BaseSentimentController;
use App\Jobs\Sc\RegisterSentiments;
use App\Models\Sc\ScSentiment;

class SentimentController extends BaseSentimentController
{
    public function __construct(ScSentiment $model)
    {
        $this->model = $model;
        $this->registerJob = new RegisterSentiments();
    }
}
