<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class TranscriptionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        return [
            'conversation_id' => $this->conversation_id,
            'speaker_label'   => $this->speaker_label,
            'start_time'      => $this->start_time,
            'end_time'        => $this->end_time,
            'text'            => $this->text,
            'created_at'      => $this->created_at,
        ];
    }
}
