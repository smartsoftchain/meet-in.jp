<?php

namespace App\Http\Controllers\Api\Meet;

use App\Http\Controllers\Api\Base\BaseSentimentController;
use App\Jobs\Meet\RegisterSentiments;
use App\Models\Meet\MeetSentiment;

class SentimentController extends BaseSentimentController
{
    public function __construct(MeetSentiment $model)
    {
        $this->model = $model;
        $this->registerJob = new RegisterSentiments();
    }
}
