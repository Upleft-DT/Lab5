// script.js

const img = new Image(); // used to load image from <input> and draw to canvas
var canvas = document.getElementById('user-image');
const context = canvas.getContext('2d');

var voiceSelect = document.getElementById('voice-selection');
var voices = []; 

// Fires whenever the img object loads a new image (such as with img.src =)
img.addEventListener('load', () => {
  // TODO
  document.querySelector("[type='submit']").disabled = false;
  document.querySelector("[type='reset']").disabled = true;
  document.querySelector("[type='button']").disabled = true;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.beginPath();
  context.fillStyle = "black";
  context.rect(0, 0, canvas.width, canvas.height);
  context.fill();

  let dim = getDimmensions(canvas.width, canvas.height, img.width, img.height);
  context.drawImage(img, dim.startX, dim.startY, dim.width, dim.height);

  // Some helpful tips:
  // - Fill the whole Canvas with black first to add borders on non-square images, then draw on top
  // - Clear the form when a new image is selected
  // - If you draw the image to canvas here, it will update as soon as a new image is selected
});

document.getElementById("image-input").addEventListener("change", () => {
  let Element = document.querySelector("[type='file']");
  let url = URL.createObjectURL(Element.files[0]);
  img.src = url;
  img.alt = Element.files[0].name;
});

document.getElementById("generate-meme").addEventListener("submit", () => {
  var topInput = document.getElementById("text-top").value;
  var botInput = document.getElementById("text-bottom").value;

  context.font = "45px Impact";
  context.fillStyle = "white";
  context.textAlign = "center";

  context.fillText(topInput, canvas.width/2, 40);  
  context.fillText(botInput, canvas.width/2, canvas.height - 5); 
  
  document.querySelector("[type='reset']").disabled = false;
  document.querySelector("[type='button']").disabled = false;

  event.preventDefault();
});

document.querySelector("[type='reset']").addEventListener("click", () => {
  img.src = '';
  document.getElementById("text-top").value = '';
  document.getElementById("text-bottom").value = '';
  context.clearRect(0, 0, canvas.width, canvas.height);
});

document.querySelector("[type='button']").addEventListener("click", () => {

  var utterance1 = new SpeechSynthesisUtterance();
  var utterance2 = new SpeechSynthesisUtterance();
  let vol_select = document.getElementById('volume-group').querySelector("[type='range']").value;

  utterance1.text = document.getElementById("text-top").value;
  utterance2.text = document.getElementById("text-bottom").value;

  utterance1.volume = parseFloat(vol_select/100);
  utterance2.volume = parseFloat(vol_select/100);

  var selectedOption = voiceSelect.selectedOptions[0].getAttribute('data-name');
  for(var i = 0; i < voices.length ; i++) {
    if(voices[i].name === selectedOption) {
      utterance1.voice = voices[i];
      utterance2.voice = voices[i];
    }
  }

  window.speechSynthesis.speak(utterance1);
  window.speechSynthesis.speak(utterance2);
});

document.querySelector("[type='range']").addEventListener("change", () => {
  let vol = document.getElementById('volume-group').querySelector("[type='range']").value;
  let icon = document.getElementById('volume-group').querySelector("[src*='icons']");

  if(vol == 0){
    icon.src = "icons/volume-level-0.svg"
  }
  else if(vol <= 33){
    icon.src = "icons/volume-level-1.svg"
    console.log(vol);
  }
  else if (vol <= 66){
    icon.src = "icons/volume-level-2.svg"
  }
  else {
    icon.src = "icons/volume-level-3.svg"
  }
})


function populateVoiceList() {
  voiceSelect.disabled = false;
  voices = speechSynthesis.getVoices();
  setTimeout(() => {
    console.log(voices);
}, 1000);

  var i;
  for(i = 0; i < voices.length ; i++) {
    var option = document.createElement('option');
    option.textContent = voices[i].name + ' (' + voices[i].lang + ')';

    if(voices[i].default) {
      option.textContent += ' -- DEFAULT';
    }

    option.setAttribute('data-lang', voices[i].lang);
    option.setAttribute('data-name', voices[i].name);
    voiceSelect.appendChild(option);
  }
  voiceSelect.remove(voiceSelect.options[0]);
}

populateVoiceList();

window.speechSynthesis.onvoiceschanged = function(e) {
  populateVoiceList();
};


/**
 * Takes in the dimensions of the canvas and the new image, then calculates the new
 * dimensions of the image so that it fits perfectly into the Canvas and maintains aspect ratio
 * @param {number} canvasWidth Width of the canvas element to insert image into
 * @param {number} canvasHeight Height of the canvas element to insert image into
 * @param {number} imageWidth Width of the new user submitted image
 * @param {number} imageHeight Height of the new user submitted image
 * @returns {Object} An object containing four properties: The newly calculated width and height,
 * and also the starting X and starting Y coordinate to be used when you draw the new image to the
 * Canvas. These coordinates align with the top left of the image.
 */
function getDimmensions(canvasWidth, canvasHeight, imageWidth, imageHeight) {
  let aspectRatio, height, width, startX, startY;

  // Get the aspect ratio, used so the picture always fits inside the canvas
  aspectRatio = imageWidth / imageHeight;

  // If the apsect ratio is less than 1 it's a verical image
  if (aspectRatio < 1) {
    // Height is the max possible given the canvas
    height = canvasHeight;
    // Width is then proportional given the height and aspect ratio
    width = canvasHeight * aspectRatio;
    // Start the Y at the top since it's max height, but center the width
    startY = 0;
    startX = (canvasWidth - width) / 2;
    // This is for horizontal images now
  } else {
    // Width is the maximum width possible given the canvas
    width = canvasWidth;
    // Height is then proportional given the width and aspect ratio
    height = canvasWidth / aspectRatio;
    // Start the X at the very left since it's max width, but center the height
    startX = 0;
    startY = (canvasHeight - height) / 2;
  }

  return { 'width': width, 'height': height, 'startX': startX, 'startY': startY }
}
