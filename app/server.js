const WebSocket = require('ws');

const express = require("express");
const app = express();
const http = require("http");

const sql = require("sqlite3").verbose();
const restDB = new sql.Database("restaurant.db");

// make all the files in 'public' available
// https://expressjs.com/en/starter/static-files.html
app.use(express.static("public")); 

// https://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
  response.sendFile(__dirname + "/public/index.html");
});

var started = 0;



//listen to incoming connection
const server = http.createServer(app);
const wss = new WebSocket.Server({server});

let clientCount = 0;
let voteCount = 0;
let restIndex = 0;
//const restList = [["AA", "BB"], ["CC", "DD"], ["EE", "FF"], ["GG", "HH"]];
var restList = [];
var newList = [];
const max_round = 6;
var total_round = 0;
var all_tie = 0;
var idx1 = 0;
var idx2 = 0;
var sn_count = 0;
//listen to connection event
var flag3 = 0;

function shuffle(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}


wss.on('connection', (ws) => {
  clientCount +=1;
  restIndex = 0;
  console.log("new user connected. Now ", clientCount, "users connected");
  if (started == 1) {
      let cmdObj = {
        "type": "start",
      }
      ws.send(JSON.stringify(cmdObj));
      let nrObj = {'type' : 'initialize', 'left' : restList[0][0], 'right': restList[0][1]};
      ws.send(JSON.stringify(nrObj));
  }
  ws.on('message', (message) => {
    //console.log(message)
    //ws.send("server echo:" + message);
    let cmdObj = JSON.parse(message);
    if (cmdObj.type == "command") {
      console.log("one user select restaurant ", restList[restIndex][cmdObj.selection][0]);
      voteCount += 1;
      if (cmdObj.selection == 0) {
        idx1 += 1;
      } else {
        idx2 += 1;
      }
      
      
      if (voteCount == clientCount) {
        console.log(idx1);
        console.log(idx2);
        if (idx1 > idx2) {
          let nrObj = {'type' : 'win', 'winner' : restList[restIndex][0][0]}
          broadcast(JSON.stringify(nrObj));
          newList.push(restList[restIndex][0]);
        } else if (idx1 < idx2) {        
            let nrObj = {'type' : 'win', 'winner' : restList[restIndex][1][0]}
            broadcast(JSON.stringify(nrObj));
            newList.push(restList[restIndex][1]); 
          } else {
          if (flag3 == 1) {
            flag3 = 0;
            let min = Math.ceil(0);
            let max = Math.floor(1);
            var rd =  Math.floor(Math.random() * (max - min + 1)) + min;   
            
            let nrObj = {'type' : 'win', 'winner' : restList[restIndex][rd][0]}
            broadcast(JSON.stringify(nrObj));
            newList.push(restList[restIndex][rd]); 
          } else {
            let nrObj = {'type' : 'win', 'winner' : "tie"}
            broadcast(JSON.stringify(nrObj));
            newList.push(restList[restIndex][0]);
            newList.push(restList[restIndex][1]);            
          }
  
        }
        idx1 = 0;
        idx2 = 0;
        
        voteCount = 0;
        if (restIndex < restList.length-1) {
           restIndex += 1;       
        } else if (restIndex == restList.length - 1) {
          total_round += 1;
          console.log("end of round " + total_round);
          let nrObj = {'type' : 'round_end', 'previous_winners' : newList}
          broadcast(JSON.stringify(nrObj));          
          newList = shuffle(newList);
          restList = [];
          var npairs;
          var pick;
          var amount = newList.length;
          console.log("amount: "+amount)
          if (amount == 2 * restList.length) {
              all_tie += 1;
          } else if (amount == 1||(amount == 2 && (newList[0][0] == newList[1][0]))) {
            console.log("End of the Game");
            let a_winner = newList[0];
            let nrObj = {'type' : 'end', 'winner' : a_winner}
            newList = [];
            broadcast(JSON.stringify(nrObj));
          } else if (total_round == max_round){
            let min = Math.ceil(0);
            let max = Math.floor(amount);
            var pick2 =  Math.floor(Math.random() * (max - min)) + min;             
            let a_winner = newList[pick2];
            let nrObj = {'type' : 'end', 'winner' : a_winner}
            newList = [];
            broadcast(JSON.stringify(nrObj));
          } else {
          if (all_tie == 2) {
            flag3 == 1;
          }
          if (amount % 2 == 1) {
            npairs = (amount + 1) / 2;                
            let min = Math.ceil(0);
            let max = Math.floor(amount-1);
            pick =  Math.floor(Math.random() * (max - min)) + min;       
          } else {
            npairs = amount / 2;
          }
          var idx = 0;

          for (var j = 0; j < npairs; j++) {
            var pair = [];
            var obj2 = newList[idx];
            pair[0] = [obj2[0], obj2[1], obj2[2], obj2[3], obj2[4]];
            
            idx += 1;
            if ((amount % 2 == 1) && (idx == amount)){
                idx = pick;
                console.log("random index = " + pick);
            }
            obj2 = newList[idx];
            pair[1] = [obj2[0], obj2[1], obj2[2], obj2[3], obj2[4]];
            
            console.log("pair "+ j);
            console.log(pair);
            
            restList.push(pair);
            idx += 1;
          }
          console.log("newList: ");
          console.log(newList);
          console.log("new RestList: ");
          console.log(restList);
          newList = [];
          restIndex = 0;     
        }
        }
        
        let nrObj = {'type' : 'command', 'info' : restList[restIndex]}
        broadcast(JSON.stringify(nrObj));
      }
    } else if (cmdObj.type == "start") {
      newList = [];
      
      started = 1;
      broadcast(message)
    } else if (cmdObj.type == "startnext") {
      sn_count += 1;
      if (sn_count == clientCount) {
        sn_count = 0;
        let nrObj = {'type' : 'startnext'}
        broadcast(JSON.stringify(nrObj));
      }
    } else if (cmdObj.type == "get") {
      let getObj = JSON.parse(cmdObj.msg);

      yelpclient.search(getObj).then(response => {
      
      var amount = 16;
      for (var i = 0; i < 16; i++) {
        if (response.jsonBody.businesses[i] == undefined) {
          amount = i;
          break;
        }
      }
      let arr3 = [];
      let arr4 = [];
      for (var i = 0; i < amount; i++) {
        arr3[i] = response.jsonBody.businesses[i];
      }
      arr4 = shuffle(arr3);        
      
      console.log(amount);
      let arr1 = [arr4[0].name, arr4[0].image_url, arr4[0].rating, 
                  arr4[0].review_count, arr4[0].price]
      let arr2 = [arr4[1].name, arr4[1].image_url, arr4[1].rating, 
                  arr4[1].review_count, arr4[1].price]
      //let nrObj = {'type' : 'initialize', 'left' : response.jsonBody.businesses[0], 'right' : response.jsonBody.businesses[1]}
      let nrObj = {'type' : 'initialize', 'left' : arr1, 'right' : arr2}
      broadcast(JSON.stringify(nrObj));
        

      for (var i = 0; i < amount; i++) {
        const obj = response.jsonBody.businesses[i];        
        if (i == amount - 1) {
          var list2 = [];
          var npairs;
          var pick;
          if (amount % 2 == 1) {
            npairs = (amount + 1) / 2;
                
            let min = Math.ceil(0);
            let max = Math.floor(amount);
            pick =  Math.floor(Math.random() * (max - min)) + min;
                
          } else {
              npairs = amount / 2;
          }
          var idx = 0;

          for (var j = 0; j < npairs; j++) {
            var pair = [];
            var obj2 = arr4[idx];
            pair[0] = [obj2.name, obj2.image_url, obj2.rating, obj2.review_count, obj2.price];
            
            idx += 1;
            if ((amount % 2 == 1) && (idx == amount)){
                idx = pick;
                console.log("random index = " + pick);
            }
            obj2 = arr4[idx];
            pair[1] = [obj2.name, obj2.image_url, obj2.rating, obj2.review_count, obj2.price];

            list2.push(pair);
            idx += 1;
          }
          restList = list2;
          let cmdObj1 = {
            "type": "getback",
          }
          ws.send(JSON.stringify(cmdObj1));
        }
      }
    }).catch(e => {
      //console.log(e);
    });      
      
    } else {
      broadcast(message)      
    }
  })
  ws.on('close', () => {
    clientCount -=1;
    console.log("a user disconnected. Now ", clientCount, "users connected");
    if (clientCount == 0) {
     started = 0;
     console.log("Not started");
    }
  })
  
  ws.send('connected!')
})

function broadcast(data) {
  //console.log(data);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

//start our server
server.listen(process.env.PORT, () => {
    console.log(`Server started on port ${server.address().port} :)`);
});



const yelp = require('yelp-fusion');
const apiKey = 'gb0tfzd0tW-wa2tnIQ-ULI5FcbF_SStUD0Oy9W3nNhDUKKwK4ZCz6PQWJl-B8mC3Tmj4Rl3oydsjEH8DCVnncx4p-w1PirM82m1SwPZSgli6CnJzLswg01OxXdHQXnYx';
const yelpclient = yelp.client(apiKey);

app.use(express.json());

const fs = require('fs');
app.post('/getCategory', function (request, response) {
  const str = fs.readFileSync("./categories.json");
  const obj = JSON.parse(str);
  //console.log(obj);
  let result = obj.filter(function(item){
    if ((item.parents == "restaurants") && ((!('country_whitelist' in item)) ||   (item.country_whitelist.includes("US"))   )) {
      return true;
    } else {
      return false;
    }
  });
  var arr =[];
  for (let i=0; i<result.length; i++) {
    arr.push(result[i].title);
  }
  //console.log(arr);
  response.send(JSON.stringify(arr));

});