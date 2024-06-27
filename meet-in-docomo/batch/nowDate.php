<?php


list($micro, $Unixtime) = explode(" ", microtime());
$sec = $micro + date("s", $Unixtime); // 秒"s"とマイクロ秒を足す
error_log($actionName.":".date("Y-m-d H:i:", $Unixtime).$sec);

echo "-*-*-*-*-*-*- end time  :" . date("Y-m-d H:i:s") . " -*-*-*-*-*-*-\n";
