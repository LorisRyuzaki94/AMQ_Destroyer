class ControlWindow {
    constructor() {
        this.container = document.createElement("div");
        this.title = document.createElement("h3");
        this.separator = document.createElement("hr");
        this.animeName = this.createTextElement("Anime Name", "-");
        this.songName = this.createTextElement("Song Name", "-");
        this.artistName = this.createTextElement("Artist Name", "-");
        this.buttonContainer = document.createElement("div");
        this.errorSection = this.createErrorSection();
        this.init();
    }

    async init() {
        this.setupContainer();
        this.setupTitle();
        this.setupSeparator();
        this.setupButtons();

        this.container.appendChild(this.title);
        this.container.appendChild(this.separator);
        this.container.appendChild(this.animeName);
        this.container.appendChild(this.songName);
        this.container.appendChild(this.artistName);
        this.container.appendChild(this.buttonContainer);
        this.container.appendChild(this.errorSection);
        this.errorSection.style.display = "none"; // Hide error section initially

        document.body.appendChild(this.container);

        this.makeDraggable();

        const corsCheck = await this.checkCorsAnywhere();
        if (!corsCheck) {
            this.showErrorSection("Attivare CORS-Anywhere", "https://cors-anywhere.herokuapp.com/corsdemo");
        }
    }

    async loadData() {
        try {
            const data = await this.guess();
            this.animeName.innerHTML = `<strong>Anime Name</strong><br>${data.anime}`;
            this.songName.innerHTML = `<strong>Song Name</strong><br>${data.song}`;
            this.artistName.innerHTML = `<strong>Artist Name</strong><br>${data.artist}`;
        } catch (error) {
            console.error("Failed to load data", error);
            this.resetFields();
            if (error.message.includes("429")) {
                this.showErrorSection("Troppi tentativi. Per favore, riprova più tardi.");
            } else {
                this.showErrorSection("Nessuna corrispondenza trovata nel database.");
            }
        }
    }

    autofill() {
        try {
            const anime = this.animeName.innerText.split("\n")[1];
            const song = this.songName.innerText.split("\n")[1];
            const artist = this.artistName.innerText.split("\n")[1];

            const inputField = document.querySelectorAll("#qpAnswerInput");
            if (inputField.length > 1) {
                inputField[1].value = song; // Ottiene la risposta
                inputField[2].value = artist; // Ottiene la risposta
            }
            inputField[0].value = anime; // Ottiene la risposta da background.js e la imposta come valore del campo input
        } catch (error) {
            console.error("Failed to autofill", error);
            this.showErrorSection("Errore durante l'autofill.");
        }
    }

    async guess() {
        return new Promise((resolve, reject) => {
            try {
                let id;
                if (document.getElementById("qpMoePlayer-0").classList.contains("vjs-paused")) {
                    id = "qpMoePlayer-1_html5_api";
                } else {
                    id = "qpMoePlayer-0_html5_api";
                }

                const url = document.getElementById(id).src;
                getHash(url).then(hash => {
                    chrome.runtime.sendMessage({ action: "getDatabaseEntry", hash: hash }, (response) => {
                        if (chrome.runtime.lastError) {
                            reject(new Error(chrome.runtime.lastError));
                        } else if (!response || (response.anime === '-' && response.song === '-' && response.artist === '-')) {
                            reject(new Error("Nessuna corrispondenza trovata nel database."));
                        } else {
                            this.hideErrorSection();
                            resolve(response);
                        }
                    });
                }).catch(error => {
                    if (error.message.includes("429")) {
                        this.showErrorSection("Troppi tentativi. Per favore, riprova più tardi.");
                    } else {
                        this.showErrorSection("Nessuna corrispondenza trovata nel database.");
                    }
                    reject(error);
                });
            } catch (error) {
                this.showErrorSection("Nessuna corrispondenza trovata nel database.");
                reject(error);
            }
        });
    }

    async checkCorsAnywhere() {
        const response = await fetch(`https://cors-anywhere.herokuapp.com/google.com`, {
            headers: {
                'x-requested-with': 'XMLHttpRequest'  // Replace with your origin value
            }
        });
        return response.ok;
    }

    showErrorSection(text, href = "") {
        this.errorSection.innerHTML = this.createErrorSectionContent(text, href);
        this.errorSection.style.display = "block";
        this.addCloseEventListener();
    }

    hideErrorSection() {
        this.errorSection.style.display = "none";
    }

    resetFields() {
        this.animeName.innerHTML = `<strong>Anime Name</strong><br>-`;
        this.songName.innerHTML = `<strong>Song Name</strong><br>-`;
        this.artistName.innerHTML = `<strong>Artist Name</strong><br>-`;
    }

    setupContainer() {
        Object.assign(this.container.style, {
            position: "fixed",
            top: "50px",
            left: "50px",
            width: "220px",
            backgroundColor: "#333",
            color: "white",
            padding: "15px",
            borderRadius: "10px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
            fontFamily: "Arial, sans-serif",
            textAlign: "center",
            zIndex: "9999"  // Ensure the container is on top of other elements
        });
    }

    setupTitle() {
        this.title.textContent = "Song Info";
        this.title.style.margin = "0";
        this.title.style.fontSize = "18px";
        this.title.style.cursor = "grab";
    }

    setupSeparator() {
        Object.assign(this.separator.style, {
            border: "0",
            height: "1px",
            background: "#555",
            margin: "10px 0"
        });
    }

    setupButtons() {
        Object.assign(this.buttonContainer.style, {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "10px",
            backgroundColor: "#222",
            padding: "5px 5px",
            borderRadius: "10px",
            width: "100%",
            boxSizing: "border-box",
            overflowX: "auto",
            whiteSpace: "nowrap"
        });

        const buttons = [
            { icon: "🔎", action: async () => {
                await this.loadData();
            }},
            { icon: "📝", action: () => {
                this.autofill();
            }},
            { icon: "👎", action: () => alert("Disliked!") }
        ];

        buttons.forEach(btn => {
            const button = document.createElement("button");
            button.textContent = btn.icon;
            Object.assign(button.style, {
                background: "#444",
                color: "white",
                border: "none",
                padding: "5px 8px",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "16px",
                flex: "1",
                margin: "0 2px",
                transition: "background-color 0.2s"
            });
            button.addEventListener("mouseover", () => {
                button.style.backgroundColor = "#555";
            });
            button.addEventListener("mouseout", () => {
                button.style.backgroundColor = "#444";
            });
            button.addEventListener("mousedown", () => {
                button.style.backgroundColor = "#333";
            });
            button.addEventListener("mouseup", () => {
                button.style.backgroundColor = "#555";
            });
            button.addEventListener("click", btn.action);
            this.buttonContainer.appendChild(button);
        });
    }

    createTextElement(label, value) {
        const element = document.createElement("p");
        element.innerHTML = `<strong>${label}</strong><br>${value}`;
        return element;
    }

    createLinkElement(label, text, href) {
        const element = document.createElement("p");
        const link = document.createElement("a");
        link.href = href;
        link.textContent = text;
        link.style.color = "#69c";
        link.style.textDecoration = "none";
        element.innerHTML = label ? `<strong>${label}</strong><br>` : "";
        element.appendChild(link);
        return element;
    }
    
    createErrorSection() {
        const element = document.createElement("div");
        element.style.display = "none"; // Hide initially
        Object.assign(element.style, {
            backgroundColor: "rgba(255, 0, 0, 0.25)",
            color: "white",
            padding: "10px",
            borderRadius: "5px",
            marginTop: "15px",
            marginBottom: "0px",
            position: "relative"
        });
        return element;
    }

    createErrorSectionContent(text, href = "") {
        const link = href ? `<a href="${href}" target="_blank" style="color: white; text-decoration: underline;">${text}</a>` : text;
        return `<strong>Error</strong><br>${link}<span style="position: absolute; top: 5px; right: 10px; cursor: pointer;" id="closeError">✖</span>`;
    }

    addCloseEventListener() {
        const closeButton = this.errorSection.querySelector("#closeError");
        if (closeButton) {
            closeButton.addEventListener("click", () => {
                this.hideErrorSection();
            });
        }
    }

    makeDraggable() {
        let offsetX, offsetY, isDragging = false;

        this.title.addEventListener("mousedown", (e) => {
            e.preventDefault();
            isDragging = true;
            offsetX = e.clientX - this.container.getBoundingClientRect().left;
            offsetY = e.clientY - this.container.getBoundingClientRect().top;
            this.title.style.cursor = "grabbing";
        });

        document.addEventListener("mousemove", (e) => {
            if (isDragging) {
                let newX = e.clientX - offsetX;
                let newY = e.clientY - offsetY;

                // Limit within screen boundaries
                const maxX = window.innerWidth - this.container.offsetWidth;
                const maxY = window.innerHeight - this.container.offsetHeight;

                if (newX < 0) newX = 0;
                if (newY < 0) newY = 0;
                if (newX > maxX) newX = maxX;
                if (newY > maxY) newY = maxY;

                this.container.style.left = `${newX}px`;
                this.container.style.top = `${newY}px`;
            }
        });

        document.addEventListener("mouseup", () => {
            isDragging = false;
            this.title.style.cursor = "grab";
        });
    }
}

const blobToData = async (blob) => {
    const buffer = await blob.arrayBuffer();
    const view = new Int8Array(buffer);
    return [...view].map((n) => n.toString()).join("");
};

String.prototype.hashCode = function () {
    var hash = 0, i, chr;
    if (this.length === 0) return hash;
    for (i = 0; i < this.length; i++) {
        chr = this.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}

async function getHash(url) {
    return fetch(`https://cors-anywhere.herokuapp.com/${url}`, {
        headers: {
            'x-requested-with': 'XMLHttpRequest'  // Replace with your origin value
        }
    })
    .then(res => res.blob()) // Gets the response and returns it as a blob
    .then(blob => blobToData(blob))
    .then(blob => blob.hashCode());
}

new ControlWindow();