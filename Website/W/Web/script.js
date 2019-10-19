const video = document.querySelector(".player");
const canvas = document.querySelector(".photo");
const ctx = canvas.getContext("2d");
const strip = document.querySelector(".strip");
const snap = document.querySelector(".snap");

let frameId;
const options = {
  mirrored: false,
  rgbSplit: false
};

navigator.mediaDevices
  .getUserMedia({ video: true, audio: false })
  .then(stream => {
    video.srcObject = stream;
    video.play();
    video.addEventListener(`loadedmetadata`, () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      requestAnimationFrame(computeFrame);
    });
  })
  .catch(err => {
    console.log("An error occured! " + err);
  });

function computeFrame(timestamp) {
  ctx.drawImage(video, 0, 0); // intermediate data to manipulate
  const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
  manipulateImage(frame);
  ctx.putImageData(frame, 0, 0);

  requestAnimationFrame(computeFrame);
}

function manipulateImage(frame) {
  const { data, width, height } = frame;

  if (options.mirrored) {
    // mirror the image
    // this is just an example of image data manipulation with js;
    // can easily be done with a simple css rule - transform: scaleX(-1);
    for (let j = 0; j < height; j++) {
      for (let i = 0; i < width / 2; i++) {
        const left = 4 * (j * width + i);
        const right = 4 * (j * width + (width - 1 - i));

        const tempr = data[left + 0];
        const tempg = data[left + 1];
        const tempb = data[left + 2];
        const tempa = data[left + 3];
        data[left + 0] = data[right + 0];
        data[left + 1] = data[right + 1];
        data[left + 2] = data[right + 2];
        data[left + 3] = data[right + 3];
        data[right + 0] = tempr;
        data[right + 1] = tempg;
        data[right + 2] = tempb;
        data[right + 3] = tempa;
      }
    }
  }

  // rgb split
  if (options.rgbSplit) {
    for (let i = 0; i < data.length; i += 4) {
      data[i - 150] = data[i];
      data[i + 100] = data[i + 1];
      data[i - 550] = data[i + 2];
    }
  }

  // green screen
  const levels = {};
  document.querySelectorAll(`.rgb input`).forEach(input => {
    levels[input.name] = input.value;
  });
  for (let i = 0; i < data.length; i += 4) {
    const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
    if (
      r >= levels.rmin &&
      r <= levels.rmax &&
      (g >= levels.gmin && g <= levels.gmax) &&
      (b >= levels.bmin && b <= levels.bmax)
    ) {
      data[i + 3] = 0; // set alpha to 0 => transparent
    }
  }
}

function takePhoto() {
  const data = canvas.toDataURL(`image/jpeg`);

  let link = document.createElement(`a`);
  link.href = data;
  link.download = `handsome.jpg`;
  let img = document.createElement(`img`);
  img.src = data;
  img.alt = `webcam capture at ` + new Date().toLocaleString();

  link.appendChild(img);
  strip.appendChild(link);

  // sound effect
  snap.pause();
  snap.currentTime = 0;
  snap.play();
}

for (let option in options) {
  document
    .querySelector(`input[name="${option}"]`)
    .addEventListener(`change`, e => {
      options[option] = e.currentTarget.checked;
    });
}