<?php

namespace App\Http\Controllers\Api\Meet;

use App\Http\Controllers\Api\Base\BaseTranscriptionController;
use App\Jobs\Meet\RegisterTranscriptions;
use App\Models\Meet\MeetTranscription;

class TranscriptionController extends BaseTranscriptionController
{
    public function __construct(MeetTranscription $model)
    {
        $this->model = $model;
        $this->registerJob = new RegisterTranscriptions();
    }
}
