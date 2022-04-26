const express = require("express");
const { WebhookClient } = require("dialogflow-fulfillment");
const app = express();
const fetch = require("node-fetch");
const base64 = require("base-64");

let username = "";
let password = "";
let token = "";

USE_LOCAL_ENDPOINT = false;
// set this flag to true if you want to use a local endpoint
// set this flag to false if you want to use the online endpoint
ENDPOINT_URL = "";
if (USE_LOCAL_ENDPOINT) {
  ENDPOINT_URL = "http://127.0.0.1:5000";
} else {
  ENDPOINT_URL = "https://cs571.cs.wisc.edu";
}


async function agentMessage(message) {
  let obj = {}
  obj.isUser = false;
  obj.text = message;
  console.log(token);
  let request = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-access-token': token
    },
    body: JSON.stringify(obj),
    redirect: 'follow'
  }

  const serverReturn = await fetch('https://cs571.cs.wisc.edu/application/messages', request)
  const serverResponse = await serverReturn.json()
  console.log(serverResponse);

  return serverResponse;
}

async function userMessage(message) {
  let obj = {}
  obj.isUser = true;
  obj.text = message;
  let request = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-access-token': token
    },
    body: JSON.stringify(obj),
    redirect: 'follow'
  }

  const serverReturn = await fetch('https://cs571.cs.wisc.edu/application/messages', request)
  const serverResponse = await serverReturn.json()


  return serverResponse;
}

async function getCart() {
  let request = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-access-token': token
    },
    redirect: 'follow'
  }

  const serverReturn = await fetch('https://cs571.cs.wisc.edu/application/products', request);
  const serverResponse = await serverReturn.json();
  console.log(serverResponse);
  return serverResponse;
}

async function getCategory() {
  let request = {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    redirect: 'follow'
  }

  const serverReturn = await fetch('https://cs571.cs.wisc.edu/categories', request)
  const serverResponse = await serverReturn.json()
  console.log(serverResponse);

  return serverResponse;
}

async function getTags(category) {
  let request = {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    redirect: 'follow'
  }

  const serverReturn = await fetch('https://cs571.cs.wisc.edu/categories/' + category + '/tags', request)
  const serverResponse = await serverReturn.json()


  return serverResponse;
}

async function getToken() {
  let request = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Basic " + base64.encode(username + ":" + password),
    },
  };

  const serverReturn = await fetch(ENDPOINT_URL + "/login", request);
  const serverResponse = await serverReturn.json();
  token = serverResponse.token;
  // console.log(token);
  return token;
}
async function deleteMessage() {
  let request = {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'x-access-token': token
    },
    redirect: 'follow'
  }

  const serverReturn = await fetch('https://cs571.cs.wisc.edu/application/messages', request)
  const serverResponse = await serverReturn.json()

  console.log(serverResponse);
  return serverResponse;
}
app.get("/", (req, res) => res.send("online"));
app.post("/", express.json(), (req, res) => {
  const agent = new WebhookClient({ request: req, response: res });

  async function welcome() {
    await getCart();
    agent.add("Webhook works!");
  }

  async function login() {
    // You need to set this from `username` entity that you declare in DialogFlow
    username = agent.parameters.username
    // You need to set this from password entity that you declare in DialogFlow
    password = agent.parameters.password

    await getToken();
    await deleteMessage();

    if (token === "" || typeof token === 'undefined') {
      await agentMessage("Sorry your password or username may not be correct.")
      return agent.add("Sorry your password or username may not be correct.")
    }
    await userMessage(username);

    await agentMessage("Welcome " + username + " !!!")
    agent.add("Welcome " + username + " !!!")
  }

  async function checkCart() {
    await getToken();
    if (token === "" || typeof token === 'undefined') {
      await agentMessage("Sorry I cannot do it. Can you log in?");
      return agent.add("Sorry I cannot do it. Can you log in?");
    }
    let cartList = await getCart()
    cartList = cartList.products;
    let totalPrice = 0;
    let numItem = 0;
    let cartString = "";
    if (typeof cartList === 'undefined') {
      agent.add("Sorry nothing found in your cart. Please try again!");
      await agentMessage("Sorry nothing found in your cart. Please try again!");
    } else {
      for (let index in cartList) {
        let currItem = cartList[index];
        totalPrice += currItem.price * currItem.count;
        numItem += currItem.count;
        cartString += currItem.count + " " + currItem.name + ", ";
      }
      cartString = cartString.substring(0, cartString.length - 2);
      cartString = "You have added " + numItem + " items to the cart which are " + totalPrice + " dollars. " + "The detail product list are: " + cartString + ".";
      agent.add(cartString);
      await agentMessage(cartString);
    }

  }

  async function checkCategory() {
    await userMessage(agent.query)
    let categoryList = await getCategory();
    categoryList = categoryList.categories;
    let categoryString = "We have the following products: ";
    categoryString += categoryList.join(', ');
    categoryString += ".";
    agent.add(categoryString);
    await agentMessage(categoryString);

  }

  async function checkTags() {
    let currCategory = agent.parameters.category;
    await userMessage(agent.query);
    let tagsList = await getTags(currCategory);
    console.log(tagsList);
    tagsList = tagsList.tags;
    if (typeof tagsList === 'undefined') {
      agent.add("Sorry cannot find any types under the category you provided. Please try again!");
      await agentMessage("Sorry cannot find any types under the category you provided. Please try again!");
    } else {
      let tagString = "We have the following types for the " + currCategory + ": ";
      tagString += tagsList.join(', ');
      tagString += ".";
      agent.add(tagString);
      await agentMessage(tagString);
    }

  }

  let intentMap = new Map();
  intentMap.set("Default Welcome Intent", welcome);
  // You will need to declare this `Login` intent in DialogFlow to make this work
  intentMap.set("Login", login);
  intentMap.set('GetCategory', checkCategory);
  intentMap.set('GetTags', checkTags);
  intentMap.set('GetCart', checkCart);

  agent.handleRequest(intentMap);
});

app.listen(process.env.PORT || 8080);
