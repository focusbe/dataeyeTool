var videoUrls = [];

function ab2str(u, f) {
    var b = new Blob([u]);
    var r = new FileReader();
    r.readAsText(b, "utf-8");
    r.onload = function() {
        if (f) f.call(null, r.result);
    };
}
chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
        if(details.url.indexOf('.m3u8')>-1||details.url.indexOf('.flv')>-1){
            console.log(details);
        }
        if (!!details && !!details.url && details.url.indexOf("adx.dataeye.com/search/searchMaterial") > -1) {
            if (!!details.requestBody && (!!details.requestBody.raw || !!details.requestBody.formData)) {
                if (!!details.requestBody.formData) {
                    var key = "tab" + details.tabId;
                    var data = {};
                    data[key] = details.requestBody.formData;
                    chrome.storage.sync.set(data, function() {
                        // console.log("Value is set to " + value);
                    });

                    // videoUrls[details.tabId] = details.requestBody.formData;
                    // console.log(videoUrls);
                } else {
                    // debugger
                    ab2str(details.requestBody.raw[0].bytes, function(str) {
                        var data = {};
                        var temp = str.split("&");
                        var temp2;
                        for (var i in temp) {
                            if (!!temp[i]) {
                                temp2 = temp[i].split("=");
                                if (!!temp2 && temp2.length == 2) {
                                    data[temp2[0]] = temp2[1];
                                }
                            }
                        }
                        var key = "tab" + details.tabId;
                        var data2 = {};
                        data2[key] = data;
                        console.log(data2);
                        chrome.storage.sync.set(data2, function() {
                            // console.log("Value is set to " + value);
                        });

                        // videoUrls[details.tabId] = data;
                        // console.log(videoUrls);
                    });
                }
            }
        }
        // console.log();
        // if (details.url) {
        // }
        // return { cancel: false };
    },
    { urls: ["<all_urls>"] },
    ["blocking", "requestBody"]
);
// console.log("background");
