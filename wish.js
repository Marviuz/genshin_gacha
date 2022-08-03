let __JWT_TOKEN__ = "";
let __CHANNEL_ID__ = ""
let __CHANNEL_NAME__ = ""

let volume = 100 // 0 ~ 100 value only
let sr_percentage = 5 // % on winning a 5★
let c_percentage = 60 // % on winning a 3★
let points_name = "Primogems";
let cost = 160
let five_star_prize = 2000;
let four_star_prize = 300;
let three_star_prize = 0;

// ********************************************************************************
// ******************* DO NOT MODIFY ANYTHING BEYOND THIS POINT *******************
// ********************************************************************************

let video;
let videoPools = [];
let SRPool = [];  // 5★
let RPool = [];   // 4★
let CPool = [];   // 3★
let allowed = true;
let displayName;
let userInfo = {};
let randomVid = {};

// TBD: Automate retrieve file name/path/value

const videoPath = "./videos"
SRPool.push(
  {
    path: `${videoPath}/5star_albedo.mp4`,
    value: 500,
    name: "★★★★★ Albedo"
  }
)

RPool.push(
  {
    path: `${videoPath}/4star_bennett.mp4`,
    value: 200,
    name: "★★★★ Bennett"
  }
)

CPool.push(
  {
    path: `${videoPath}/3star_black_tassel.mp4`,
    value: 0,
    name: "★★★ Black Tassel"
  }
)

function initializeVideoElement() {
  video = document.getElementById("video");

  video.onloadstart = function () {
    console.log("Video is now loaded");
  };

  video.oncanplaythrough = function () {
    console.log("Video can now play");
    video.play();
  }

  video.onended = function () {
    console.log("Video Ended")
    video.setAttribute("hidden", "hidden");

    if (randomVid.value != 0) {
      addPoints(displayName, randomVid.value)
      .then(response => response.json())
      .then(_data => {
          sendChatMessage(`Congratulations! ${displayName} just wished for [${randomVid.name}] and ${randomVid.value} ${points_name} has been added | ${points_name}: ${_data.newAmount}`);
          allowed = true;
      });
    } else {
        getUser(displayName)
        .then(response => response.json())
        .then(_data => {
            sendChatMessage(`${displayName} just wished for [${randomVid.name}] | ${points_name}: ${_data.points}`);
            allowed = true;
        });
    }
  }

}

function randomItemFromArray(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function sendChatMessage(msg) {
  fetch(`https://api.streamelements.com/kappa/v2/bot/${__CHANNEL_ID__}/say`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
      'Authorization': `Bearer ${__JWT_TOKEN__}`
    },
    body: JSON.stringify({message: msg})
  });
}

function getUser(user) {
  return fetch(`https://api.streamelements.com/kappa/v2/points/${__CHANNEL_ID__}/${user}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
      'Authorization': `Bearer ${__JWT_TOKEN__}`
    }
  });
}

function addPoints(user, amount) {
  return fetch(`https://api.streamelements.com/kappa/v2/points/${__CHANNEL_ID__}/${user}/${amount}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
      'Authorization': `Bearer ${__JWT_TOKEN__}`
    }
  });
}

async function showVideo() {

  await getUser(displayName)
    .then(response => response.json())
    .then(_data => { userInfo = _data; });

  if (userInfo.points < cost) {
    sendChatMessage(`${displayName} do not have enough ${points_name} to wish | ${points_name}: ${userInfo.points}`);
    allowed = true;
    return;
  }

  await addPoints(displayName, -cost);

  // Show the element
  video.removeAttribute("hidden");

  // Retrieve the source element
  let source = document.getElementById("source");

  // Randomize if SRPool/RPool/CPool and retrieve a video from the pool
  chosenPool = (Math.random() < ( sr_percentage / 100)) ? SRPool :
               ((Math.random() < ( c_percentage / 100)) ? CPool : RPool);
  randomVid = randomItemFromArray(chosenPool);

  // Set the video as the source of the element and play it
  source.setAttribute("src", randomVid.path);
  video.load();
  video.volume = volume / 100;
}

function checkQueryParameters() {

  // Retrieve the query parameters required for authentication
  const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
  });

  __JWT_TOKEN__ = params.jwt;
  __CHANNEL_ID__ = params.id;
  __CHANNEL_NAME__ = params.channel;

  // Set the volume of the video
  if (params.volume) {
    let vol = Number(params.volume);
    if (isNaN(vol) || !(vol >= 0 && vol <= 100)){
      console.log("value for params.volume is invalid");
    } else {
      volume = vol;
    }
  }

  // Set the percentage of 5★ against 3★ and 4★
  if (params.sr) {
    let sr = Number(params.sr);
    if (isNaN(sr) || !(sr >= 0 && sr <= 100)){
      console.log("value for params.sr is invalid");
    } else {
      sr_percentage = sr;
    }
  }

  // Set the percentage of 3★ against 4★
  if (params.c) {
    let c = Number(params.c);
    if (isNaN(c) || !(c >= 0 && c <= 100)){
      console.log("value for params.c is invalid");
    } else {
      c_percentage = c;
    }
  }

  // Set the prize of 3★
  if (params.three) {
    let three = Number(params.three);
    if (isNaN(three)){
      console.log("value for params.three is invalid");
    } else {
      // Replace the value in the current pool
      CPool.forEach(video => {
        video.value = three;
      });
    }
  }

  // Set the prize of 4★
  if (params.four) {
    let four = Number(params.four);
    if (isNaN(four)){
      console.log("value for params.four is invalid");
    } else {
      // Replace the value in the current pool
      RPool.forEach(video => {
        video.value = four;
      });
    }
  }

  // Set the prize of 5★
  if (params.five) {
    let five = Number(params.five);
    if (isNaN(five)){
      console.log("value for params.five is invalid");
    } else {
      // Replace the value in the current pool
      SRPool.forEach(video => {
        video.value = five;
      });
    }
  }

  // Set the cost of each command
  if (params.cost) {
    let amount = Number(params.cost);
    if (isNaN(amount)){
      console.log("value for params.cost is invalid");
    } else {
      cost = amount;
    }
  }

  // Set the pointsname used in the channel
  if (params.points) {
    points_name = params.points;
  }

  // Check query inputs
  console.log(`Volume is set to ${volume}`);
  console.log(`5★ percentage is set to ${sr_percentage}`);
  console.log(`3★ percentage is set to ${c_percentage}`);
  console.log(`3★ prize is ${params.three}`);
  console.log(`4★ prize is ${params.four}`);
  console.log(`5★ prize is ${params.five}`);
  console.log(`Command Cost is ${cost}`);
  console.log(`Points Name is ${points_name}`);

  // Send a message in chat to verify the settings of the browser
  if (params.check) {
    sendChatMessage(`Volume(${volume}) | 5★(${sr_percentage}) | 3★(${c_percentage}) | 5p★(${SRPool[0].value}) | 4p★(${RPool[0].value}) | 3p★(${CPool[0].value}) | Cost(${cost}) | Name(${points_name})`)
  }
}

// ***********
// ENTRY POINT
// ***********

initializeVideoElement();

// Receives text from !
ComfyJS.onCommand = ( user, command, message, flags, extra ) => {

  if (command !== "wish" || !allowed) {return};

  // Set flag to false to not allow the program to receive more commands
  allowed = false;

  // Retrieve the name of the user who executed the command
  displayName = user;

  // Play the video
  showVideo();
}

checkQueryParameters();

// Connects the script to the channel name to track commands
ComfyJS.Init( __CHANNEL_NAME__ );