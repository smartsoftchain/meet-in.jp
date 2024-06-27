-- 生成日時: 2020 年 5 月 07 日 11:12
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
-- テーブルの構造 `questionnaire`
--

CREATE TABLE
IF NOT EXISTS `questionnaire`
(
  `id` int
(11) NOT NULL AUTO_INCREMENT COMMENT 'アンケートのID',
  `group_id` int
(11) NOT NULL COMMENT 'アンケートグループのID',
  `staff_type` char
(2) COLLATE utf8_unicode_ci NOT NULL COMMENT '作成した担当者種別',
  `staff_id` int
(11) NOT NULL COMMENT '作成した担当者ID',
  `title` varchar
(255) COLLATE utf8_unicode_ci NOT NULL COMMENT 'アンケート名（質問概要）',
  `question` varchar
(255) COLLATE utf8_unicode_ci NOT NULL COMMENT 'アンケートの質問内容（質問詳細）',
  `answer_type` tinyint
(4) NOT NULL COMMENT 'アンケート形式[1:複数選択、2:2択、3:記述]',
  `description_type` tinyint
(4)  DEFAULT NULL COMMENT '記述形式[1:単数行、2:複数行]',
  `del_flg` tinyint
(4) NOT NULL COMMENT '削除フラグ[0:未、1:済]',
  `create_date` datetime NOT NULL COMMENT '登録日',
  PRIMARY KEY
(`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci  COMMENT='アンケートの内容';