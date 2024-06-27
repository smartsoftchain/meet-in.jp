<?php

/**
 * BusinessCategoryDao クラス
 *
 * ジャンル・業種を扱うDaoクラス
 *
 * @version 2015/08/12 15:41 ochi
 * @package Dao
 */
class BusinessCategoryDao extends AbstractDao {

	private $db;
	function __construct($db){
		$this->db = $db;
	}

	/**
	 * 全カテゴリー1を取得する
	 * @return unknown
	 */
	Public function getBusinessCategory1() {
		$selector = $this->db->select()->from("business_category1")
		->order("id");
		$list = $this->db->fetchAll($selector);
		return $list;
	}

	/**
	 * idを指定しカテゴリー1を取得する
	 * @param unknown $id
	 * @return unknown
	 */
	Public function getBusinessCategory1ById($id) {
		$selector = $this->db->select()->from("business_category1")
		->where("id = {$id}")
		->order("id");
		$row = $this->db->fetchRow($selector);
		return $row;
	}

	/**
	 * business_category1を指定しカテゴリー2を取得する
	 * @param unknown $category1Id
	 * @return unknown
	 */
	Public function getBusinessCategory2ByCategory1($category1Id) {
		$selector = $this->db->select()->from("business_category2")
		->where("business_category1_id = {$category1Id}")
		->order("id");
		$list = $this->db->fetchAll($selector);
		return $list;
	}

	/**
	 * カテゴリー1のIDとカテゴリー2のIDを指定しカテゴリー2を取得する
	 * @param unknown $category1Id
	 * @param unknown $category2Id
	 * @return unknown
	 */
	Public function getBusinessCategory2ByCategory1IdAndCategoryId2($category1Id, $category2Id) {
		$selector = $this->db->select()->from("business_category2")
		->where("business_category1_id = {$category1Id}")
		->where("id = {$category2Id}")
		->order("id");
		$row = $this->db->fetchRow($selector);
		return $row;
	}

	/**
	 * カテゴリー1のIDとカテゴリー2のIDを指定しカテゴリー3を取得する
	 * @param unknown $category1Id
	 * @param unknown $category2Id
	 * @return unknown
	 */
	Public function getBusinessCategory3ByCategory1AndCategory2($category1Id, $category2Id) {
		$selector = $this->db->select()->from("business_category3")
		->where("business_category1_id = {$category1Id}")
		->where("business_category2_id = {$category2Id}")
		->order("id");
		$list = $this->db->fetchAll($selector);
		return $list;
	}

	/**
	 * カテゴリー1のIDとカテゴリー2とカテゴリー3のIDを指定しカテゴリー3を取得する
	 * @param unknown $category1Id
	 * @param unknown $category2Id
	 * @param unknown $category2Id
	 * @return unknown
	 */
	Public function getBusinessCategory3ByCategory1AndCategory2AndCategory3($category1Id, $category2Id, $category3Id) {
		$selector = $this->db->select()->from("business_category3")
		->where("business_category1_id = {$category1Id}")
		->where("business_category2_id = {$category2Id}")
		->where("id = {$category3Id}");
		$row = $this->db->fetchRow($selector);
		return $row;
	}

	/**
	 * idを複数指定しカテゴリー1を取得する
	 * @param unknown $ids
	 * @return unknown
	 */
	public function getBusinessCategories1ByIds($ids) {

		$selector = $this->db->select()->from("business_category1")
										->where("id IN ({$ids})")
										->order("id");

		$list = $this->db->fetchAll($selector);

		return $list;
	}

	/**
	 * カテゴリ１とidを複数指定しカテゴリー２を取得する
	 * @param unknown $category1Ids
	 * @param unknown $ids
	 * @return unknown
	 */
	public function getBusinessCategories2ByCategories1AndIds($category1Id, $ids) {

		$selector = $this->db->select()->from("business_category2")
										->where("business_category1_id = {$category1Id}")
										->where("id IN ({$ids})")
										->order("id");

		$list = $this->db->fetchAll($selector);

		return $list;
	}

	/**
	 * カテゴリ２とidを複数指定しカテゴリー３を取得する
	 * @param unknown $category1Ids
	 * @param unknown $category2Ids
	 * @param unknown $ids
	 * @return unknown
	 */
	public function getBusinessCategories3ByCategories1AndCategories2AndIds($category1Id, $category2Id, $ids) {

		$selector = $this->db->select()->from("business_category3")
										->where("business_category1_id = {$category1Id}")
										->where("business_category2_id = {$category2Id}")
										->where("id IN ({$ids})")
										->order("id");

		$list = $this->db->fetchAll($selector);

		return $list;
	}
}

?>
