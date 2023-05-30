
chrome.tabs.query({ active: true }, function (tabs) {
    var tab = tabs[0];
    chrome.scripting.executeScript(
        {
            target: {
                tabId: tab.id,
            },

            func: () => {
                var link = document.getElementById("qpMoePlayer-0_html5_api").src;
                code = link.replace("https://amq.catbox.video/", "").replace(".mp3", "");
                document.getElementById("qpAnswerInput").value = code;
            }
        }
    );
});
