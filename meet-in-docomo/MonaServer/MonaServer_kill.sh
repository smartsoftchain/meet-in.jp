#! /bin/bash

# 監視するプロセス名を定義する
PROCESS_NAME=MonaServer

wait=3  # engineの起動待ち時間

# 監視するプロセスが何個起動しているかカウントする
count=`ps -ef | grep $PROCESS_NAME | grep -v grep | wc -l`

####################
# MonaServer再起動 #
####################
# 監視するプロセスが0個場合に、処理を分岐する
if [ $count = 0 ]; then
	echo "$PROCESS_NAME Down"
	echo "$PROCESS_NAME Start"

	# 0個場合は、サービスが停止しているので起動する
	cd /var/www/html/MonaServer/MonaServer/MonaServer/
	./MonaServer --daemon
else
	echo "$PROCESS_NAME is alive."
	echo "$PROCESS_NAME Stop"

	# MonaServer強制停止 #
#	ps aux | grep MonaServer | grep -v grep | awk '{ print "kill -9", $2 }' | bash
#	ps aux | grep MonaServer | grep -v grep | awk '{ print "kill -9", $2 }'
	pidSev=(`ps -ef | grep "MonaServer" | grep -v grep | awk '{ print $2; }'`)
	kill -9 $pidSev

	echo "$PROCESS_NAME Start"
	cd /var/www/html/MonaServer/MonaServer/MonaServer/
	./MonaServer --daemon
fi

