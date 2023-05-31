
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {

    if (message.action === "check-code") {
        fetch(new Request("database.json"))
            .then((response) => response.json())
            .then((database) => {
                anime = database[message.code];
                if (anime === undefined) {
                    anime = message.code;
                }
                sendResponse({name: anime});
            }
        );
    }
    return true;
});
