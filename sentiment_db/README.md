## 環境構築
###  必要条件
- Docker Composeがインストールされていること

### 環境構築
``sh
sh setup.sh
``

## コンテナ構成
- app
    - DynamoDBへアクセスするためのサーバーアプリケーション
- dynamo
    - DynamoDBのローカル環境
- dynamo-admin
    - DynamoDBのGUI管理ツール
    - ブラウザから`http://localhost:8001`でアクセス可能

## 注意
ローカルで開発するときはKernel.php内apiグループのCheckRefererミドルウェアをコメントアウトして無効にしてください。

## APIの仕様
### 感情データの登録
`POST /api/sc/sentiment/create`
#### リクエストボディ
下記パラメータをJSON形式で指定する

- conversation_id
- speaker_label
- segment
- start_time
- start_date_time
- start_pos_sec
- end_pos_sec
- energy
- stress
- emo_cog
- concentration
- anticipation
- excitement
- hesitation
- uncertainty
- intensive_thinking
- imagination_activity
- embarrassment
- passionate
- brain_power
- confidence
- aggression
- call_priority
- atmosphere
- upset
- content
- dissatisfaction
- extreme_emotion

### 感情データの取得
`GET /api/sc/sentiment/{:conversation_id}/{:speaker_label}`
#### レスポンス
下記のパラメータを持つJSONの配列

- conversation_id
- speaker_label
- segment
- start_time
- start_date_time
- start_pos_sec
- end_pos_sec
- energy
- stress
- emo_cog
- concentration
- anticipation
- excitement
- hesitation
- uncertainty
- intensive_thinking
- imagination_activity
- embarrassment
- passionate
- brain_power
- confidence
- aggression
- call_priority
- atmosphere
- upset
- content
- dissatisfaction
- extreme_emotion
- created_at

### 文字起こしデータの登録
`POST /api/sc/transcription/create`
#### リクエストボディ
下記パラメータをJSON形式で指定する

- conversation_id
- speaker_label
- start_time
- end_time
- text

### 文字起こしデータの取得
`GET /api/sc/transcription/{:conversation_id}/{:speaker_label}`
#### レスポンス
下記のパラメータを持つJSONの配列

- conversation_id
- speaker_label
- start_time
- end_time
- text
- created_at

### 会話の間データの登録
`POST /api/sc/pause/create`
#### リクエストボディ
下記パラメータをJSON形式で指定する

- conversation_id
- speaker_label
- start_time
- duration

### 会話の間データの取得
`GET /api/sc/pause/{:conversation_id}/{:speaker_label}`
#### レスポンス
下記のパラメータを持つJSONの配列

- conversation_id
- speaker_label
- start_time
- duration
- created_at


### 会話の被りデータの登録
`POST /api/sc/barge-in/create`
#### リクエストボディ
下記パラメータをJSON形式で指定する

- conversation_id
- speaker_label
- start_time
- duration

### 会話の被りデータの取得
`GET /api/sc/barge-in/{:conversation_id}/{:speaker_label}`
#### レスポンス
下記のパラメータを持つJSONの配列

- conversation_id
- speaker_label
- start_time
- duration
- created_at
