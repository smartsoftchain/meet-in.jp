chrome.storage.sync.get(null, function(items) {
    if (items['captureDelayTimer']) {
        document.getElementById('captureDelayTimer').value = items['captureDelayTimer'];
    } else {
        chrome.storage.sync.set({
            captureDelayTimer: 5
        }, function() {
            document.getElementById('captureDelayTimer').value = 5
        });
    }
});

document.getElementById('captureDelayTimer').onchange = function() {
    var _timer = parseInt(this.value);
    if((isNaN(this.value) == false) && _timer > 0 && _timer <= 60) {
        this.disabled = false;
        chrome.storage.sync.set({
            captureDelayTimer: _timer
        }, function() {
            this.disabled = true;
            document.getElementById('msg').innerHTML = "保存しました。";
            document.getElementById('msg').style.color = "black";
            document.getElementById('msg').style.display = "block";
            setTimeout(function() {
                document.getElementById('msg').style.display = "none";
            }, 2000);
        });
    } else {
        document.getElementById('msg').innerHTML = "保存エラー。";
        document.getElementById('msg').style.color = "red";
        document.getElementById('msg').style.display = "block";
        setTimeout(function() {
            document.getElementById('msg').style.display = "none";
        }, 2000);
    }
};
