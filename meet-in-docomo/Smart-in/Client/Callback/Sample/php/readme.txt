��������������������������������������������������
Smart-in�ڑ��T���v���@�ȈՐ����@�@�@�@2014/09/24
��������������������������������������������������

�������p�O�̒���
�{�T���v���ꎮ�͈ȉ��̊��ɂē���m�F���܂����B
�@CentOS6.4(64bit)
�@PHP5.5
�@MySQL5.5
��OS�̎�ʂ��قȂ�ꍇ��A32bitOS�̏ꍇ�͓��삵�܂���B
�@���̍ۂ͂��q�l���ɍ��킹�� sin_crypt ���������̏ꍇ�A������ɍ��������Ă��������������B


�����e���ꗗ
calling.gif           �E�E�E�ڑ��m�F���̃_�C�A���O�摜
index.html            �E�E�E��ʕ\���pHTML
readme.txt            �E�E�E�{�t�@�C��
sin_crypt             �E�E�E�Í������W���[���i���v�����ݒ�755�j
smartin.php           �E�E�E�T���v��PHP�i���v�ݒ�j
smartin_response.php  �E�E�E�T���v��PHP�i���v�ݒ�j
textdb.db             �E�E�E�t�@�C���g�p���̃f�[�^�t�@�C���i���v�����ݒ�666�j


���ݒu�菇
�P�j�t�@�C�����̐ݒ����ύX���ĉ������B

�Esmartin.php
{Smart-in�L�[32��}
{Smart-in��ƃR�[�h4��}
{DB��}
{DB���[�U��}
{DB�p�X���[�h}
{�ݒuDIR}

�Esmartin_response.php
{Smart-in�L�[32��}
{DB��}
{DB���[�U��}
{DB�p�X���[�h}


�Q�jFTP��������SCP�ɂăt�@�C���ꎮ���T�[�o�ɔz�u���Ă��������B


�R�j�p�[�~�b�V�����̐ݒ�����Ă��������B

> chmod 755 sin_crypt
> chmod 666 textdb.db

�S�jDB�������p�̏ꍇ�Atoken�Ǘ��p�̃e�[�u�����쐬���܂��B

�EMySQL�̏ꍇ
CREATE TABLE `tokens` (
  `token` varchar(32) NOT NULL,
  `status` int(11) NOT NULL,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


�T�j����ł��������������܂��B
�u���E�U���J���āA�ݒu���� index.html �ɃA�N�Z�X���Ă��������B

�d�b�ԍ�����͂���t�B�[���h������܂��̂ŁA���͂��A�uSmart-in�F�؁v�{�^���������Γd�b���������Ă��܂��B


�ȏ�