<?php

namespace App\Http\Controllers\Api\Base;

use App\Http\Controllers\Controller;
use App\Http\Resources\BargeInResource;
use App\Models\Base\BaseBargeIn;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

abstract class BaseBargeInController extends Controller
{
    /**
     * @var BaseBargeIn
     */
    protected $model;

    /**
     * @var Dispatchable
     */
    protected $registerJob;

    public function index($conversation_id, $speaker_label)
    {
        try {
            $bargeIns = ($this->model)::search($conversation_id, $speaker_label);
        } catch (\Throwable $e) {
            $message = 'index method in ' . self::class . ': '. $e->getMessage();
            Log::error($message, ['conversation_id' => $conversation_id, 'speaker_label' => $speaker_label]);
            return response()->json([], 500);
        }

        return response()->json(BargeInResource::collection($bargeIns));
    }

    public function create(Request $request)
    {
        $param = $request->json()->all();
        $bargeIn = ($this->model)::factory($param);
        try {
            $bargeIn->save();
        } catch (\Throwable $e) {
            $message = 'create method in ' . self::class . ': '. $e->getMessage();
            Log::error($message, $bargeIn->toArray());
            return response()->json($param, 500);
        }

        return response()->json(BargeInResource::make($bargeIn));
    }

    public function bulkCreate(Request $request)
    {
        $params = $request->json()->all();
        $bargeIns = [];
        foreach ($params as $param) {
            $bargeIn = ($this->model)::factory($param);
            try {
                ($this->registerJob)::dispatch($bargeIn->toArray());
            } catch (\Throwable $e) {
                $message = 'buikCreate method in ' . self::class . ': '. $e->getMessage();
                Log::error($message, $bargeIn->toArray());
            }
            $bargeIns[] = $bargeIn;
        }

        return response()->json(BargeInResource::collection(collect($bargeIns)));
    }
}
