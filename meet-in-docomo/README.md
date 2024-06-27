# 開発の環境
meet inのアイドマで開発をすすめる用のすすめる用のプロジェクトを作成致しました。


## URL
[開発](https://192.168.33.12/)
[STG](https://stagedx.aidma-hd.jp/)
[本番](https://docomodx.aidma-hd.jp/)


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
  - [meet-in-docomo](https://bitbucket.org/aidmasystem/meet-in-docomo/src/master/)
  - [meet-in_dev_env](https://bitbucket.org/aidmasystem/meet-in_dev_env/src/master/)
2. meet-in_dev_envに移動しに移動し、Vagrantfile ファイル の synced_folder 値の meet-in-core を meet-in-docomo に 変更
```
+   config.vm.synced_folder "../meet-in-docomo", "/home/vagrant/html", type: "nfs"
```
3. meet-in_dev_envに移動し、vagrantコマンドで環境を構築する
  `vagrant up`
4. 立ち上げが完了するとhttps://192.168.33.12/にアクセスができるようになる
  * DBはstageを見ているので、アイドマ社内、または許可されたIPアドレス以外だとDBエラーになります。管理者に問い合わせて許可をもらってください。
5. 開発が終了時は`vagrabt halt`でシャットダウンをする


# デプロイ手順
```
sudo su -
# DBマイグレーション作業があれば実施後に作業.
ch /var/www/git/meet-in-docomo && git pull
sh /var/www/git/deploy_meet-in-docomo.sh
```

## SSH接続
```
# 本番
sudo ssh -i dcm-mti-p-001.pem centos@54.238.119.33

# 開発
sudo ssh -i dcm-mti-p-001.pem centos@18.180.210.255


# dcm-mti-p-001.pem
-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEAsJkg8e0t7Iol4Rdsi+1Mu8qNxmCBQuXdV/lJac21OBs/DaKK
oWO8fV/iqxqDYC0Kbi+coKFI25FKQGt3Mz4njOPxiT9c5+tDzH/DSa73V43u9XdB
1v09/J7prao7fvtaW183tU6xfkCdMOOTWD7f/+lTjTSE9+xmcjoa1FO0AotKZQU+
qFPUDlLZ+vFWmKLBi6hC2ka7cdEnae1rpLfPuEJbYND1CJ7PVqmGcgWr56NOVnEd
XHBNvZBAw+MiVQode+T969ak0lw3sHLCIvlqOqgmCiaDemsLcoArQNTHgrTJHnGq
r3O9tSKHiuTsrVsR6OR1+iX67iyVzoSR50K1WQIDAQABAoIBAGbEldFzjrgKJMT6
lqZPL8pQs3RwEIjXr5lUbo5tsTm3UVgj8Ly+h6AGPqgHw9AiJeG9P06SzQ1JXYZj
g3iEgQuSUqrl/rDPziKhbwngEfwXkqmx/tSXho0OBTqUyA67QvfNT2PpKY0pGNCs
fsBpxnzsUTzpBUAph+yNN7O8ChM39zYRoYc5dOPitrd9qmPvHBetChjN2J6XT3qo
12faHGEJaRdojO6yRaB6Vi/aex3I7Mwx+ElaHdTWw7yL7NuN0Y5tCQyIJktAGoxD
Tl9f9MJyMNDhG8cV/MFvYbyyiFx258a9hjc4r+yqhdhlSq3lp0/nxoZLP5XlwC5Y
4XWJkQECgYEA6gA35eL26GP+N04Jr1HfkFU6IsnEt/xMLcoXx0TvuUsE9OcVRjf1
aRVTw0NLLkoKg+F/FoDV/Fza6KSSGLZa2a1aw7efvCevEp6lhW83jdOtGsKKVRxD
VbWFsHq/gcSpWa0P1Ys/O8xQ4cwfl0b/FbKuLKdsMDL+qApJj2gAO4kCgYEAwTNh
GrA2S9iRmBF+zjYecPnLq/QMIhChrVgW7VWAV92UwWWm3zeOQ/aBM3el8awfUXNN
a6SxL57+/VIa90jvX/h9J64y46ZZ0U8WZhK/95XGCLHowKUAA3IQ/64XR3DNc2fX
e3U378GuqJyp8/QmtPtnT7aDyMNwsL/jGseuJ1ECgYAt6rUNSyggGd78gzerS2mP
LOongWg0ojFgmtNnqsNPnMTwOZgXG0vwvtqc6kuKXcUKc+k4RTe4OZBLLl/ssXvK
UxYIabPSfAcCpFbehCBmmC7TnXD/mngsDV6abru9fxWsHyWIRba2yTTl2eQpDylm
3JUI9iFoo9kMqFge582D4QKBgAG0NE0J9NCiblZLATVMYORaL6OqmVjLkMF4n2sk
b+dWevNhtCEP2l9bEzSi/4GsJPKQ88PZRf7HhjQxvy8jI4lTJbdt3+EGHJCuA+KO
k8bZOU/mUckxK1jcbq3ymR32Lrmv1sSt+fpRWPr/trgCFT1PYk/fqjXhE2NbreMU
k8KhAoGBAKxM0A222DHxaJPe/k9h9nDrX5uCoqoqOAqhwcPeMuipBnEIu8qsHupT
cntDx0762f2Ij4m4xeBWZcjg7zqoFDpJuxrkhlUvVaRmlOPhxuPX37ysrrRPCbI3
cupHp3uPB/AhrWlmBFFdmDAAsVHDDi5AQDC/HqWpAJJISGE1i6XR
-----END RSA PRIVATE KEY-----

```
