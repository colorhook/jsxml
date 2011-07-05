<?php
$url = "http://api.t.sina.com.cn/trends/statuses.xml?trend_name=".urlencode("D2前端技术论坛")."&source=506163941";
//$url = "http://api.t.sina.com.cn/trends/statuses/user_timeline.xml?screen_name=".urlencode("D2前端技术论坛")."&source=506163941";
echo file_get_contents($url);