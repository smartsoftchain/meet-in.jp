# 開発の環境
meet inのアイドマで開発をすすめる用のすすめる用のプロジェクトを作成致しました。

## 構成
```
・
├── meet-in_dev_env ・・・開発環境用のファイルのリポジトリ
│   ├── mysql
│   ├── php
│   ├── proxy
│   ├── webphone_ws
│   ├── websocket-server
│   ├── websocket
│   ├── Vagrantfile
│   ├── composer.phar
│   ├── docker-compose.yml
│   ├── docker.service
│   ├── docker.socket
│   └── .gitignore
└── meet-in-core    ・・・アプリーケーションファイルのリポジトリ
    ├── MonaServer
    ├── Release
    ├── application
    ├── batch
    ├── flash
    ├── flashDevelop
    ├── library
    ├── public
    ├── websocket-server
    ├── websocket
    └── .gitignore
```

## 準備
- Docker
- Vagrant
- VirtualBox

## 環境構築手順
1. ワークスペースを作成して以下のリポジトリをクローンする
  - [meet-in-core](https://bitbucket.org/aidmasystem/meet-in-core/src/master/)
  - [meet-in_dev_env](https://bitbucket.org/aidmasystem/meet-in_dev_env/src/master/)
2. meet-in-coreに移動しに移動し、一応システムセンスのgitリポジトリも登録しておく
  `git remote add sense https://systemsens.backlog.jp/git/MEETIN/delphinus.git`
3. meet-in_dev_envに移動し、vagrantコマンドで環境を構築する
  `vagrant up`
4. 立ち上げが完了するとhttps://192.168.33.12/にアクセスができるようになる
  * DBはstageを見ているので、アイドマ社内、または許可されたIPアドレス以外だとDBエラーになります。管理者に問い合わせて許可をもらってください。
5. 開発が終了時は`vagrabt halt`でシャットダウンをする

# デプロイ手順
gitで差分を取り込みFTPでstage,prodにアップしていく想定。

## システムセンスgitの変更内容を取り込む場合
```
$ git checkout master
$ git merge sense/master
$ git push
```

## アイドマgitの変更内容をセンスgit取り込む場合
*作業後はシステムセンスさんへの情報共有をする
```
$ git checkout sense/master
$ git merge origin/master
$ git push
```
