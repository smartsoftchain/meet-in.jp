<?php
require_once('Zend/View/Interface.php');
//require_once('Zend/View/Abstract.php');
require_once('Smarty/Smarty.class.php');

//class Zend_View_Smarty extends Zend_View_Abstract implements Zend_View_Interface
class Zend_View_Smarty implements Zend_View_Interface
{
  /**
   * Smarty object
   * @var Smarty
   */
  protected $_smarty;

  /**
   * コンストラクタ
   *
   * @param string $tmplPath
   * @param array $extraParams
   * @return void
   */
  public function __construct($tmplPath = null, $extraParams = array())
  {
    $this->_smarty = new Smarty;

    if (null !== $tmplPath) {
      $this->setScriptPath($tmplPath);
    }

    foreach ($extraParams as $key => $value) {
      $this->_smarty->$key = $value;
    }
  }

  /**
   * テンプレートエンジンオブジェクトを返します
   *
   * @return Smarty
   */
  public function getEngine()
  {
    return $this->_smarty;
  }

  /**
   * テンプレートへのパスを設定します
   *
   * @param string $path パスとして設定するディレクトリ
   * @return void
   */
  public function setScriptPath($path)
  {
    if (is_readable($path)) {
      $this->_smarty->template_dir = $path;
      return;
    }

    throw new Exception('無効なパスが指定されました');
  }

  /**
   * 現在のテンプレートディレクトリを取得します
   *
   * @return array
   */
  public function getScriptPaths()
  {
    return array($this->_smarty->template_dir);
  }

  /**
   * 現在のテンプレートディレクトリを取得します
   *
   * @return string
   */
  public function getScriptPath()
  {
    return $this->_smarty->template_dir;
  }

  /**
   * setScriptPath へのエイリアス
   *
   * @param string $path
   * @param string $prefix Unused
   * @return void
   */
  public function setBasePath($path, $prefix = 'Zend_View')
  {
    return $this->setScriptPath($path);
  }

  /**
   * setScriptPath へのエイリアス
   *
   * @param string $path
   * @param string $prefix Unused
   * @return void
   */
  public function addBasePath($path, $prefix = 'Zend_View')
  {
    return $this->setScriptPath($path);
  }

  /**
   * 変数をテンプレートに代入します
   *
   * @param string $key 変数名
   * @param mixed $val 変数の値
   * @return void
   */
  public function __set($key, $val)
  {
    $this->_smarty->assign($key, $val);
  }

  /**
   * 代入された変数を取得します
   *
   * @param string $key 変数名
   * @return mixed 変数の値
   */
  public function __get($key)
  {
    return $this->_smarty->get_template_vars($key);
  }

  /**
   * empty() や isset() のテストが動作するようにします
   *
   * @param string $key
   * @return boolean
   */
  public function __isset($key)
  {
    return (null !== $this->_smarty->get_template_vars($key));
  }

  /**
   * オブジェクトのプロパティに対して unset() が動作するようにします
   *
   * @param string $key
   * @return void
   */
  public function __unset($key)
  {
    $this->_smarty->clear_assign($key);
  }

  /**
   * 変数をテンプレートに代入します
   *
   * 指定したキーを指定した値に設定します。あるいは、
   * キー => 値 形式の配列で一括設定します
   *
   * @see __set()
   * @param string|array $spec 使用する代入方式 (キー、あるいは キー => 値 の配列)
   * @param mixed $value (オプション) 名前を指定して代入する場合は、ここで値を指定します
   * @return void
   */
  public function assign($spec, $value = null)
  {
    if (is_array($spec)) {
      $this->_smarty->assign($spec);
      return;
    }

    $this->_smarty->assign($spec, $value);
  }

  /**
   * 代入済みのすべての変数を削除します
   *
   * Zend_View に {@link assign()} やプロパティ
   * ({@link __get()}/{@link __set()}) で代入された変数をすべて削除します
   *
   * @return void
   */
  public function clearVars()
  {
    $this->_smarty->clear_all_assign();
  }

  /**
   * テンプレートを処理し、結果を出力します
   *
   * @param string $name 処理するテンプレート
   * @return string 出力結果
   */
  public function render($name)
  {
    return $this->_smarty->fetch($name);
  }

  protected function _run() {
    parent::_run();
  }
}

