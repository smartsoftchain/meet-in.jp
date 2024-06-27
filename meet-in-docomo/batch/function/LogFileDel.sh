#!/bin/sh

#日付取得
TODAY=`date +%Y%m%d-%k%M%S`;

#バックアップディレクトリ
BAKDIR="/home/mnguser/backup_log/";

#ファイル削除(最終変更時刻）
find $BAKDIR -type f -mtime +32 -print0 | xargs -0 rm -f
