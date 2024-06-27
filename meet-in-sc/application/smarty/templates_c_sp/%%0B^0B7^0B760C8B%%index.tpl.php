<?php /* Smarty version 2.6.26, created on 2020-09-01 10:26:51
         compiled from exception/index.tpl */ ?>
<?php require_once(SMARTY_CORE_DIR . 'core.load_plugins.php');
smarty_core_load_plugins(array('plugins' => array(array('modifier', 'count', 'exception/index.tpl', 24, false),)), $this); ?>
<?php $_smarty_tpl_vars = $this->_tpl_vars;
$this->_smarty_include(array('smarty_include_tpl_file' => "./common/header.tpl", 'smarty_include_vars' => array()));
$this->_tpl_vars = $_smarty_tpl_vars;
unset($_smarty_tpl_vars);
 ?>

<?php echo '
<style>
.red-txt span,
.red-txt a {
	display: inline-block;
	vertical-align: middle;
}

</style>
'; ?>


<!-- コンテンツ領域[start] -->
<div id="mi_main_contents">
	<!-- トップナビ start -->
	<div id="mi_top_nav">
	</div>
	<!-- トップナビ end -->
	<!-- メインコンテンツ[start] -->
	<div id="mi_content_area">
		<!-- エラーメッセージ表示エリア begin -->
		<p>システムエラーが発生しました。(<?php echo $this->_tpl_vars['title']; ?>
)</p>
		<?php if (count($this->_tpl_vars['errorList']) > 0): ?>
		<p class="errmsg mb10">
			<table class="mi_table_input_right mi_table_main">
				<?php $_from = $this->_tpl_vars['errorList']; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array'); }if (count($_from)):
    foreach ($_from as $this->_tpl_vars['error']):
?>
					<?php $_from = $this->_tpl_vars['error']; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array'); }if (count($_from)):
    foreach ($_from as $this->_tpl_vars['row']):
?>
						<?php echo $this->_tpl_vars['row']; ?>

					<?php endforeach; endif; unset($_from); ?>
				<?php endforeach; endif; unset($_from); ?>
			</table>
		</p>
		<?php endif; ?>
		<!-- エラーメッセージ表示エリア end -->
	</div>
	<!-- メインコンテンツ[end] -->
</div>
<!-- コンテンツ領域[end] -->

<?php $_smarty_tpl_vars = $this->_tpl_vars;
$this->_smarty_include(array('smarty_include_tpl_file' => "./common/footer.tpl", 'smarty_include_vars' => array()));
$this->_tpl_vars = $_smarty_tpl_vars;
unset($_smarty_tpl_vars);
 ?>