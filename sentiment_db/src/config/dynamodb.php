<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Default DynamoDb Connection Name
    |--------------------------------------------------------------------------
    |
    | Here you may specify which of the DynamoDb connections below you wish
    | to use as your default connection for all DynamoDb work.
    */

    'default' => env('AWS_DYNAMO_CONNECTION', 'aws'),

    /*
    |--------------------------------------------------------------------------
    | DynamoDb Connections
    |--------------------------------------------------------------------------
    |
    | Here are each of the DynamoDb connections setup for your application.
    |
    | Most of the connection's config will be fed directly to AwsClient
    | constructor http://docs.aws.amazon.com/aws-sdk-php/v3/api/class-Aws.AwsClient.html#___construct
    */

    'connections' => [
        'aws' => [
            'credentials' => [
                'key' => env('AWS_DYNAMO_KEY'),
                'secret' => env('AWS_DYNAMO_SECRET'),
                // If using as an assumed IAM role, you can also use the `token` parameter
                'token' => env('AWS_SESSION_TOKEN'),
            ],
            'region' => env('AWS_DYNAMO_REGION'),
            'debug' => env('AWS_DYNAMO_DEBUG'),
        ],
        'aws_iam_role' => [
            'region' => env('AWS_DYNAMO_REGION'),
            'debug' => true,
        ],
        'local' => [
            'credentials' => [
                'key' => 'key',
                'secret' => 'secret',
            ],
            'region' => env('AWS_DYNAMO_REGION'),
            'endpoint' => env('AWS_DYNAMO_ENDPOINT'),
            'debug' => true,
        ],
        'test' => [
            'credentials' => [
                'key' => 'key',
                'secret' => 'secret',
            ],
            'region' => env('AWS_DYNAMO_REGION'),
            'endpoint' => env('AWS_DYNAMO_ENDPOINT'),
            'debug' => true,
        ],
    ],
];
