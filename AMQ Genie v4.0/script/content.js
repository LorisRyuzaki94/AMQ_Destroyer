function addControlWindow() {
	const container = document.createElement("div");
	const dragBar = document.createElement("div");
	const div = document.createElement("div");

	container.style.position = "fixed";
	container.style.top = "10px";
	container.style.left = "10px";
	container.style.zIndex = "9999";
	container.style.border = "2px solid #6c6c6c";

	dragBar.textContent = "Control Window";
	dragBar.style.textAlign = "center";
	dragBar.style.lineHeight = "30px";
	dragBar.style.width = "100%";
	dragBar.style.height = "30px";
	dragBar.style.backgroundColor = "#1c1c1c";
	dragBar.style.cursor = "grab";

	checkCorsAnywhere().then(data => {div.textContent = data.ok});
	div.style.backgroundColor = "#444444";
	div.style.color = "white";
	div.style.padding = "10px";
	div.style.fontSize = "20px";

	container.appendChild(dragBar);
	container.appendChild(div);
	document.body.appendChild(container);

	let offsetX, offsetY, isDragging = false;

	dragBar.addEventListener("mousedown", function (e) {
		e.preventDefault();
		isDragging = true;
		offsetX = e.clientX - container.getBoundingClientRect().left;
		offsetY = e.clientY - container.getBoundingClientRect().top;
		dragBar.style.cursor = "grabbing";
	});

	document.addEventListener("mousemove", function (e) {
		if (isDragging) {
			let newX = e.clientX - offsetX;
			let newY = e.clientY - offsetY;

			// Limit within screen boundaries
			const maxX = window.innerWidth - container.offsetWidth;
			const maxY = window.innerHeight - container.offsetHeight;

			if (newX < 0) newX = 0;
			if (newY < 0) newY = 0;
			if (newX > maxX) newX = maxX;
			if (newY > maxY) newY = maxY;

			container.style.left = `${newX}px`;
			container.style.top = `${newY}px`;
		}
	});

	document.addEventListener("mouseup", function () {
		isDragging = false;
		dragBar.style.cursor = "grab";
	});

	async function checkCorsAnywhere() {
		return fetch(`https://cors-anywhere.herokuapp.com/google.com`, {
			headers: {
				'x-requested-with': 'XMLHttpRequest'  // Sostituisci con il tuo valore di origine
			}
		})
	}
}



addControlWindow();



