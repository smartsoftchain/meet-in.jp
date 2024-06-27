-- 生成日時: 2020 年 5 月 07 日 13:58
-- サーバのバージョン: 5.6.47-log
-- PHP のバージョン: 5.6.35

SET SQL_MODE
= "NO_AUTO_VALUE_ON_ZERO";
SET time_zone
= "+00:00";


--
-- データベース: `meetin_db`
--

-- --------------------------------------------------------

--
-- テーブルの構造 `questionnaire_answer`
--

CREATE TABLE
IF NOT EXISTS `questionnaire_answer`
(
  `id` int
(11) NOT NULL AUTO_INCREMENT  COMMENT 'アンケートの回答のid',
  `webinar_id` int
(11) NOT NULL COMMENT 'ウェビナーのid',
  `history_id` int
(11) NOT NULL COMMENT 'アンケート履歴のid',
  `answer_type` tinyint
(4) NOT NULL COMMENT 'アンケート形式[1:選択式、2:記述式]',
  `participant_id` int
(11) NOT NULL COMMENT '回答したウェビナー参加者のid',
  `answer` varchar
(255) COLLATE utf8_unicode_ci NOT NULL  COMMENT '回答内容',
  `create_date` datetime NOT NULL COMMENT '登録日',
  PRIMARY KEY
(`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='アンケートの回答テーブル';
