class ControlWindow {
    constructor() {
        this.container = document.createElement("div");
        this.title = document.createElement("h3");
        this.separator = document.createElement("hr");
        this.songName = this.createTextElement("Song Name", "");
        this.artist = this.createLinkElement("Artist", "", "#");
        this.type = this.createTextElement("Type", "");
        this.videoLink = this.createLinkElement("", "Video - Anime", "#");
        this.buttonContainer = document.createElement("div");
        this.init();
    }

    async init() {
        this.setupContainer();
        this.setupTitle();
        this.setupSeparator();
        this.setupButtons();

        this.container.appendChild(this.title);
        this.container.appendChild(this.separator);
        this.container.appendChild(this.songName);
        this.container.appendChild(this.artist);
        this.container.appendChild(this.type);
        this.container.appendChild(this.videoLink);
        this.container.appendChild(this.buttonContainer);

        document.body.appendChild(this.container);

        this.makeDraggable();

        await this.loadData();
    }

    async loadData() {
        try {
            const data = await this.guess();
            this.songName.innerHTML = `<strong>Song Name</strong><br>${data.song}`;
            this.artist.innerHTML = `<strong>Artist</strong><br><a href="#" style="color: #69c; text-decoration: none;">${data.artist}</a>`;
            this.type.innerHTML = `<strong>Type</strong><br>${data.type}`;
        } catch (error) {
            console.error("Failed to load data", error);
        }
    }

    async guess() {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    song: "IGNITE",
                    artist: "Eir Aoi",
                    type: "Opening 1"
                });
            }, 1000);
        });
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
            { icon: "👍", action: () => alert("Liked!") },
            { icon: "🚩", action: () => alert("Reported!") },
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
                margin: "0 2px"
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

new ControlWindow();