<?php

namespace App\Http\Controllers\Api\Base;

use App\Http\Controllers\Controller;
use App\Http\Resources\SentimentResource;
use App\Models\Base\BaseSentiment;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

abstract class BaseSentimentController extends Controller
{
    /**
     * @var BaseSentiment
     */
    protected $model;

    /**
     * @var Dispatchable
     */
    protected $registerJob;

    public function index($conversation_id, $speaker_label)
    {
        try {
            $sentiments = ($this->model)::search($conversation_id, $speaker_label);
        } catch (\Throwable $e) {
            $message = 'index method in ' . self::class . ': '. $e->getMessage();
            Log::error($message, ['conversation_id' => $conversation_id, 'speaker_label' => $speaker_label]);
            return response()->json([], 500);
        }

        return response()->json(SentimentResource::collection($sentiments));
    }

    public function create(Request $request)
    {
        $param = $request->json()->all();
        $sentiment = ($this->model)::factory($param);
        try {
            $sentiment->save();
        } catch (\Throwable $e) {
            $message = 'create method in ' . self::class . ': '. $e->getMessage();
            Log::error($message, $sentiment->toArray());
            return response()->json($param, 500);
        }

        return response()->json(SentimentResource::make($sentiment));
    }

    public function bulkCreate(Request $request)
    {
        $params = $request->json()->all();
        $sentiments = [];
        foreach ($params as $param) {
            $sentiment = ($this->model)::factory($param);
            try {
                ($this->registerJob)::dispatch($sentiment->toArray());
            } catch (\Throwable $e) {
                $message = 'bulkCreate method in ' . self::class . ': '. $e->getMessage();
                Log::error($message, $sentiment->toArray());
            }
            $sentiments[] = $sentiment;
        }

        return response()->json(SentimentResource::collection(collect($sentiments)));
    }
}
