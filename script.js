"use strict"

/*
    fix update close btn still calling updateData when clicked and then updated another item. very strange
    implement validation
*/
const endpoint = "https://crud-app-kea-default-rtdb.firebaseio.com";

window.addEventListener("load", initApp);

// initialise application 
async function initApp(){
    console.log("Starting");
    //insert create post button
    post_Create_Btn();
    user_Create_Btn();
    // fetch and iterate json array and show items
    loopData("posts");
   
     //make eventListener for calling either posts or users json
    document.querySelector("#posts-btn").addEventListener("click", function(){loopData("posts")});
    document.querySelector("#users-btn").addEventListener("click", function(){loopData("users")});
}
// open POST create dialog
function post_createDialog(){
    document.querySelector("#post-create-dialog").showModal();
    document.querySelector("#post-create-form").addEventListener("submit", createData);
}
// opens USER create dialog
function user_createDialog(){
    document.querySelector("#user-create-dialog").showModal();
    document.querySelector("#user-create-form").addEventListener("submit", createData);
}
// insert post-create-button
function post_Create_Btn(){
    const button = /*HTML*/ `
    <input type="button" id="post-create-btn" value="Create Post">
    `;
    document.querySelector("#create-btns").insertAdjacentHTML("beforeend", button);
    document.querySelector("#post-create-btn").addEventListener("click", post_createDialog);
}
// insert user-create-button
function user_Create_Btn(){
    const button = /*HTML*/ `
    <input type="button" id="user-create-btn" value="Create User">
    `;
    document.querySelector("#create-btns").insertAdjacentHTML("beforeend", button);
    document.querySelector("#user-create-btn").addEventListener("click", user_createDialog);
}
// create data object and fetch to firebase
function createData(event){
    event.preventDefault();
    console.log(event);
    const element = this;
    console.log(element.id);

        // decide what to create and send
        if(element.id === "post-create-form"){
            // close dialog
            document.querySelector("#post-create-dialog").close();
            // reset form
            document.querySelector("#post-create-form").reset();
            // remove eventlistener
            document.querySelector("#post-create-form").removeEventListener("submit", createData);
            // post values
            const title = event.target.title.value;
            const image = event.target.image.value;
            const body = event.target.body.value;
          
            post_POST(title, body, image);
        }

        else if (element.id === "user-create-form"){
            // close dialog
            document.querySelector("#user-create-dialog").close();
             // reset form
             document.querySelector("#user-create-form").reset();
            // remove eventlistener
            document.querySelector("#user-create-form").removeEventListener("submit", createData);
            
            // user values
            const name = event.target.name.value;
            const title = event.target.title.value;
            const image = event.target.image.value;
            const mail = event.target.mail.value;
            const phone = event.target.phone.value;

            user_POST(title, name, image, mail, phone);
        } 
}
//fetch and insert new item
async function insertNewItem(id, type){
    console.log("inserting new item");
    const newItem = await fetchNewOrUpdatedItem(id, type);
    console.log("newItem: ", newItem);
    displayItem(newItem, type);
}    
// iterate data array and show items
async function loopData(type){
        //remove and add btn
        if (type === "users"){
            document.querySelector("#post-create-btn").remove()
            user_Create_Btn();
        }
        else if (type === "posts"){
            document.querySelector("#user-create-btn").remove()
            post_Create_Btn()
        }

    // fetch json from database
    const dataArray = await loadData(type);
    //empty grid-container
    document.querySelector("#items").innerHTML = "";
    console.log("looping data");
    for (let dataItem of dataArray) {
        displayItem(dataItem, type);
    }
}
// fetch with async/await
async function loadData(type){
    console.log(type);
    console.log("loading data with async/await");
    const response = await fetch(`${endpoint}/${type}.json`);    
    const data = await response.json();
    const dataArray = prepareDataArray(data);
    console.log(dataArray);
    return dataArray;
}
//make Json object to object array
function prepareDataArray(dataObject){
    const dataArray = [];
    for (let key in dataObject){
        const post = dataObject[key];
        post.id = key;
        dataArray.push(post)
    }
    return dataArray;
}
//returns HTML post element
function makeHTMLpost(dataItem){
    const html = /*HTML*/ `
        <article class="grid-item">
            <h1 class="title">${dataItem.title}</h1>
            <img class="image" src="${dataItem.image}">
            <h1 class="body">${dataItem.body}</h1>
            <input type="button" class="update-btn" value="Update">
            <input type="button" class="delete-btn" value="Delete">
        </article>
    `;
    return html;
}
//returns HTML user element
function makeHTMLuser(dataItem){ 
    console.log("MAKE User html data: ", dataItem)
    //make for users object
    const html = /*HTML*/ `
        <article class="grid-item">
            <img class="image" src="${dataItem.image}">
            <h1 class="user_name">${dataItem.name}</h1>
            <h1 class="user_title">${dataItem.title}</h1>
            <h1 class="user_mail">${dataItem.mail}</h1>
            <h1 class="user_phone">${dataItem.phone}</h1>
            <input type="button" class="update-btn" value="Update">
            <input type="button" class="delete-btn" value="Delete">
        </article>
    `;
    return html;
}
// display single item - add eventListener - controls delete fnc and update fnc
function displayItem(dataItem, type){
    // console.log("item is :", dataItem);

        if (type === "posts"){
            // make html post to insert in DOM
            const html = makeHTMLpost(dataItem);
            document.querySelector("#items").insertAdjacentHTML("afterbegin", html);
            // add eventListener to update btn
            document.querySelector("#items article:first-child .update-btn").addEventListener("click", post_updateDialog);
        }
        else if (type === "users"){
             const html = makeHTMLuser(dataItem);
             document.querySelector("#items").insertAdjacentHTML("afterbegin", html);
             // add eventListener to update btn
            document.querySelector("#items article:first-child .update-btn").addEventListener("click", user_updateDialog);
        };
        // add eventListener to delete btn
        document.querySelector("#items article:first-child .delete-btn").addEventListener("click", deleteClicked);
    
    function deleteClicked(){
        console.log("deleting item");
        // delete item from database
        deleteData(dataItem.id, type);
         // remove deleted element from DOM
         const element = this;
         element.parentElement.remove();
    }
    function user_updateDialog(){
        // get HTML nodes to replace
        const oldNodes = this.parentElement.childNodes;
        console.log("old nodes. ", oldNodes);
        //open modal
        document.querySelector("#user-update-dialog").showModal();
        // add eventlistner to submit form 
        document.querySelector("#user-update-form").addEventListener("submit", updateSubmit);
        document.querySelector("#user-update-form-btn").addEventListener("click", function(){replaceOldNodes_User(oldNodes)})
    }
    function post_updateDialog(){
        // get HTML nodes to replace
        const oldNodes = this.parentElement.childNodes;
        console.log("old nodes. ", oldNodes);
        //open modal
        document.querySelector("#post-update-dialog").showModal();
        // add eventlistner to submit form 
        document.querySelector("#post-update-form").addEventListener("submit", updateSubmit);
        document.querySelector("#post-update-form-btn").addEventListener("click", function(){replaceOldNodes_Post(oldNodes)})
    }

    function updateSubmit(event){
        event.preventDefault();
        updateData(dataItem.id, type);
    }
}
// replace old post nodes to updated post values 
function replaceOldNodes_Post(oldNodes){
    console.log("Replacing old POST nodes");
    console.log("oldData - ", oldNodes);

    // get form inputs values
    const elements = document.querySelector("#post-update-form");
    console.log("new elements nodes: ", elements);
    // change specific old nodes to updated values
    oldNodes[1].innerHTML = elements.title.value;
    oldNodes[3].src = elements.image.value;
    oldNodes[5].innerHTML = elements.body.value;  
}
// replace old user nodes to updated user values 
function replaceOldNodes_User(oldNodes){
    console.log("Replacing old USER nodes");
    console.log("oldData - ", oldNodes);

    // get form inputs values
    const elements = document.querySelector("#user-update-form");
    // change specific old nodes to updated values
    oldNodes[1].src = elements.image.value;
    oldNodes[3].innerHTML = elements.title.value;
    oldNodes[5].innerHTML = elements.name.value;  
    oldNodes[7].innerHTML = elements.mail.value;  
    oldNodes[9].innerHTML = elements.mail.value;  
}
// update data
async function updateData(id, type){
    console.log("Updating database");
    if (type === "users"){
        // get user form inputs
        const elements = document.querySelector("#user-update-form");
         //reset form
        document.querySelector("#user-update-form").reset();
        //Close modal
        document.querySelector("#user-update-dialog").close();

        const title = elements.title.value;
        const name = elements.name.value;
        const image = elements.image.value;
        const mail = elements.mailvalue;
        const phone = elements.phone.value;

        user_PUT(title, name, image, mail, phone, id);
    }
    else if (type === "posts"){
        // get post form inputs
        const elements = document.querySelector("#post-update-form");
         //reset form
        document.querySelector("#post-update-form").reset();
        //Close modal
        document.querySelector("#post-update-dialog").close();

        const title = elements.title.value;
        const body = elements.body.value;
        const image = elements.image.value;

        post_PUT(title, body , image, id);
    }
}
//make user object and PUT to database
async function user_PUT(title, name, image, mail, phone, id){
        //create new object
        const newUser = { 
            title: `${title}`, 
            name: `${name}`,
            image: `${image}`,
            mail: `${mail}`,
            phone: `${phone}`,
        };
    // make javaScript object to Json object
    const dataAsJson = JSON.stringify(newUser);
    console.log("JSON object being POSTed is: ", dataAsJson);
    // fetch reguest to PUT updated data
    const response = await fetch(`${endpoint}/users/${id}.json`, 
        { 
                method: "PUT", 
                body: dataAsJson 
        });
        if (response.ok){
            console.log("Updated USER succesfully");
            // alert("Update succesfull");
        }
}
//make post object and PUT to database
async function post_PUT(title, body, image, id){
        //create new object
        const newPost = { 
            title: `${title}`, 
            body: `${body}`,
            image: `${image}`,
        };
    // make javaScript object to Json object
    const dataAsJson = JSON.stringify(newPost);
    // fetch reguest to PUT updated data
    const response = await fetch(`${endpoint}/posts/${id}.json`, 
        { 
                method: "PUT", 
                body: dataAsJson 
        });
        if (response.ok){
            console.log("Updated POST succesfully");
            // alert("Update succesfull");
        }
}
//make USER object and POST to database
async function user_POST(title, name, image, mail, phone){
    console.log("Making USER object ");
    //create new object
    const newUser = { 
        title: `${title}`, 
        name: `${name}`,
        image: `${image}`,
        mail: `${mail}`,
        phone: `${phone}`,
    };
     // make javaScript object to Json object
    const dataAsJson = JSON.stringify(newUser);
    // fetch reguest to POST item
    const response = await fetch(`${endpoint}/users.json`, 
        { 
                method: "POST", 
                body: dataAsJson 
        });
    // response with new object id/name
    const data = await response.json();
        console.log("response id/name: ", data.name);
    // make get request to input specific element into DOM from response id
    insertNewItem(data.name, "users");
  
}
// make post object and POST to databate
async function post_POST(title, body, image){
    console.log("Making POST object");
    //create new object
    const newPost = { 
        title: `${title}`, 
        body: `${body}`,
        image: `${image}`,
    };
     // make javaScript object to Json object
    const dataAsJson = JSON.stringify(newPost);
    console.log("JSON object being POSTed is: ", dataAsJson);
    // fetch reguest to POST item
    const response = await fetch(`${endpoint}/posts.json`, 
        { 
                method: "POST", 
                body: dataAsJson 
        });

    // response with new object id/name
    const data = await response.json();
    // make get request to input specific element into DOM from response id
    insertNewItem(data.name, "posts");
}
// fetch single item from database
async function fetchNewOrUpdatedItem(id, type){
    //get updated or new item from database
    const response =  await fetch(`${endpoint}/${type}/${id}.json`);
    const updatedData = await response.json();
    console.log("updated data: ", updatedData);
    return updatedData;
}
// deletes item from database
async function deleteData(id, type) {
    const url = `${endpoint}/${type}/${id}.json`;
    const res = await fetch(url, { method: "DELETE" });
    if (res.ok){
        console.log("Item was succefully deleted");
    }
}
