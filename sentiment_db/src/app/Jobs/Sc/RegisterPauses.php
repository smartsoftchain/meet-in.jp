<?php

namespace App\Jobs\Sc;

use App\Models\Sc\ScPause;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class RegisterPauses implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $params;

    /**
     * Create a new job instance.
     * @param array $params Pauseのパラメータ
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
        $pause = ScPause::factory($this->params);
        try {
            $pause->save();
        } catch (\Throwable $e) {
            $message = self::class . ': '. $e->getMessage();
            Log::error($message, [$this->params]);

            $delaySecond = random_int(60, 180);
            self::dispatch($this->params)->delay(now()->addSeconds($delaySecond));
        }
    }
}
