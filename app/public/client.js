// client-side js, loaded by index.html
// run by the browser each time the page is loaded

const url = "wss://162proj-rsta.glitch.me";
const connection = new WebSocket(url);


//let e = document.getElementById("newMsg");
//e.addEventListener("change", sendNewMsg);

//Button 1 and 2
let b1 = document.getElementById("button1");
let b2 = document.getElementById("button2");
let progressBar = document.getElementById("progress");

document.getElementById("startnext").addEventListener("click", startNextRound);
function startNextRound() {
  document.getElementById("sn_msg").textContent = "Wait for other players...";
  let Obj = {
    "type": "startnext"
  }
  connection.send(JSON.stringify(Obj));
}

b1.addEventListener("click", clickA);

function clickA() {
  progressBar.textContent = "Waiting...";
  let cmdObj = {
    "type": "command",
    "selection": 0
  }
  connection.send(JSON.stringify(cmdObj));
  
  b1.removeEventListener("click", clickA);
  b2.removeEventListener("click", clickB);
}


b2.addEventListener("click", clickB);

function clickB() {
  progressBar.textContent = "Waiting...";
  let cmdObj = {
    "type": "command",
    "selection": 1
  }
  connection.send(JSON.stringify(cmdObj));
  
  b1.removeEventListener("click", clickA);
  b2.removeEventListener("click", clickB);
}




function sendNewMsg() {
  let e = document.getElementById("newMsg");
  let msgObj = {
    "type": "message",
    "from": "a client",
    "msg": e.value
  }
  connection.send(JSON.stringify(msgObj));
  e.value = null;
}



let addMessage = function(message) {
  const pTag = document.createElement("p");
  pTag.appendChild(document.createTextNode(message));
  document.getElementById("messages").appendChild(pTag);
};


connection.onopen = () => {
  //connection.send(JSON.stringify({"type": "helloClient"}));
};

connection.onerror = error => {
  console.log(`WebSocket error: ${error}`);
};

connection.onmessage = event => {
  console.log(event.data);
  let msgObj = JSON.parse(event.data);
  
  b1.addEventListener("click", clickA);
  b2.addEventListener("click", clickB);
  
  if (msgObj.type == "message") {
    addMessage(msgObj.from+": "+msgObj.msg);
    
  } else if (msgObj.type == "command") {
    progressBar.textContent = "Please choose";
    document.getElementById("name1").textContent = msgObj.info[0][0];
    document.getElementById("name2").textContent = msgObj.info[1][0];
    document.getElementById("img1").src = msgObj.info[0][1];
    document.getElementById("img2").src = msgObj.info[1][1];
    //document.getElementById("rating1").textContent = msgObj.info[0][2].toString(); 
    //document.getElementById("rating2").textContent = msgObj.info[1][2].toString();
    var r1 = msgObj.info[0][2];
    var n1 = 5 - r1;
    n1 = n1 - (n1%1);
    var flag1 = 0;
    document.getElementById("rating1").textContent = "";
    while (r1 > 0) {

      if (r1 % 1 == 0) {
        let icon = document.createElement("i");
        icon.className = "iconfont";
        icon.textContent = ""
        document.getElementById("rating1").appendChild(icon);
        r1 -= 1;          
      } else {
        flag1 = 1;
        r1 -= 0.5;
      }
    }
    if (flag1 == 1) {
        let icon = document.createElement("i");
        icon.className = "iconfont";
        icon.textContent = ""
        document.getElementById("rating1").appendChild(icon);
    }
    for (var i = 0; i < n1; i++) {
        let icon = document.createElement("i");
        icon.className = "iconfont";
        icon.textContent = ""
        document.getElementById("rating1").appendChild(icon);
    }  
    
    let r2 = msgObj.info[1][2];
    var n2 = 5 - r2;
    n2 = n2 - (n2%1);
    var flag2 = 0;
    document.getElementById("rating2").textContent = "";
    while (r2 > 0) {

      if (r2 % 1 == 0) {
        let icon = document.createElement("i");
        icon.className = "iconfont";
        icon.textContent = ""
        document.getElementById("rating2").appendChild(icon);
        r2 -= 1;          
      } else {
        flag2 = 1;
        r2 -= 0.5;
      }
    }
    if (flag2 == 1) {
        let icon = document.createElement("i");
        icon.className = "iconfont";
        icon.textContent = ""
        document.getElementById("rating2").appendChild(icon);
    }
    for (var i = 0; i < n2; i++) {
        let icon = document.createElement("i");
        icon.className = "iconfont";
        icon.textContent = ""
        document.getElementById("rating2").appendChild(icon);
    }
    
    document.getElementById("review1").textContent = "Number of Reviews: " + msgObj.info[0][3].toString();
    document.getElementById("review2").textContent = "Number of Reviews: " + msgObj.info[1][3].toString();
    document.getElementById("range1").textContent = msgObj.info[0][4];
    document.getElementById("range2").textContent = msgObj.info[1][4];
    
    
  } else if (msgObj.type == "start") {
    document.getElementById("game").style.display = "block";
    document.getElementById("wait").style.display = "none";
    
  } else if (msgObj.type == "win") {
    if (msgObj.winner == "tie") {
      document.getElementById("winner").textContent = "There is a tie";
    } else {
      document.getElementById("winner").textContent = "Winner is "+msgObj.winner;
    }
  } else if (msgObj.type == "round_end"){
    console.log("this round ended");
    document.getElementById("game").style.display = "none";
    document.getElementById("endround").style.display = "block";
    document.getElementById("roundwinners").textContent = "This round has finished. Winners in this Round:";
    for (let i= 0; i < msgObj.previous_winners.length; i++) {
      document.getElementById("roundwinners").textContent += ", ";
      document.getElementById("roundwinners").textContent += msgObj.previous_winners[i][0];
    }
  } else if (msgObj.type == "end") {
    document.getElementById("game").style.display = "none";
    document.getElementById("endround").style.display = "none";
    document.getElementById("endgame").textContent = "Game has ended, Winner is "+ msgObj.winner[0];
  } else if (msgObj.type == "initialize") {
    //console.log(msgObj);
    document.getElementById("name1").textContent = msgObj.left[0];
    document.getElementById("name2").textContent = msgObj.right[0];
    document.getElementById("img1").src = msgObj.left[1];
    document.getElementById("img2").src = msgObj.right[1];

    let r1 = msgObj.left[2];
    var n1 = 5 - r1;
    n1 = n1 - (n1%1);
    var flag1 = 0;
    document.getElementById("rating1").textContent = "";
    while (r1 > 0) {

      if (r1 % 1 == 0) {
        let icon = document.createElement("i");
        icon.className = "iconfont";
        icon.textContent = ""
        document.getElementById("rating1").appendChild(icon);
        r1 -= 1;          
      } else {
        flag1 = 1;
        r1 -= 0.5;
      }
    }
    if (flag1 == 1) {
        let icon = document.createElement("i");
        icon.className = "iconfont";
        icon.textContent = ""
        document.getElementById("rating1").appendChild(icon);
    }
    for (var i = 0; i < n1; i++) {
        let icon = document.createElement("i");
        icon.className = "iconfont";
        icon.textContent = ""
        document.getElementById("rating1").appendChild(icon);
    }
    
    
    let r2 = msgObj.right[2];
    var n2 = 5 - r2;
    n2 = n2 - (n2%1);
    var flag2 = 0;
    document.getElementById("rating2").textContent = "";
    while (r2 > 0) {

      if (r2 % 1 == 0) {
        let icon = document.createElement("i");
        icon.className = "iconfont";
        icon.textContent = ""
        document.getElementById("rating2").appendChild(icon);
        r2 -= 1;          
      } else {
        flag2 = 1;
        r2 -= 0.5;
      }
    }
    if (flag2 == 1) {
        let icon = document.createElement("i");
        icon.className = "iconfont";
        icon.textContent = ""
        document.getElementById("rating2").appendChild(icon);
    }
    for (var i = 0; i < n2; i++) {
        let icon = document.createElement("i");
        icon.className = "iconfont";
        icon.textContent = ""
        document.getElementById("rating2").appendChild(icon);
    }    
    
    
    document.getElementById("review1").textContent = "Number of Reviews: " + msgObj.left[3].toString();
    document.getElementById("review2").textContent = "Number of Reviews: " + msgObj.right[3].toString();
    document.getElementById("range1").textContent = msgObj.left[4];
    document.getElementById("range2").textContent = msgObj.right[4];
  } else if (msgObj.type == "startnext") {
    document.getElementById("sn_msg").textContent = "";
    document.getElementById("game").style.display = "block";
    document.getElementById("endround").style.display = "none"; 
  }
  else {
    addMessage(msgObj.type);
  }
};




  