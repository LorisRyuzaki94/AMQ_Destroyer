
chrome.tabs.query({ active: true }, function (tabs) {
    var tab = tabs[0];
    chrome.scripting.executeScript(
        {
            target: {
                tabId: tab.id,
            },

            func: () => {
                if (document.getElementById("qpMoePlayer-0").classList.contains("vjs-paused")) {
                    id = "qpMoePlayer-1_html5_api";
                } else {
                    id = "qpMoePlayer-0_html5_api";
                }
                var link = document.getElementById(id).src;
                code = link.replace("https://amq.catbox.video/", "").replace(".mp3", "");

                chrome.runtime.sendMessage({action: "check-code", code: code}, function(response) {
                    document.getElementById("qpAnswerInput").value = response.name;
                });
            }
        }
    );
});
