<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CheckReferer
{
    private $allowDomains = [
        'https://sales-crowd.jp',
        'https://stage.sales-crowd.jp',
        'https://meet-in.jp',
        'https://stage.meet-in.jp',
        'https://dev3.meet-in.jp',
    ];
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        $referer = $request->headers->get('referer');
        foreach ($this->allowDomains as $allowDomain) {
            if (Str::startsWith($referer, $allowDomain)) {
                return $next($request);
            }
        }

        abort(404);
    }
}
