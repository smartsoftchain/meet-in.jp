<?php

namespace App\Jobs\Sc;

use App\Models\Sc\ScBargeIn;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class RegisterBargeIns implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $params;

    /**
     * Create a new job instance.
     * @param array $params BargeInのパラメータ
     */
    public function __construct(array $params = [])
    {
        $this->params = $params;
        $this->onQueue(env('SC_SQS_QUEUE', ''));
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        $bargeIn = ScBargeIn::factory($this->params);
        try {
            $bargeIn->save();
        } catch (\Throwable $e) {
            $message = self::class . ': '. $e->getMessage();
            Log::error($message, [$this->params]);

            $delaySecond = random_int(60, 180);
            self::dispatch($this->params)->delay(now()->addSeconds($delaySecond));
        }
    }
}