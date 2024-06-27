ALTER TABLE connection_info
ADD COLUMN room_mode_flg1 TINYINT( 4 ) DEFAULT 0 COMMENT 'モニタリングFLG(0:OFF/1:ON)' AFTER login_flg1,
ADD COLUMN room_mode_flg2 TINYINT( 4 ) DEFAULT 0 COMMENT 'モニタリングFLG(0:OFF/1:ON)' AFTER login_flg2,
ADD COLUMN room_mode_flg3 TINYINT( 4 ) DEFAULT 0 COMMENT 'モニタリングFLG(0:OFF/1:ON)' AFTER login_flg3,
ADD COLUMN room_mode_flg4 TINYINT( 4 ) DEFAULT 0 COMMENT 'モニタリングFLG(0:OFF/1:ON)' AFTER login_flg4,
ADD COLUMN room_mode_flg5 TINYINT( 4 ) DEFAULT 0 COMMENT 'モニタリングFLG(0:OFF/1:ON)' AFTER login_flg5,
ADD COLUMN room_mode_flg6 TINYINT( 4 ) DEFAULT 0 COMMENT 'モニタリングFLG(0:OFF/1:ON)' AFTER login_flg6,
ADD COLUMN room_mode_flg7 TINYINT( 4 ) DEFAULT 0 COMMENT 'モニタリングFLG(0:OFF/1:ON)' AFTER login_flg7,
ADD COLUMN room_mode_flg8 TINYINT( 4 ) DEFAULT 0 COMMENT 'モニタリングFLG(0:OFF/1:ON)' AFTER login_flg8;
