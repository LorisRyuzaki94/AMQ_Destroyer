
chrome.tabs.query({ active: true }, function (tabs) {
    var tab = tabs[0];
    chrome.scripting.executeScript(
        {
            target: {
                tabId: tab.id,
            },

            func: () => {
                if (document.getElementById("qpMoePlayer-0").classList.contains("vjs-paused")) { // Cerca e seleziona quale dei due video player sia attivo
                    id = "qpMoePlayer-1_html5_api";
                } else {
                    id = "qpMoePlayer-0_html5_api";
                }
                var link = document.getElementById(id).src; // Cerca l'elemento contrassegnato dall'id univoco e ottiene il campo src (link del video)
                code = link.replace("https://amq.catbox.video/", "").replace(".mp3", ""); // estrae il codice dal link

                chrome.runtime.sendMessage({action: "check-code", code: code}, function(response) { // Invia un messaggio di tipo "check-code" con il codice. Il listener è in background.js
                    document.getElementById("qpAnswerInput").value = response.name; // Ottiene la risposta da background.js e la imposta come valore del campo input
                    window.close();
                });
            }
        }
    );
});
