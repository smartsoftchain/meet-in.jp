#!/bin/bash

#���O�e�[�u���o�b�N�A�b�v�V�F��

# �F�؏��@TMOWeb�̏��ɂ���ď���������
DBUSER="backupuser";
DBPASSWD="Bz2xC9P6";
#DB="tel-marketing_tmo";
DB="tmo";

# �o�b�N�A�b�v��f�B���N�g�� /home/mnguser/backup_log/
BAKDIR="/home/mnguser/backup_log";
#Day=`date +%Y%m%d`
TODAY=`date '+%Y%m%d-%H%M%S'`;
Filename=$BAKDIR/$TODAY\_logs;

# �o�b�N�A�b�v�悪�Ȃ���΍쐬
#[ ! -d $TODAYS_BAKDIR ] && mkdir -p $TODAYS_BAKDIR;
#[ ! -d $BAKDIR ] && mkdir -p $BAKDIR;

# DB���Ń_���v�擾 ���������ׂẴe�[�u�������b�N����˃��b�N���Ȃ�
mysqldump -u$DBUSER -p$DBPASSWD -t $DB logs > $Filename.sql
