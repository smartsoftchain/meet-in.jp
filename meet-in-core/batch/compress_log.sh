#!/bin/bash

function compress(){
  # 対象ディレクトリ
  TARGET_DIR="/mnt/datastore/tmp/logs"
  echo "${TARGET_DIR}を圧縮します"

  # 処理対象のデフォルト：前日
  # THIS_DAY=`date +'%Y%m%d' --date '1 day ago'`
  # 処理対象のデフォルト：当日
  TARGET_DAY=`date +'%Y%m%d'`

  # 圧縮ファイル格納ディレクトリ
  COMPRESS_DIR=${TARGET_DIR}/backup
  mkdir -p $COMPRESS_DIR

  # 対象日の圧縮ファイル
  COMPRESS_FORMAT="dailylog_${TARGET_DAY}.tar.gz"

  # バックアップ用ディレクトリ
  BACKUP_DIR=${TARGET_DAY}

  if [ $# != 0 ]; then
    # 第1引数ありの場合、対象日を上書き
    if [[ !($1 =~ [0-9]{8}) ]]; then
      echo "第1引数の形式は、yyyymmddです"
      exit
    fi
    export TARGET_DAY=$1
  fi

  # 対象日の圧縮ファイルが存在する場合は処理を終了
  if ls $COMPRESS_DIR/$COMPRESS_FORMAT > /dev/null 2>&1
  then
    echo "処理済です"
    compress_error
    exit
  fi

  cd ${TARGET_DIR}
  # 過去Backupファイル削除
  if [ $# = 0 ]; then
    # 第1引数指定のない場合（通常の日毎の処理）にbackup配下を削除
    echo "${BACKUP_DIR}ディレクトリ配下のファイルを削除します"
    rm -frv $BACKUP_DIR/*
    echo "${BACKUP_DIR}ディレクトリ配下のファイル削除が完了しました"
  fi

  # ログファイルの圧縮
  FILES="web.log*"
  RMFILES="web.log.*"
  if ls $FILES > /dev/null 2>&1
  then
    echo "${TARGET_DAY:0:4}年${TARGET_DAY:4:2}月${TARGET_DAY:6:2}日分の日次ログファイルを圧縮します"
    mkdir -p $BACKUP_DIR
    # ログファイル移動
    cp -pf $FILES $BACKUP_DIR/
    # 圧縮
    tar cvzf $COMPRESS_DIR/$COMPRESS_FORMAT $BACKUP_DIR
    if [ -e $COMPRESS_DIR/$COMPRESS_FORMAT ]; then
       rm -rf $BACKUP_DIR
       rm -f $RMFILES
       # 過去の圧縮ファイル削除
       find ${COMPRESS_DIR} -type f -name "*.tar.gz" -mtime +2 | xargs rm -f
    fi
    echo "${TARGET_DAY:0:4}年${TARGET_DAY:4:2}月${TARGET_DAY:6:2}日分の日次ログファイルの圧縮が完了しました"
  else
    echo "${TARGET_DAY:0:4}年${TARGET_DAY:4:2}月${TARGET_DAY:6:2}日分の日次ログファイルは存在しません"
  fi
}

function compress_error() {
  # エラー処理
  HOSTNAME=$(hostname)
  echo "日次ログファイル圧縮処理に失敗しました"
}

echo "======= 処理開始=======" && (compress $1 || compress_error) && echo "======= 処理終了======"
