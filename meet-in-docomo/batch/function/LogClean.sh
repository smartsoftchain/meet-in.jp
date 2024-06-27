#!/bin/bash

#ログテーブルバックアップシェル

# 認証情報　TMOWebの情報によって書き換える
DBUSER="backupuser";
DBPASSWD="Bz2xC9P6";
#DB="tel-marketing_tmo";
DB="tmo";

# バックアップ先ディレクトリ /home/mnguser/backup_log/
BAKDIR="/home/mnguser/backup_log";
#Day=`date +%Y%m%d`
TODAY=`date '+%Y%m%d-%H%M%S'`;
Filename=$BAKDIR/$TODAY\_logs;

# バックアップ先がなければ作成
#[ ! -d $TODAYS_BAKDIR ] && mkdir -p $TODAYS_BAKDIR;
#[ ! -d $BAKDIR ] && mkdir -p $BAKDIR;

# DB名でダンプ取得 生成時すべてのテーブルをロックする⇒ロックしない
mysqldump -u$DBUSER -p$DBPASSWD -t $DB logs > $Filename.sql
