<?php

namespace App\Http\Controllers\Api\Base;

use App\Http\Controllers\Controller;
use App\Http\Resources\TranscriptionResource;
use App\Models\Base\BaseTranscription;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

abstract class BaseTranscriptionController extends Controller
{
    /**
     * @var BaseTranscription
     */
    protected $model;

    /**
     * @var Dispatchable
     */
    protected $registerJob;

    public function index($conversation_id, $speaker_label)
    {
        try {
            $transcriptions = ($this->model)::search($conversation_id, $speaker_label);
        } catch (\Throwable $e) {
            $message = 'index method in ' . self::class . ': '. $e->getMessage();
            Log::error($message, ['conversation_id' => $conversation_id, 'speaker_label' => $speaker_label]);
            return response()->json([], 500);
        }

        return response()->json(TranscriptionResource::collection($transcriptions));
    }

    public function create(Request $request)
    {
        $param = $request->json()->all();
        $transcription = ($this->model)::factory($param);
        try {
            $transcription->save();
        } catch (\Throwable $e) {
            $message = 'create method in ' . self::class . ': '. $e->getMessage();
            Log::error($message, $transcription->toArray());
            return response()->json($param, 500);
        }

        return response()->json(TranscriptionResource::make($transcription));
    }

    public function bulkCreate(Request $request)
    {
        $params = $request->json()->all();
        $transcriptions = [];
        foreach ($params as $param) {
            $transcription = ($this->model)::factory($param);
            try {
                ($this->registerJob)::dispatch($transcription->toArray());
            } catch (\Throwable $e) {
                $message = 'bulkCreate method in ' . self::class . ': '. $e->getMessage();
                Log::error($message, $transcription->toArray());
            }
            $transcriptions[] = $transcription;
        }

        return response()->json(TranscriptionResource::collection(collect($transcriptions)));
    }
}
