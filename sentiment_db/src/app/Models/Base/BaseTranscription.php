<?php

namespace App\Models\Base;

use Baopham\DynamoDb\DynamoDbModel as Model;

abstract class BaseTranscription extends Model
{
    protected static $type = 'transcription';

    protected $primaryKey = 'hash_key';

    protected $compositeKey = ['hash_key', 'range_key'];

    protected $dynamoDbIndexKeys = [
        'SPEAKER_LABEL_LSI' => [
            'hash' => 'hash_key',
            'range' => 'speaker_label',
        ],
        'START_TIME_LSI' => [
            'hash' => 'hash_key',
            'range' => 'start_time',
        ],
    ];

    protected $fillable = [
        'conversation_id',
        'speaker_label',
        'segment',
        'start_time',
        'end_time',
        'text',
    ];

    private static function createHashKey($conversation_id)
    {
        return $conversation_id . '_' . self::$type;
    }

    private static function createRangeKey($start_time)
    {
        return $start_time;
    }

    public static function factory($param)
    {
        $model = new static($param);
        $model->hash_key = self::createHashKey($param['conversation_id']);
        $model->range_key = self::createRangeKey($param['start_time']);
        $model->type = self::$type;
        return $model;
    }

    public static function search($conversation_id, $speaker_label)
    {
        $speakerNo = (int)$speaker_label;
        $models = self::query()
            ->where('hash_key', '=', self::createHashKey($conversation_id))
            ->where('speaker_label', 'between', [$speakerNo, $speakerNo])
            ->get();

        return $models;
    }
}
