-- 生成日時: 2020 年 5 月 07 日 14:46
-- サーバのバージョン: 5.6.47-log
-- PHP のバージョン: 5.6.35

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

--
-- データベース: `meetin_db`
--

-- --------------------------------------------------------

--
-- テーブルの構造 `questionnaire_history`
--

CREATE TABLE IF NOT EXISTS `questionnaire_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'アンケート実施履歴のID',
  `webinar_id` int(11) NOT NULL COMMENT 'アンケート実施したウェビナーのID',
  `questionnaire_id` int(11) NOT NULL COMMENT 'アンケート内容のID',
  `create_date` datetime NOT NULL COMMENT '登録日',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='アンケートの実施履歴';