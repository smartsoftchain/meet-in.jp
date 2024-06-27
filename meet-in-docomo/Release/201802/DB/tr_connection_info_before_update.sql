DROP TRIGGER IF EXISTS tr_connection_info_before_update;

DELIMITER $$

-- ルームテーブルUPDATE前
-- トリガをUPDATE前(BEFORE)にしないと、MySQLの制約で更新中のレコードに対してのトリガでは自身のテーブル変更が行えないため
-- これはMySQL特有で通常(SQLORACLE/SQLServer/PostgreSQL)だと問題なく行える
-- よって、トリガを更新前処理にしSET文で更新(NEW.xxx)の値を入れ替える方式にする
CREATE TRIGGER tr_connection_info_before_update
     BEFORE UPDATE ON connection_info FOR EACH ROW
     BEGIN
         -- 変更前のuser_peer_id_xがNULLまたは'X'(予約)で、更新後のuser_peer_id_xが1桁以上の場合、アクセス回数（room_access_cnt）をUP（+1）する
         -- アクセス回数…そのルームがアクセスされた回数（4人なら4回）のため、user_peer_id_1～4までチェックしカウントUPする
         -- 注意:peer_idを更新する場合も存在するため、更新前の判定を入れている
         IF (OLD.user_peer_id_1 IS NULL OR OLD.user_peer_id_1='X') AND CHAR_LENGTH(IFNULL(NEW.user_peer_id_1,'')) > 1 THEN
			SET NEW.room_access_cnt = OLD.room_access_cnt+1;
         END IF;
         IF (OLD.user_peer_id_2 IS NULL OR OLD.user_peer_id_2='X') AND CHAR_LENGTH(IFNULL(NEW.user_peer_id_2,'')) > 1 THEN
			SET NEW.room_access_cnt = OLD.room_access_cnt+1;
         END IF;
         IF (OLD.user_peer_id_3 IS NULL OR OLD.user_peer_id_3='X') AND CHAR_LENGTH(IFNULL(NEW.user_peer_id_3,'')) > 1 THEN
			SET NEW.room_access_cnt = OLD.room_access_cnt+1;
         END IF;
         IF (OLD.user_peer_id_4 IS NULL OR OLD.user_peer_id_4='X') AND CHAR_LENGTH(IFNULL(NEW.user_peer_id_4,'')) > 1 THEN
			SET NEW.room_access_cnt = OLD.room_access_cnt+1;
         END IF;

         -- 変更前のuser_peer_id_x(1～4のうち)が1桁以上で、更新後のuser_peer_id_xが全てNULL場合、利用回数（room_enter_cnt）をUP（+1）する
         -- 利用回数…ルームに接続があり、全員が接続を切るまでの回数（4人で接続し全員が接続解除したら1回）
         IF (CHAR_LENGTH(IFNULL(OLD.user_peer_id_1,'')) > 0 OR CHAR_LENGTH(IFNULL(OLD.user_peer_id_2,'')) > 0
          OR CHAR_LENGTH(IFNULL(OLD.user_peer_id_3,'')) > 0 OR CHAR_LENGTH(IFNULL(OLD.user_peer_id_4,'')) > 0 )
          AND NEW.user_peer_id_1 IS NULL AND NEW.user_peer_id_2 IS NULL AND NEW.user_peer_id_3 IS NULL AND NEW.user_peer_id_4 IS NULL
         THEN
			SET NEW.room_enter_cnt = OLD.room_enter_cnt+1;
         END IF;

         IF (CHAR_LENGTH(IFNULL(OLD.user_peer_id_1,'')) > 0 OR CHAR_LENGTH(IFNULL(OLD.user_peer_id_2,'')) > 0
          OR CHAR_LENGTH(IFNULL(OLD.user_peer_id_3,'')) > 0 OR CHAR_LENGTH(IFNULL(OLD.user_peer_id_4,'')) > 0 )
          AND NEW.user_peer_id_1 IS NULL AND NEW.user_peer_id_2 IS NULL AND NEW.user_peer_id_3 IS NULL AND NEW.user_peer_id_4 IS NULL
         THEN
			DELETE FROM chat_detail WHERE connection_info_id = NEW.id;
         END IF;
     END;
$$

DELIMITER ;
