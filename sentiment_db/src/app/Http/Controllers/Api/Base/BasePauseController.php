<?php

namespace App\Http\Controllers\Api\Base;

use App\Http\Controllers\Controller;
use App\Http\Resources\PauseResource;
use App\Models\Base\BasePause;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

abstract class BasePauseController extends Controller
{
    /**
     * @var BasePause
     */
    protected $model;

    /**
     * @var Dispatchable
     */
    protected $registerJob;

    public function index($conversation_id, $speaker_label)
    {
        try {
            $pauses = ($this->model)::search($conversation_id, $speaker_label);
        } catch (\Throwable $e) {
            $message = 'index method in ' . self::class . ': '. $e->getMessage();
            Log::error($message, ['conversation_id' => $conversation_id, 'speaker_label' => $speaker_label]);
            return response()->json([], 500);
        }

        return response()->json(PauseResource::collection($pauses));
    }

    public function create(Request $request)
    {
        $param = $request->json()->all();
        $pause = ($this->model)::factory($param);
        try {
            $pause->save();
        } catch(\Throwable $e) {
            $message = 'crete method in ' . self::class . ': '. $e->getMessage();
            Log::error($message, $pause->toArray());
            return response()->json($param, 500);
        }

        return response()->json(PauseResource::make($pause));
    }

    public function bulkCreate(Request $request)
    {
        $params = $request->json()->all();
        $pauses = [];
        foreach ($params as $param) {
            $pause = ($this->model)::factory($param);
            try {
                ($this->registerJob)::dispatch($pause->toArray());
            } catch (\Throwable $e) {
                $message = 'bulkCreate method in ' . self::class . ': '. $e->getMessage();
                Log::error($message, $pause->toArray());
            }
            $pauses[] = $pause;
        }

        return response()->json(PauseResource::collection(collect($pauses)));
    }
}
