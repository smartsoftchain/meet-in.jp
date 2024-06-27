-- 生成日時: 2020 年 5 月 07 日 10:40
-- サーバのバージョン: 5.6.47-log
-- PHP のバージョン: 5.6.35

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


--
-- データベース: `meetin_db`
--

-- --------------------------------------------------------

--
-- テーブルの構造 `questionnaire_group`
--

CREATE TABLE IF NOT EXISTS `questionnaire_group` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'アンケートグループのID',
  `client_id` char(2) COLLATE utf8_unicode_ci NOT NULL COMMENT 'クライアントID',
  `staff_type` char(2) COLLATE utf8_unicode_ci NOT NULL COMMENT '作成した担当者種別',
  `staff_id` int(11) NOT NULL COMMENT '作成した担当者ID',
  `title` varchar(255) COLLATE utf8_unicode_ci NOT NULL COMMENT 'アンケートグループのタイトル',
  `del_flg` tinyint(4) NOT NULL COMMENT '削除フラグ[0:未、1:済]',
  `create_date` datetime NOT NULL COMMENT '登録日',
  `update_date` datetime NOT NULL COMMENT '更新日',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='アンケート集のテーブル';

