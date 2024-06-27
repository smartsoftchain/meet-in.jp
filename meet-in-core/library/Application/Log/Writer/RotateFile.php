<?php
/**
 * Application_Log_Writer_Stream クラス
 *
 * 拡張Zend_Log_Writer_Streamクラス
 *
 * @version $Id$
 * @package Application
 */
class Application_Log_Writer_RotateFile extends Zend_Log_Writer_Stream
{
  protected $_options = null;   // filename, mode, fileMaxSize, fileMaxCount

  /**
   * コンストラクタ
   */
  public function __construct($filename, $mode = 'a', $fileMaxSize = 0, $fileMaxCount = 0)
  {
    $this->_options = new stdClass();
    if (is_object($filename) && isset($filename->filename)) {
      // stdClassでのオプション指定
      $this->_options = $filename;
      if (!isset($this->_options->mode)) {
        $this->_options->mode = $mode;
      }
      if (!isset($this->_options->fileMaxSize)) {
        $this->_options->fileMaxSize = $fileMaxSize;
      }
      if (!isset($this->_options->fileMaxCount)) {
        $this->_options->fileMaxCount = $fileMaxCount;
      }
    }
    else {
      // Zend_Log_Writer_Stream互換の引数によるオプション指定
      $this->_options->filename     = $filename;
      $this->_options->mode         = $mode;
      $this->_options->fileMaxSize  = $fileMaxSize;
      $this->_options->fileMaxCount = $fileMaxCount;
    }

    parent::__construct($this->_options->filename, $this->_options->mode);
  }

  /**
   * ログ書き込み
   */
  protected function _write($event)
  {
    if ($this->_options->fileMaxSize !== 0) {
      // Logファイルサイズが上限に達しているかチェック
      $status = fstat($this->_stream);
      if ($this->_options->fileMaxSize < $status['size']) {
        $this->_rotate();
      }
    }
    parent::_write($event);
  }

  /**
   * ログローテート
   */
  protected function _rotate() {
    fclose($this->_stream);
    $this->_backup($this->_options->filename, 1);
    if (! $this->_stream = @fopen($this->_options->filename, $this->_options->mode, false)) {
      $msg = "\"{$this->_options->filename}\" cannot be opened with mode \"$mode\"";
      throw new Zend_Log_Exception($msg);
    }
  }

  /**
   * ファイルバックアップ
   */
  protected function _backup($filename, $number) {
    if ($this->_options->fileMaxCount < $number) {
      // 最大保持件数からあふれたファイルは削除
      unlink($filename);
    }
    else {
      $backupFilename = sprintf('%s.%d', $this->_options->filename, $number);
      if (file_exists($backupFilename)) {
        $this->_backup($backupFilename, $number+1);
      }
      rename($filename, $backupFilename);
    }
  }

}
