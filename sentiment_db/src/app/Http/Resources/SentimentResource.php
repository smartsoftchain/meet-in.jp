<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class SentimentResource extends JsonResource
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
            'conversation_id'      => $this->conversation_id,
            'speaker_label'        => $this->speaker_label,
            'segment'              => $this->segment,
            'start_time'           => $this->start_time,
            'start_date_time'      => $this->start_date_time,
            'start_pos_sec'        => $this->start_pos_sec,
            'end_pos_sec'          => $this->end_pos_sec,
            'energy'               => $this->energy,
            'stress'               => $this->stress,
            'emo_cog'              => $this->emo_cog,
            'concentration'        => $this->concentration,
            'anticipation'         => $this->anticipation,
            'excitement'           => $this->excitement,
            'hesitation'           => $this->hesitation,
            'uncertainty'          => $this->uncertainty,
            'intensive_thinking'   => $this->intensive_thinking,
            'imagination_activity' => $this->imagination_activity,
            'embarrassment'        => $this->embarrassment,
            'passionate'           => $this->passionate,
            'brain_power'          => $this->brain_power,
            'confidence'           => $this->confidence,
            'aggression'           => $this->aggression,
            'call_priority'        => $this->call_priority,
            'atmosphere'           => $this->atmosphere,
            'upset'                => $this->upset,
            'content'              => $this->content,
            'dissatisfaction'      => $this->dissatisfaction,
            'extreme_emotion'      => $this->extreme_emotion,
            'created_at'           => $this->created_at,
        ];
    }
}
