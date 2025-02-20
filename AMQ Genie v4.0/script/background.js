chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getDatabaseEntry") {
        fetch(chrome.runtime.getURL('database/database.json'))
            .then(response => response.json())
            .then(data => {
                const entry = data[request.hash] || { anime: "-", song: "-", artist: "-" };
                sendResponse(entry);
            })
            .catch(error => {
                console.error("Failed to fetch database", error);
                sendResponse({ anime: "-", song: "-", artist: "-" });
            });
        return true; // Will respond asynchronously
    }
});