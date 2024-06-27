chrome.storage.sync.get(null, function(items) {
    if (items['resolutions']) {
        document.getElementById('resolutions').value = items['resolutions'];
    } else {
        chrome.storage.sync.set({
            resolutions: '720p'
        }, function() {
            document.getElementById('resolutions').value = '720p'
        });
    }
});

document.getElementById('resolutions').onchange = function() {
    this.disabled = true;

    chrome.storage.sync.set({
        resolutions: this.value
    }, function() {
        document.getElementById('resolutions').disabled = false;
    });
};

chrome.storage.sync.get(null, function(items) {
    if (items['frameRate']) {
        document.getElementById('frameRate').value = items['frameRate'];
    } else {
        chrome.storage.sync.set({
            frameRate: 10
        }, function() {
            document.getElementById('frameRate').value = 10
        });
    }
});

document.getElementById('frameRate').onchange = function() {
    this.disabled = true;

    chrome.storage.sync.set({
        frameRate: this.value
    }, function() {
        document.getElementById('frameRate').disabled = false;
    });
};
