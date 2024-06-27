<?php

use Aws\DynamoDb\Exception\DynamoDbException;
use Illuminate\Database\Migrations\Migration;

class CreateAudioAnalysisScTable extends Migration
{
    private $dynamo;
    private $tableName = 'sc_conversations';
    public function __construct()
    {
        $credentials = new Aws\Credentials\Credentials(
            env('AWS_DYNAMO_KEY', 'key'),
            env('AWS_DYNAMO_SECRET', 'secret')
        );
        $sdk = new Aws\Sdk([
            'endpoint' => env('AWS_DYNAMO_ENDPOINT', ''),
            'region' => env('AWS_DYNAMO_REGION', 'us-east-1'),
            'version' => env('AWS_DYNAMO_VERSION', 'latest'),
            'credentials' => $credentials,
        ]);
        $dynamo = $sdk->createDynamoDb();
        $this->dynamo = $dynamo;
    }

    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        $params = [
            'TableName' => $this->tableName,
            'AttributeDefinitions' => [
                ['AttributeName' => 'hash_key', 'AttributeType' => 'S'],
                ['AttributeName' => 'range_key', 'AttributeType' => 'N'],
                ['AttributeName' => 'speaker_label', 'AttributeType' => 'N'],
                ['AttributeName' => 'start_time', 'AttributeType' => 'N'],
            ],
            'KeySchema' => [
                ['AttributeName' => 'hash_key', 'KeyType' => 'HASH'],
                ['AttributeName' => 'range_key', 'KeyType' => 'RANGE'],
            ],
            'LocalSecondaryIndexes' => [
                [
                    'IndexName' => 'SPEAKER_LABEL_LSI',
                    'KeySchema' => [
                        ['AttributeName' => 'hash_key', 'KeyType' => 'HASH'],
                        ['AttributeName' => 'speaker_label', 'KeyType' => 'RANGE']
                    ],
                    'Projection' => ['ProjectionType' => 'ALL'],
                ],
                [
                    'IndexName' => 'START_TIME_LSI',
                    'KeySchema' => [
                        ['AttributeName' => 'hash_key', 'KeyType' => 'HASH'],
                        ['AttributeName' => 'start_time', 'KeyType' => 'RANGE']
                    ],
                    'Projection' => ['ProjectionType' => 'ALL'],
                ],
            ],
            'ProvisionedThroughput' => [
                'ReadCapacityUnits' => 10,
                'WriteCapacityUnits' => 10
            ]
        ];

        try {
            $result = $this->dynamo->createTable($params);
            echo 'Created table.  Status: ' .
                $result['TableDescription']['TableStatus'] ."\n";
        } catch (DynamoDbException $e) {
            echo "Unable to create table:\n";
            echo $e->getMessage() . "\n";
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        try {
            $this->dynamo->deleteTable([
                'TableName' => $this->tableName,
            ]);
            echo "Deleted table: {$this->tableName}";
        } catch (DynamoDbException $e) {
            echo "Unable to create table:\n";
            echo $e->getMessage() . "\n";
        }
    }
}
