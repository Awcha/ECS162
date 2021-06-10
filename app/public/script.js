// client-side js, loaded by index.html
// run by the browser each time the page is loaded

const url = "wss://162proj-rsta.glitch.me";
const connection = new WebSocket(url);

//let e = document.getElementById("newMsg");
//e.addEventListener("change", sendNewMsg);

function sendNewMsg() {
  let e = document.getElementById("newMsg");
  let msgObj = {
    "type": "message",
    "from": "host",
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
  //connection.send(JSON.stringify({"type":"helloHost"}));
};

connection.onerror = error => {
  //console.log(`WebSocket error: ${error}`);
};

connection.onmessage = event => {
  let msgObj = JSON.parse(event.data);
  if (msgObj.type == "message") {
    addMessage(msgObj.from+": "+msgObj.msg);
  } if (msgObj.type == "start") {

  } else if (msgObj.type == "getback") {
    window.location.href = "https://162proj-rsta.glitch.me/client.html?id="+id;
    let cmdObj = {
      "type": "start"
    }
    connection.send(JSON.stringify(cmdObj));
  }  
  else {
    addMessage(msgObj.type);
  }
};

/* 
setInterval(() => {
  let msg = "hearbeat";
  addMessage("host:" + msg)
  connection.send(msg);
}, 4000);
*/

let submitButton1 = document.getElementById("submita");
submitButton1.addEventListener("click", startGame);

var id = "";
function startGame() {
  id = Math.random().toString(36).substr(2, );
  document.getElementById("search1").style.display = "block";
  document.getElementById("url").textContent = "162proj-rsta.glitch.me/client.html?id="+id;
  var link = document.getElementById("url");
  //link.setAttribute("href", "https://162proj-rsta.glitch.me/client.html?id="+id);
  document.getElementById("submita").style.display = "none";
}

let submitButton2 = document.getElementById("submitb");
submitButton2.addEventListener("click", getRest);

/*
function getRest() {
  let e1 = document.getElementById("location");
  let e2 = document.getElementById("browser");  
  //console.log(e2.value);
  let getObj = {
    location: e1.value,
    term : e2.value,
    limit: 16
  }
  let str = JSON.stringify(getObj);
  let url= "/getRestaurant";
  let xhr= new XMLHttpRequest;
  xhr.open("POST",url, true);
  xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xhr.onloadend = function(e) {
    window.location.href = "https://162proj-rsta.glitch.me/client.html?id="+id;
    let cmdObj = {
      "type": "start"
    }
    connection.send(JSON.stringify(cmdObj));
  }
  xhr.send(str);
  e1.value = null;
  e2.value = null;
} */

function getRest() {
  let e1 = document.getElementById("location");
  let e2 = document.getElementById("browser");  
  //console.log(e2.value);
  let getObj = {
    location: e1.value,
    term : e2.value,
    limit: 16
  }
  let str = JSON.stringify(getObj);
  
  let msgObj = {
    "type": "get",
    "msg": str
  }
  connection.send(JSON.stringify(msgObj));
  e1.value = null;
  e2.value = null;
  
  /*
  xhr.onloadend = function(e) {
    window.location.href = "https://162proj-rsta.glitch.me/client.html?id="+id;
    let cmdObj = {
      "type": "start"
    }
    connection.send(JSON.stringify(cmdObj));
  }
*/
}

  let url_2= "/getCategory";
  let ahr= new XMLHttpRequest;
  ahr.open("POST",url_2, true);
  ahr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  ahr.onloadend = function(e) {
    const arr = JSON.parse(ahr.responseText);
    for (let i = 0; i < arr.length; i++) {
      var node = document.createElement("option");
      var textn = document.createTextNode(arr[i]);
      node.appendChild(textn);
      document.getElementById("browsers").appendChild(node);
    }
  }
  ahr.send();

//submitButton2.addEventListener("click", startClient);

function startClient() {

}