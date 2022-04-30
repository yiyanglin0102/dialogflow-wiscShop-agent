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

async function postBack(isBack) {
  let obj = {}
  obj.back = isBack;
  let request = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-access-token': token
    },
    body: JSON.stringify(obj),
    redirect: 'follow'
  }

  const serverReturn = await fetch('https://cs571.cs.wisc.edu/application', request)
  const serverResponse = await serverReturn.json()
  console.log(serverResponse);

  return serverResponse;

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

async function clearDeleteCart() {
  let request = {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'x-access-token': token
    },
    redirect: 'follow'
  }

  const serverReturn = await fetch('https://cs571.cs.wisc.edu/application/products', request);
  const serverResponse = await serverReturn.json();
  console.log(serverResponse);
  return serverResponse.message;
}

async function getAllProduct(name) {
  let request = {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    redirect: 'follow'
  }

  const serverReturn = await fetch('https://cs571.cs.wisc.edu/products', request)
  const serverResponse = await serverReturn.json()
  // console.log(serverResponse.products);


  for (let i = 0; i < serverResponse.products.length; i++)
  {
    if (serverResponse.products[i].name === name)
    {
      return true;
    }
  }

  return false;
}

async function productNameToID(name) {
  let request = {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    redirect: 'follow'
  }

  const serverReturn = await fetch('https://cs571.cs.wisc.edu/products', request)
  const serverResponse = await serverReturn.json()
  // console.log(serverResponse.products);

  for (let i = 0; i < serverResponse.products.length; i++) {
    if (serverResponse.products[i].name === name) {
      // console.log(serverResponse.products[i].id);
      return serverResponse.products[i].id;
    }

  }
  return null;
}

async function productNameToCategory(name) {
  let request = {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    redirect: 'follow'
  }

  const serverReturn = await fetch('https://cs571.cs.wisc.edu/products', request)
  const serverResponse = await serverReturn.json()

  for (let i = 0; i < serverResponse.products.length; i++) {
    if (serverResponse.products[i].name === name) {
      return serverResponse.products[i].category;
    }
  }
  return null;
}

async function getProducts(productName) {
  let request = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-access-token': token
    },
    redirect: 'follow'
  }

  const serverReturn = await fetch('https://cs571.cs.wisc.edu/products?category=' + productName, request);
  const serverResponse = await serverReturn.json();
  console.log(serverResponse);
  return serverResponse;
}

async function getItemDetails(itemName) {
  let id = await productNameToID(itemName);

  let request = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-access-token': token
    },
    redirect: 'follow'
  }

  const serverReturn = await fetch('https://cs571.cs.wisc.edu/products/' + id, request);
  const serverResponse = await serverReturn.json();
  console.log(serverResponse);
  return serverResponse;
}

async function getItemReviews(itemName) {
  let id = await productNameToID(itemName);

  let request = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-access-token': token
    },
    redirect: 'follow'
  }

  const serverReturn = await fetch('https://cs571.cs.wisc.edu/products/' + id + '/reviews', request);
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

async function getPage() {
  let request = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-access-token': token
    },
    redirect: 'follow'
  }

  const serverReturn = await fetch('https://cs571.cs.wisc.edu/application', request)
  const serverResponse = await serverReturn.json()
  console.log(serverResponse);

  return serverResponse;
}

async function postPage(page) {
  console.log(page);
  let obj = {}
  obj.page = page;
  let request = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-access-token': token
    },
    body: JSON.stringify(obj),
    redirect: 'follow'
  }

  const serverReturn = await fetch('https://cs571.cs.wisc.edu/application', request)
  const serverResponse = await serverReturn.json()

  return serverResponse;
}

async function addProductToCart(id) {
  let obj = {}
  let request = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-access-token': token
    },
    body: JSON.stringify(obj),
    redirect: 'follow'
  }
  const serverReturn = await fetch('https://cs571.cs.wisc.edu/application/products/' + id, request)
  const serverResponse = await serverReturn.json()

  return serverResponse;
}

async function removeProductFromCart(id) {
  let obj = {}
  let request = {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'x-access-token': token
    },
    body: JSON.stringify(obj),
    redirect: 'follow'
  }
  const serverReturn = await fetch('https://cs571.cs.wisc.edu/application/products/' + id, request)
  const serverResponse = await serverReturn.json()

  return serverResponse;
}

app.get("/", (req, res) => res.send("online"));
app.post("/", express.json(), (req, res) => {
  const agent = new WebhookClient({ request: req, response: res });

  async function welcome() {
    agent.add("Hi! Ask me for help!");
  }

  async function login() {
    // You need to set this from `username` entity that you declare in DialogFlow
    username = agent.parameters.username;
    // You need to set this from password entity that you declare in DialogFlow
    password = agent.parameters.password;

    await getToken();
    await deleteMessage();

    if (token === "" || typeof token === 'undefined') {
      await agentMessage("Sorry your password or username may not be correct.")
      return agent.add("Sorry your password or username may not be correct.")
    }
    await userMessage(username);

    let encryptPassword = "";
    for (let i = 0; i < password.length; i++) {
      encryptPassword += "*";
    }

    await userMessage(encryptPassword);


    await agentMessage("Welcome " + username + " !!!")
    agent.add("Welcome " + username + " !!!")
  }

  async function checkCart() {
    await userMessage(agent.query);

    await getToken();
    if (token === "" || typeof token === 'undefined') {
      await agentMessage("Sorry I cannot do it. Can you log in?");
      return agent.add("Sorry I cannot do it. Can you log in?");
    }
    let cartList = await getCart();
    // console.log(cartList);
    cartList = cartList.products;
    let totalPrice = 0;
    let numItem = 0;
    let cartString = "";
    if (cartList.length === 0) {
      await agentMessage("Nnothing found in your cart.");
      return agent.add("Nothing found in your cart.");
    } else {
      for (let index in cartList) {
        let currItem = cartList[index];
        totalPrice += currItem.price * currItem.count;
        numItem += currItem.count;
        cartString += currItem.count + " " + currItem.name + ", ";
      }
      cartString = cartString.substring(0, cartString.length - 2);
      cartString = "You have added " + numItem + " items to the cart which are " + totalPrice + " dollars. " + "The detail product list are: " + cartString + ".";
      await agentMessage(cartString);
      return agent.add(cartString);
    }

  }

  async function clearCart() {
    await userMessage(agent.query);
    await getToken();
    if (token === "" || typeof token === 'undefined') {
      await agentMessage("Sorry I cannot do it. Can you log in?");
      return agent.add("Sorry I cannot do it. Can you log in?");
    }
    let msg = await clearDeleteCart();
    await agentMessage(msg);
    agent.add(msg);
  }

  async function addToCart() {

    let addNumber = agent.parameters.addNumber;
    let name = agent.parameters.Products;

    console.log(name);
    // function - search the name to matched ID 
    let id = await productNameToID(name);

    await userMessage(agent.query);
    await getToken();
    if (token === "" || typeof token === 'undefined') {
      await agentMessage("Sorry I cannot do it. Can you log in?");
      return agent.add("Sorry I cannot do it. Can you log in?");
    }

    if (addNumber === "" || typeof addNumber === 'undefined') {
      await addProductToCart(id);
      await agentMessage("added 1 " + name + " to your cart.");
      return agent.add("added 1 " + name + " to your cart.")
    }
    else {
      for (let i = 0; i < addNumber; i++) {
        await addProductToCart(id);
      }
      await agentMessage("added " + addNumber + " " + name + " to your cart.");
      return agent.add("added " + addNumber + " " + name + " to your cart.");
    }
  }

  async function removeFromCart() {
    let removeNumber = agent.parameters.removeNumber;
    let name = agent.parameters.Products;
    console.log(name);
    let id = await productNameToID(name);
    await userMessage(agent.query);
    await getToken();
    if (token === "" || typeof token === 'undefined') {
      await agentMessage("Sorry I cannot do it. Can you log in?");
      return agent.add("Sorry I cannot do it. Can you log in?");
    }
    if (removeNumber === "" || typeof removeNumber === 'undefined') {
      await agentMessage("please provide number of deletion of " + name);
      return agent.add("please provide number of deletion of " + name);
    }

    for (let i = 0; i < removeNumber; i++) {
      await removeProductFromCart(id);
    }
    await agentMessage("I have removed " + removeNumber + " " + name + " from cart for you.");
    agent.add("I have removed " + removeNumber + " " + name + " from cart for you.");
  }

  async function checkProducts() {
    await userMessage(agent.query)
    let productName = agent.parameters.productName;
    let productList = await getProducts(productName);
    let productString = "";

    for (let index in productList.products) {
      let currItem = productList.products[index];

      productString += (currItem.name + ", ");
    }
    productString = "We offer " + productString.slice(0, productString.length - 2) + ".";
    agent.add(productString);
    await agentMessage(productString);
  }

  async function checkItem() {
    await userMessage(agent.query)
    let itemName = agent.parameters.itemName;
    let itemInfo = await getItemDetails(itemName);
    agent.add("The description of " + itemInfo.name + " is [" + itemInfo.description + "]  The price is " + itemInfo.price + " dollars for each.");
    await agentMessage("The description of " + itemInfo.name + " is [" + itemInfo.description + "]  The price is " + itemInfo.price + " dollars for each.");
  }

  async function checkAverageRating() {
    await userMessage(agent.query)
    let itemName = agent.parameters.itemName;
    let itemInfo = await getItemDetails(itemName);
    let itemReviews = await getItemReviews(itemName);

    let reviewList = itemReviews.reviews;

    let sum = 0;
    for (let i = 0; i < reviewList.length; i++) {
      sum += reviewList[i].stars;
    }

    let average = (sum / reviewList.length).toFixed(2);

    if (reviewList.length === 0) {
      await agentMessage("There is no review for " + itemInfo.name + ".");
      return agent.add("There is no review for " + itemInfo.name + ".");
    }

    if (reviewList.length % 2 == 1) { //odd
      await agentMessage("There is " + reviewList.length + " review for " +
        itemInfo.name + ". The average rating is " + average + ".");
      return agent.add("There is " + reviewList.length + " review for " +
        itemInfo.name + ". The average rating is " + average + ".");
    }

    if (reviewList.length % 2 == 0) { //even
      await agentMessage("There are " + reviewList.length + " reviews for " +
        itemInfo.name + ". The average rating is " + average + ".");
      return agent.add("There are " + reviewList.length + " reviews for " +
        itemInfo.name + ". The average rating is " + average + ".");
    }
  }

  async function checkReviews() {
    await userMessage(agent.query)
    let itemName = agent.parameters.itemName;
    let itemInfo = await getItemDetails(itemName);
    let itemReviews = await getItemReviews(itemName);

    let reviewList = itemReviews.reviews;
    let str = "";
    for (let i = 0; i < reviewList.length; i++) {
      str += ("Review Title: " + "[" + reviewList[i].title + "]. ");
      str += ("Review Content: " + "[" + reviewList[i].text + "]. ");
    }

    agent.add(str);
  }

  async function checkCategory() {
    await userMessage(agent.query);
    let categoryList = await getCategory();
    categoryList = categoryList.categories;
    let categoryString = "We have the following categories: ";
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

  async function goBack() {
    await getToken();
    if (token === "" || typeof token === 'undefined') {
      await agentMessage("Sorry I cannot do it. Can you log in?");
      return agent.add("Sorry I cannot do it. Can you log in?");
    }

    await postBack(true);
    await agentMessage("You are now viewing the previous page");
    agent.add("You are now viewing the previous page");
  }

  async function goPage() {
    await getToken();
    if (token === "" || typeof token === 'undefined') {
      await agentMessage("Sorry I cannot do it. Can you log in?");
      return agent.add("Sorry I cannot do it. Can you log in?");
    }
    let intendPage = agent.parameters.goPage;
    await userMessage(agent.query);
    
    if (await getAllProduct(intendPage)) {
      let ID = await productNameToID(intendPage);
      let categoryName = await productNameToCategory(intendPage);
      await postPage("/" + username + "/" + categoryName + "/products/" + ID);
      await agentMessage("You are now viewing the " + intendPage + " product page of WiscShop!");
      agent.add("You are now viewing the " + intendPage + " product page of WiscShop!");
    }
    else if (intendPage === "signUp") {
      await postPage("/signUp");
      await agentMessage("You are now viewing the sign up page of WiscShop!");
      agent.add("You are now viewing the sign up page of WiscShop!");
    }
    else if (intendPage === "signIn") {
      await postPage("/signIn");
      await agentMessage("You are now viewing the login page of WiscShop!");
      agent.add("You are now viewing the login page of WiscShop!");
    }
    else if (intendPage === "account") {
      await postPage("/" + username);
      await agentMessage("You are now viewing the home page of WiscShop!");
      agent.add("You are now viewing the home page of WiscShop!");
    }
    else if (intendPage === "cart") {
      await postPage("/" + username + "/cart");
      await agentMessage("You are now viewing the cart page of WiscShop!");
      agent.add("You are now viewing the cart page of WiscShop!");
    }
    else if (intendPage === "cart-review") {
      await postPage("/" + username + "/cart-review");
      await agentMessage("You are now viewing the cart reviewing page of WiscShop!");
      agent.add("You are now viewing the cart reviewing page of WiscShop!");
    }
    else if (intendPage === "cart-confirmed") {
      await postPage("/" + username + "/cart-confirmed");
      await agentMessage("You are now viewing the cart-confirmed page of WiscShop!");
      agent.add("You are now viewing the cart-confirmed page of WiscShop!");
    }
    else if (intendPage === "hats") {
      await postPage("/" + username + "/hats");
      await agentMessage("You are now viewing the hat product page of WiscShop!");
      agent.add("You are now viewing the hat product page of WiscShop!");
    }
    else if (intendPage === "leggings") {
      await postPage("/" + username + "/leggings");
      await agentMessage("You are now viewing the leggings product page of WiscShop!");
      agent.add("You are now viewing the leggings product page of WiscShop!");
    }
    else if (intendPage === "bottoms") {
      await postPage("/" + username + "/bottoms");
      await agentMessage("You are now viewing the bottoms product page of WiscShop!");
      agent.add("You are now viewing the bottoms product page of WiscShop!");
    }
    else if (intendPage === "plushes") {
      await postPage("/" + username + "/plushes");
      await agentMessage("You are now viewing the plushes product page of WiscShop!");
      agent.add("You are now viewing the plushes product page of WiscShop!");
    }
    else if (intendPage === "sweatshirts") {
      await postPage("/" + username + "/sweatshirts");
      await agentMessage("You are now viewing the sweatshirts product page of WiscShop!");
      agent.add("You are now viewing the sweatshirts product page of WiscShop!");
    }
    else if (intendPage === "tees") {
      await postPage("/" + username + "/tees");
      await agentMessage("You are now viewing the tees product page of WiscShop!");
      agent.add("You are now viewing the tees product page of WiscShop!");
    }
    else {
      await agentMessage("Sorry can you try it again.");
      agent.add("Sorry can you try it again.");
    }
  }

  let intentMap = new Map();
  intentMap.set("Default Welcome Intent", welcome);
  intentMap.set("Login", login);
  intentMap.set('GetCategory', checkCategory);
  intentMap.set('GetTags', checkTags);
  intentMap.set('GetCart', checkCart);
  intentMap.set('ClearCart', clearCart);
  intentMap.set('AddCart', addToCart);
  intentMap.set('RemoveCart', removeFromCart);
  intentMap.set('GetProducts', checkProducts);
  intentMap.set('GetItem', checkItem);
  intentMap.set('GetAverageRating', checkAverageRating);
  intentMap.set('GetReviews', checkReviews);
  intentMap.set('GoBack', goBack);
  intentMap.set('GoPage', goPage);

  agent.handleRequest(intentMap);
});

app.listen(process.env.PORT || 8080);
