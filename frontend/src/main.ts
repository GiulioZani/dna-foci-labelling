import swal from "sweetalert2";
type Focus = {
  x: number;
  y: number;
  r: number;
};
let loading = false;
let foci: Focus[] = [];
const canvas = document.getElementById("canvas")! as HTMLCanvasElement;
canvas.width = window.innerHeight - 10;
canvas.height = window.innerHeight - 10;
const ctx = canvas.getContext("2d")!;
let images: string[] = [];
let lastImageIndex = 0;
const image: HTMLImageElement = new Image();
let imageIndex = 0;
const drawFoci = () => {
  if (images.length > 0) {
    if (lastImageIndex !== imageIndex) {
      setImage();
      lastImageIndex = imageIndex;
    }
    ctx.drawImage(image, 0, 0, canvas.height, canvas.height);
    for (const focus of foci) {
      drawBall(focus.x, focus.y, focus.r);
    }
  }
};
image.onload = async () => {
  drawFoci();
	loading = false;
};
const drawBall = (x: number, y: number, r = 10) => {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = "white";
  ctx.fill();
};

const setImage = async () => {
	loading = true;
  const imageData = await fetch(
    `http://127.0.0.1:3000/$getImg$${images[imageIndex]}`
  );
	
	foci = []
	foci = (
    await fetch(`http://localhost:3000/$getLabel$`).then(
      (response) => response.json() as unknown as [number, number, number][]
    )
  ).map(([x, y, r]) => ({
    x: (x * canvas.height) / image.width,
    y: (y * canvas.height) / image.width,
    r: r * canvas.height,
  }));
  const test = await imageData.blob().then((blob) => URL.createObjectURL(blob));
  image.src = test;
};
const main = async () => {
  console.log("main");
  const response  = await fetch(`http://127.0.0.1:3000/images/$init$`).then((response) =>
    response.json()
  );
	images = response["fileNames"]
	imageIndex = images.indexOf(response["lastEdited"])
	lastImageIndex = lastImageIndex === 0 ? -1 : imageIndex
	drawFoci()
};
canvas.addEventListener("click", (e) => {
  foci.push({
    x: e.offsetX,
    y: e.offsetY,
    r: 10,
  });
  drawFoci();
});
const save = async () => {
  const encoded = foci.map((focus) => [
    Math.round((image.width * focus.x) / canvas.width),
    Math.round((image.width * focus.y) / canvas.width),
    focus.r / canvas.width,
  ]);

  const confirmation = await fetch(
    `http://127.0.0.1:3000/$save$${JSON.stringify(encoded)}`
  );
  if (confirmation.statusText !== "OK") {
    swal.fire("Error saving", "", "error");
  }
  console.log(confirmation);
};
document.onkeydown = async (e) => {
  e.preventDefault();
	if (!loading) {
	  if (e.code == "KeyS" && e.ctrlKey) {
		await save();
	  } else if (e.keyCode == 90 && e.ctrlKey) {
		foci.pop();
	  }
	  if (e.keyCode === 38) {
		console.log("up arrow pressed");
	  } else if (e.keyCode === 40) {
		console.log("down arrow pressed");
	  } else if (e.keyCode === 37) {
		console.log("left arrow pressed");
		imageIndex = imageIndex - 1 < 0 ? images.length - 1 : imageIndex - 1;
		await save();
	  } else if (e.keyCode === 39) {
		console.log("right arrow pressed");
		imageIndex = (imageIndex + 1) % images.length;
		await save();
	  }
	  else if (e.code === "KeyI") {
			swal.fire(`Image: ${images[imageIndex]}`, "", "info");
		}
	  console.log({ imageIndex });
	  drawFoci();
	}
};
document.addEventListener("wheel", (e) => {
  if (foci.length > 0) {
    const currentR = foci.at(-1)!.r;
    if (e.deltaY > 0) {
      foci.at(-1)!.r = Math.min(currentR + 1, window.innerHeight);
    } else {
      foci.at(-1)!.r = Math.max(currentR - 1, 1);
    }
    drawFoci();
  }
});
setInterval(save, 500)
await main();
export {};
