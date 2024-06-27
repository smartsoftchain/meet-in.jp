/*
 * 資料を保存する為のDBに関するJS
 * */

// グローバルDBオブジェクト
var db;
var dbName = "meetin";
var storeName = "meetin_document";

var indexedDB = window.indexedDB || window.mozIndexedDB || window.msIndexedDB;
if (indexedDB) {
	
	//indexedDB.deleteDatabase(dbName);
	
	// データベースをオープンする
	var openRequest = indexedDB.open(dbName, 1);
	
	// データベースのバージョンに変更があった場合
	openRequest.onupgradeneeded = function(event) {
		db = event.target.result;
		var store = db.createObjectStore(storeName, { keyPath: "key"});
		// インデックスを作成します。
		store.createIndex("valueIndex", "value");
	};
	
	// データベースのオープン成功
	openRequest.onsuccess = function(evt) {
//		db = event.target.result;
		db = openRequest.result;
	};
	// データベースのオープン失敗
	openRequest.onerror = function(evt) {
		alert("データベースの接続に失敗しました。");
	};
} else {
	alert("このブラウザではIndexed DataBase API は使えません。");
}

/**
 * DBからデータ取得
 * @param key
 */
function dbGetDocument(key){
	var transaction = db.transaction([storeName], "readwrite");
	var store = transaction.objectStore(storeName);
	var request = store.get(key);
	request.onsuccess = function (event) {
		// 取得したデータをjsonデコードして返す
		return $.parseJSON(event.target.result);
	};
}

/**
 * DB登録処理
 * キーが存在しなければ新規登録し、キーが存在するれば更新となる
 * @param key
 * @param value
 */
function dbRegistDocument(key, value){
	var transaction = db.transaction([storeName], "readwrite");
	var store = transaction.objectStore(storeName);
	// valueはjsonエンコードして登録する
	var request = store.put({ key: key, value: JSON.stringify(value)});
	request.onsuccess = function (event) {
		// 更新後の処理
	};
}

/**
 * DBからデータの削除
 */
function dbDeleteDocument(key){
	var transaction = db.transaction([storeName], "readwrite");
	var store = transaction.objectStore(storeName);
	var request = store.delete(key);
	request.onsuccess = function (event) {
		// 削除後の処理
	};
}
