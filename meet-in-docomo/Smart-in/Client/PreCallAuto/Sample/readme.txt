��������������������������������������������������
Smart-in�ڑ��T���v���@�ȈՐ����@�@�@�@2017/08/31
��������������������������������������������������

�������p�O�̒���
�{�T���v���ꎮ�͈ȉ��̊��ɂē���m�F���܂����B
�@CentOS6.4(64bit)
�@PHP5.5
�@MySQL5.5


�����e���ꗗ
calling.gif           �E�E�E�ڑ��m�F���̃_�C�A���O�摜
index.html            �E�E�E��ʕ\���pHTML
readme.txt            �E�E�E�{�t�@�C��
smartin.php           �E�E�E�T���v��PHP�i���v�ݒ�j


���ݒu�菇
�P�j�t�@�C�����̐ݒ����ύX���ĉ������B

�Esmartin.php
{Smart-in��s���M�L�[32��}
{Smart-in��ƃR�[�h4��}
{DB��}
{DB���[�U��}
{DB�p�X���[�h}
{�ݒuDIR}


�Q�jFTP��������SCP�ɂăt�@�C���ꎮ���T�[�o�ɔz�u���Ă��������B


�S�jDB�������p�̏ꍇ�Atoken�Ǘ��p�̃e�[�u�����쐬���܂��B

�EMySQL�̏ꍇ
CREATE TABLE `tokens` (
  `token` varchar(32) NOT NULL,
  `status` int(11) NOT NULL,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


�T�j����ł��������������܂��B
�u���E�U���J���āA�ݒu���� index.html �ɃA�N�Z�X���Ă��������B

�d�b�ԍ�����͂���t�B�[���h������܂��̂ŁA���͂��A�uSmart-in�F�؁v�{�^���������Ă��������B
Smart-in��蔭�s���ꂽ�d�b�ԍ��ɔ��M����ƁA�F�؂��������܂��B


�ȏ�