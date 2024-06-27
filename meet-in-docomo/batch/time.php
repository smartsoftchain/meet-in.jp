<?php

	list($micro, $Unixtime) = explode(" ", microtime());
	$sec = $micro + date("s", $Unixtime); // 秒"s"とマイクロ秒を足す

echo date("Y-m-d h:i");
