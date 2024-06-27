ALTER TABLE `meetin_db`.`mcu_room_info` 
ADD COLUMN `connect_datetime` DATETIME NOT NULL DEFAULT current_timestamp on update current_timestamp AFTER `room_name`;
