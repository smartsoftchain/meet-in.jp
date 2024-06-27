<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::namespace('App\Http\Controllers\Api\Sc')->prefix('sc')->group(function () {
    Route::prefix('sentiment')->group(function () {
        Route::get('{conversation_id}/{speaker_label}', 'SentimentController@index');
        Route::post('create', 'SentimentController@create');
        Route::post('bulk_upsert', 'SentimentController@bulkCreate');
    });

    Route::prefix('transcription')->group(function () {
        Route::get('{conversation_id}/{speaker_label}', 'TranscriptionController@index');
        Route::post('create', 'TranscriptionController@create');
        Route::post('bulk_upsert', 'TranscriptionController@bulkCreate');
    });

    Route::prefix('pause')->group(function () {
        Route::get('{conversation_id}/{speaker_label}', 'PauseController@index');
        Route::post('create', 'PauseController@create');
        Route::post('bulk_create', 'PauseController@bulkCreate');
    });

    Route::prefix('barge-in')->group(function () {
        Route::get('{conversation_id}/{speaker_label}', 'BargeInController@index');
        Route::post('create', 'BargeInController@create');
        Route::post('bulk_create', 'BargeInController@bulkCreate');
    });
});

Route::namespace('App\Http\Controllers\Api\Meet')->prefix('meet')->group(function () {
    Route::prefix('sentiment')->group(function () {
        Route::get('{conversation_id}/{speaker_label}', 'SentimentController@index');
        Route::post('create', 'SentimentController@create');
        Route::post('bulk_upsert', 'SentimentController@bulkCreate');
    });

    Route::prefix('transcription')->group(function () {
        Route::get('{conversation_id}/{speaker_label}', 'TranscriptionController@index');
        Route::post('create', 'TranscriptionController@create');
        Route::post('bulk_upsert', 'TranscriptionController@bulkCreate');
    });

    Route::prefix('pause')->group(function () {
        Route::get('{conversation_id}/{speaker_label}', 'PauseController@index');
        Route::post('create', 'PauseController@create');
        Route::post('bulk_create', 'PauseController@bulkCreate');
    });

    Route::prefix('barge-in')->group(function () {
        Route::get('{conversation_id}/{speaker_label}', 'BargeInController@index');
        Route::post('create', 'BargeInController@create');
        Route::post('bulk_create', 'BargeInController@bulkCreate');
    });
});
