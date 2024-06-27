<?php
/**
* 一覧のページングやソートを司る
* @author takeda
*
*/
class Application_Pager{

	var $list;
	var $perpage = 100;
	var $perpagename = "pagesize";
	var $curpage = 1;
	var $pagename = "page";
	var $listcount;

	var $order = "";
	var $ordertype = "asc";
	var $ordername = "order";
	var $ordertypename = "ordertype";
	/**
	 * コンストラクタ
	 * @param unknown_type $params
	 * $paramには必ず一覧データをセットする。それ以外は任意
	 * ソートのリンクを出す場合は必ずorderをセットする。それ以外は任意
	 */
	public function __construct($params){
		$this->list = $params["itemData"];

		if(array_key_exists("itemCount", $params)){ //アイテムの個数
			$this->listcount = $params["itemCount"];
		}else{
			$this->listcount = count($params["itemData"]);
		}
		if(isset($params["perPage"])){
			$this->perpage = $params["perPage"];
		}
		if(isset($params["perPageName"])){
			$this->perpagename = $params["perPageName"];
		}
		if(isset($params["curPage"])){
			$this->curpage = $params["curPage"];
		}
		if(isset($params["pageName"])){
			$this->pagename = $params["pageName"];
		}
		$this->order = $params["order"];
		if(isset($params["orderType"])){
			$this->ordertype = $params["orderType"]; //descをOpalationLogModelで定義
		}
		if(isset($params["orderName"])){
			$this->ordername = $params["orderName"];
		}
		if(isset($params["orderTypeName"])){
			$this->ordertypename = $params["orderTypeName"];
		}

	}

	/**
	* ページングのリンクを出力
	*/
	public function getLink(){
		if($this->listcount==0){
			return;
		}
		$rowcount = $this->listcount;
		if(($this->curpage-1)*$this->perpage > $rowcount){
			$this->curpage = 1;
		}
		// 総ページ数の算出
		//$pagecount = ($rowcount / $this->perpage) + 1;
		if(($rowcount % $this->perpage) >= 1){
			// 余りが存在すれば、+1ページ
			$pagecount = floor($rowcount / $this->perpage) + 1;
		}else{
			// 余りが存在しなければ、割った数のみ
			$pagecount = floor($rowcount / $this->perpage);
		}
		if($pagecount < 2){
			return "";
		}

		$url = parse_url($_SERVER['REQUEST_URI']);
		// URLを書き換える
		$url['path'] = $this->rewriteUrl($url['path']);
		
		// 表示する最大リンク数（curpageを起点に左右に2つで5）
		$viewPageMax = 5;
		$startidx = 1;
		$endidx = $pagecount;
		if($pagecount > $viewPageMax){
			// curpageを現在地とし、2つ前を開始値、2つ後を終了値とする
			$startidx = $this->curpage-2;
			$endidx = $this->curpage+2;
			if($startidx < 1){
				$startidx = 1;
				$endidx = 5;
				if($endidx > $pagecount){
					$endidx = $pagecount;
				}
			}
			if($endidx > $pagecount){
				$startidx = $pagecount - 4;
				$endidx = $pagecount;
				if($startidx < 1){
					$startidx = 1;
				}
			}
		}
		$previousidx = $this->curpage-1;
		$nextidx = $this->curpage+1;

		$linkstr = "<div class='mi_page_select'>";
		if($this->curpage != 1){
			$linkstr .= "<a href='{$url['path']}?{$this->pagename}={$previousidx}' class='icon-menu-05 mi_page_arrow_icon'></a>";
		}else{
			$linkstr .= "<a href='javascript:void(0);' class='icon-menu-05 mi_page_arrow_icon'></a>";
		}
		
		for($idx=$startidx; $idx<=$endidx; $idx++){
			if($idx == $this->curpage){
				$linkstr .= "<a href='' class='mi_page_number active'>{$idx}</a>";
			}
			else{
				$linkstr .= "<a href='{$url['path']}?{$this->pagename}={$idx}' class='mi_page_number'>{$idx}</a>";
			}
		}
		if($this->curpage != floor($pagecount)){
			$linkstr .= "<a href='{$url['path']}?{$this->pagename}={$nextidx}' class='icon-menu-06 mi_page_arrow_icon'></a>";
		}else{
			$linkstr .= "<a href='javascript:void(0);' class='icon-menu-06 mi_page_arrow_icon'></a>";
		}
		$linkstr .= "</div>";
		return $linkstr;
	}


	/**
	 * パラメータ持ちの画面でのページングのリンクを出力
	 * @params $params array パラメーターarray
	 * @return string
	 */
	public function getLinkParam($params){
		$replaceStr = "";
		$linkstr=$this->getLink();

		if(empty($params) || !is_array($params)){// パラメーターがないならそのまま
			return $linkstr;
		}
		foreach($params as $key => $param){
			$replaceStr .= $key . "=" . $param ."&";
		};
		return str_replace("?","?".$replaceStr,$linkstr);
	}

// 	public function getLink2($rowcount){
// 		if($rowcount == null || $rowcount==0){
// 			return;
// 		}

// 		if(($this->curpage-1)*$this->perpage > $rowcount){
// 			$this->curpage = 1;
// 		}

// 		$pagecount = ($rowcount / $this->perpage) + 1;
// 		if($pagecount < 2){
// 			return "";
// 		}

// 		$url = parse_url($_SERVER['REQUEST_URI']);

// 		$startidx = $this->curpage-2;
// 		$endidx = $this->curpage+2;
// 		if($startidx < 1){
// 			$startidx = 1;
// 			$endidx = 5;
// 		}
// 		if($endidx > $pagecount){
// 			$endidx = $pagecount;
// 		}
// 		$previousidx = $this->curpage-1;
// 		$nextidx = $this->curpage+1;

// 		$linkstr = "";

// 		if($this->curpage != 1){
// 			$linkstr .= "<a href='{$url['path']}?{$this->pagename}={$previousidx}'>&lt;&lt Previous</a>　";
// 		}
// 		for($idx=$startidx; $idx<=$endidx; $idx++){
// 			if($idx == $this->curpage){
// 				$linkstr .= "{$idx}　";
// 			}
// 			else{
// 				$linkstr .= "<a href='{$url['path']}?{$this->pagename}={$idx}'>{$idx}</a>　";
// 			}
// 		}
// 		if($this->curpage != floor($pagecount)){
// 			$linkstr .= "<a href='{$url['path']}?{$this->pagename}={$nextidx}'>&gt;&gt Next</a>　";
// 		}

// 		return $linkstr;
// 	}

	/**
	* 画面表示するデータを全リストよりスライスして返す
	*/
	public function getList(){
		foreach($this->list as $key => $value){
			$sort_keys[$key] = $value['create_date'];
		};
			return $this->list;
	}
	public function getList2(){
		return  array_slice($this->list, ($this->curpage-1) * $this->perpage, $this->perpage);
	}
	
	/**
	* ソートの矢印を出力する
	* @param unknown_type $order 出力するカラム名
	*/
	public function getOrderArrow($name, $order){
		$url = parse_url($_SERVER['REQUEST_URI']);
		
		// URLを書き換える
		$url['path'] = $this->rewriteUrl($url['path']);
		$linkstr = "<div><p>{$name}</p><p><a href='{$url['path']}?{$this->ordername}={$order}&{$this->ordertypename}=asc'><span class='ascending'></span></a><a href='{$url['path']}?{$this->ordername}={$order}&{$this->ordertypename}=desc'><span class='descending'></span></a></p></div>";
		return $linkstr;
	}

	/**
	* ソートの矢印を出力する
	* @param unknown_type $order 出力するカラム名
	*/
	public function getOrderArrowClient($name, $order){
		$url = parse_url($_SERVER['REQUEST_URI']);
		
		// URLを書き換える
		$url['path'] = $this->rewriteUrl($url['path']);
		$linkstr = <<<EOF
		<div style="display: flex;height: 40px;justify-content: center;flex-wrap: wrap;">
			<div style="line-height:40px;"><p>{$name}</p></div>
			<div>
				<div class='ascending-class {$order}-asc'><a href='{$url['path']}?{$this->ordername}={$order}&{$this->ordertypename}=asc'><span class='ascending'></span></a></div>
				<div class='descending-class {$order}-desc'><a href='{$url['path']}?{$this->ordername}={$order}&{$this->ordertypename}=desc'><span class='descending'></span></a></div>
			</div>
		</div>
EOF;
		return $linkstr;
	}
	
	/**
	 * パラメータ持ちの画面での「ートの矢印」を出す
	 * @param $name
	 * @param $order
	 * @param $params
	 * @return string
	 */
	public function getOrderArrowParam($name, $order,$params){

		$replaceStr = "";
		$linkstr=$this->getOrderArrow($name, $order);

		if(empty($params) || !is_array($params)){// パラメーターがないならそのまま
			return $linkstr;
		}
		foreach($params as $key => $param){
			$replaceStr .= $key . "=" . $param ."&";
		};
		return str_replace("?","?".$replaceStr,$linkstr);
	}

	/**
	* 「何件表示」を出す
	*/
	public function getPerPage(){
		$perpage_list = array(10, 20, 50, 100, 200, 500);
		$url = parse_url($_SERVER['REQUEST_URI']);
		// URLを書き換える
		$url['path'] = $this->rewriteUrl($url['path']);

		$linkstr = "<div class='mi_pagenation_option'>";
		$linkstr .= "<span>表示件数</span>&nbsp;";
		$linkstr .= "<select name='display-num' onchange='window.location.href=\"{$url['path']}?page=1&{$this->perpagename}=\"+$(this).val()'>";
		foreach($perpage_list as $row){
			if($row == $this->perpage){
				$linkstr .= "<option value='{$row}' selected>{$row}</option>";
			}
			else{
				$linkstr .= "<option value='{$row}'>{$row}</option>";
			}
		}
		$linkstr .= "</select>";
		$linkstr .= "</div>";

		return $linkstr;
	}


	/**
	 * パラメータ持ちの画面での「何件表示」を出す
	 * @params $param array パラメーターarray
	 * @return string
	 */
	public function getPerPagePram($params){
		$replaceStr = "";
		$linkstr=$this->getPerPage();

		if(empty($params) || !is_array($params)){// パラメーターがないならそのまま
			return $linkstr;
		}
		foreach($params as $key => $param){
			$replaceStr .= $key . "=" . $param ."&";
		};
		return str_replace("?","?".$replaceStr,$linkstr);
	}

	/**
	* 総件数を返す
	*/
	public function getCount(){
		return $this->listcount;
	}
	
	/**
	 * URLを書き換える処理
	 * 架電詳細で使用しているが他にも同じ処理が発生した場合もこの処理で吸収する
	 * @param unknown $urlPath
	 */
	private function rewriteUrl($urlPath){
		if($urlPath == "/approach-detail/contents"){
			// 架電詳細
			$urlPath = "/approach-detail/index";
		}
		return $urlPath;
	}

}