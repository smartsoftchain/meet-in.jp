<?php

namespace App\Http\Controllers\Api\Sc;

use App\Http\Controllers\Api\Base\BaseTranscriptionController;
use App\Jobs\Sc\RegisterTranscriptions;
use App\Models\Sc\ScTranscription;

class TranscriptionController extends BaseTranscriptionController
{
    public function __construct(ScTranscription $model)
    {
        $this->model = $model;
        $this->registerJob = new RegisterTranscriptions();
    }
}
