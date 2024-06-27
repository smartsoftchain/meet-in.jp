DROP TRIGGER IF EXISTS tr_connection_info_before_update;

DELIMITER $$

-- ���[���e�[�u��UPDATE�O
-- �g���K��UPDATE�O(BEFORE)�ɂ��Ȃ��ƁAMySQL�̐���ōX�V���̃��R�[�h�ɑ΂��Ẵg���K�ł͎��g�̃e�[�u���ύX���s���Ȃ�����
-- �����MySQL���L�Œʏ�(SQLORACLE/SQLServer/PostgreSQL)���Ɩ��Ȃ��s����
-- ����āA�g���K���X�V�O�����ɂ�SET���ōX�V(NEW.xxx)�̒l�����ւ�������ɂ���
CREATE TRIGGER tr_connection_info_before_update
     BEFORE UPDATE ON connection_info FOR EACH ROW
     BEGIN
         -- �ύX�O��user_peer_id_x��NULL�܂���'X'(�\��)�ŁA�X�V���user_peer_id_x��1���ȏ�̏ꍇ�A�A�N�Z�X�񐔁iroom_access_cnt�j��UP�i+1�j����
         -- �A�N�Z�X�񐔁c���̃��[�����A�N�Z�X���ꂽ�񐔁i4�l�Ȃ�4��j�̂��߁Auser_peer_id_1�`4�܂Ń`�F�b�N���J�E���gUP����
         -- ����:peer_id���X�V����ꍇ�����݂��邽�߁A�X�V�O�̔�������Ă���
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

         -- �ύX�O��user_peer_id_x(1�`4�̂���)��1���ȏ�ŁA�X�V���user_peer_id_x���S��NULL�ꍇ�A���p�񐔁iroom_enter_cnt�j��UP�i+1�j����
         -- ���p�񐔁c���[���ɐڑ�������A�S�����ڑ���؂�܂ł̉񐔁i4�l�Őڑ����S�����ڑ�����������1��j
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
