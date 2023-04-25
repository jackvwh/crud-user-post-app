"use strict"

/*
    ------ TODO ------

    hardcode change btns to fix empty function call in eventListener

    fix update: when close btn is clicked without updating and the user clicks update on another elements then the first AND second element is updated. stacks up with every element clicked

    fix eventListner RUINING my hide/reveal function -- when hide-btn is clicked show-btn shows on firstChild grid-container and reveal malfunctions

    implement search function - name, titel, mail, phone 

    implement sort() function

    implement validation - how to make uid?? 

    remember to remove html input values
*/
const endpoint = "https://crud-app-kea-default-rtdb.firebaseio.com";

window.addEventListener("load", initApp);

//initialise application 
async function initApp(){
    console.log("Starting");
    // fetch and iterate json array and show items
    iterateData("posts");
    // add eventListener to SHOW ALL USER and SHOW ALL POSTS btns to change create btn
    document.querySelector("#users-btn").addEventListener("click", change_create_btn);
    document.querySelector("#posts-btn").addEventListener("click", change_create_btn);
     //make eventListener for calling either posts or users json
    document.querySelector("#posts-btn").addEventListener("click", function(){iterateData("posts")});
    document.querySelector("#users-btn").addEventListener("click", function(){iterateData("users")});

     // add eventlistner to submit forms 
    //  document.querySelector("#post-update-form").addEventListener("submit", updateSubmit);
    // add eventListener to create-btns
     document.querySelector("#post-create-btn").addEventListener("click", post_createDialog);
     document.querySelector("#user-create-btn").addEventListener("click", user_createDialog);

      // add hidden class to USER CREATE btn
    document.querySelector("#user-create-btn").classList.add("hidden");
}
//iterate data array and show items
async function iterateData(type){
    // fetch json from database
    const dataArray = await loadData(type);
    //empty grid-container
    document.querySelector("#items").innerHTML = "";
    // iterate array and show items
    for (let dataItem of dataArray) {
        displayItem(dataItem, type);
    }
}
//change create btn to show create user OR create post
function change_create_btn(){
        const btn = this;
        //show or hide create-btn
        if (btn.id === "users-btn"){ 
            document.querySelector("#post-create-btn").classList.add("hidden");
            document.querySelector("#user-create-btn").classList.remove("hidden");
        }
        else if (btn.id === "posts-btn"){
            document.querySelector("#post-create-btn").classList.remove("hidden");
            document.querySelector("#user-create-btn").classList.add("hidden");
        }
}
//open POST create dialog
function post_createDialog(){
    document.querySelector("#post-create-dialog").showModal();
    document.querySelector("#post-create-form").addEventListener("submit", createItem);
}
//opens USER create dialog
function user_createDialog(){
    document.querySelector("#user-create-dialog").showModal();
    document.querySelector("#user-create-form").addEventListener("submit", createItem);
}
//create item object and fetch to firebase
function createItem(event){
    event.preventDefault();
    const element = this;
        // decide what to create and send
        if(element.id === "post-create-form"){
            // close dialog
            document.querySelector("#post-create-dialog").close();
            // reset form
            document.querySelector("#post-create-form").reset();
            // remove eventlistener
            document.querySelector("#post-create-form").removeEventListener("submit", createItem);
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
            document.querySelector("#user-create-form").removeEventListener("submit", createItem);
            
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
    const newItem = await fetchItem(id, type);
    displayItem(newItem, type);
}
//fetch with async/await
async function loadData(type){
    console.log("loading data with async/await");
    const response = await fetch(`${endpoint}/${type}.json`);    
    const data = await response.json();
    const dataArray = prepareDataArray(data);
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
        <article class="grid-item" data-object=${dataItem.id} type="posts">
                <h1 class="title">${dataItem.title}</h1>
                <img class="image" src="${dataItem.image}">
                <h1 class="body">${dataItem.body}</h1>
                <button class="update-btn">Update Post</button>
                <button class="delete-btn">Delete Post</button>
                <button class="hide-btn">Hide Post</button>
                <button class="show-btn hidden">Show Post</button>
        </article>
    `;
    return html;
}
//returns HTML user element
function makeHTMLuser(dataItem){ 
    //make for users object
    const html = /*HTML*/ `
        <article class="grid-item" data-object=${dataItem.id} type="users">
                <img class="image" src="${dataItem.image}">
                <h1 class="user_name">${dataItem.name}</h1>
                <h1 class="user_title">${dataItem.title}</h1>
                <h1 class="user_mail">${dataItem.mail}</h1>
                <h1 class="user_phone">${dataItem.phone}</h1>
                <button class="update-btn">Update User</button>
                <button class="delete-btn">Delete User</button>
                <button class="hide-btn">Hide User</button>
                <button class="show-btn hidden">Show User</button>
        </article>
    `;
    return html;
}
//display single item - add eventListener - deleteClicked, user_updateClicked, post_updateDialog, updateSubmit functions
function displayItem(dataItem, type){
    // check for what HTML element to create and insert
        if (type === "posts"){
            // make html post to insert in DOM
            const html = makeHTMLpost(dataItem);
            document.querySelector("#items").insertAdjacentHTML("afterbegin", html);
            // add eventListener to update btn
            document.querySelector("#items article:first-child .update-btn").addEventListener("click", post_updateClicked);
            document.querySelector("#items article:first-child .hide-btn").addEventListener("click", hide_item);
        }
        else if (type === "users"){
             const html = makeHTMLuser(dataItem);
             document.querySelector("#items").insertAdjacentHTML("afterbegin", html);
             // add eventListener to update btn dialog and hide function
            document.querySelector("#items article:first-child .update-btn").addEventListener("click", user_updateClicked);
            document.querySelector("#items article:first-child .hide-btn").addEventListener("click", hide_item);
        };
        // add eventListener to delete btn
        document.querySelector("#items article:first-child .delete-btn").addEventListener("click", deleteClicked);
    
    function deleteClicked(){
        //confirm delete before deleting 
        // if(confirm("Are you sure? This action is irreversible")){
                // delete item from database
            deleteData(dataItem.id, type);
            // remove deleted element from DOM
            const element = this;
            element.parentElement.remove();
        // }
        // else{
        //     //troll user
        //     alert("pussy"); 
        // }    
    }
    function user_updateClicked(){
        //open modal
        document.querySelector("#user-update-dialog").showModal();
        // add eventlistner to submit form 
        document.querySelector("#user-update-form").addEventListener("submit", updateSubmit);
        document.querySelector("#user-update-form-btn").addEventListener("click", function(){replaceOldNodes_User(oldNodes)});
    }
    function post_updateClicked(){
        // insert current object values in update form
        const updateForm = document.querySelector("#post-update-form"); 
            updateForm.title.value = dataItem.title; 
            updateForm.body.value = dataItem.body; 
            updateForm.image.value = dataItem.image; 
            //insert dataID attribute for selection later
            updateForm.setAttribute("data-id", dataItem.id); 
       
        //open modal
        document.querySelector("#post-update-dialog").showModal();
    }
    function updateSubmit(event){
        event.preventDefault();
        updateData(dataItem.id, type);
    }
}
//update data in database
async function updateData(id, type){
    console.log("Updating database");

    if (type === "users"){
        // get user form inputs
        const elements = document.querySelector("#user-update-form");
         //reset form
        document.querySelector("#user-update-form").reset();
        //Close modal
        document.querySelector("#user-update-dialog").close();
        // updated user values to insert in DOM
        const title = elements.title.value;
        const name = elements.name.value;
        const image = elements.image.value;
        const mail = elements.mailvalue;
        const phone = elements.phone.value;
        //update database with updated values
        user_PUT(title, name, image, mail, phone, id);
    }
    else if (type === "posts"){
        // get post form inputs
        const elements = document.querySelector("#post-update-form");
         //reset form
        document.querySelector("#post-update-form").reset();
        //Close modal
        document.querySelector("#post-update-dialog").close();
        // updated post values to insert in DOM
        const title = elements.title.value;
        const body = elements.body.value;
        const image = elements.image.value;
        //update database with updated values
        post_PUT(title, body , image, id);
    }
}
//replace old post nodes to updated post values 
function replaceOldNodes_Post(oldNodes){
    console.log("Replacing old POST nodes");
    // get HTML nodes to replace
    // const oldNodes = this.parentElement.childNodes;
    // get form inputs values
    const elements = document.querySelector("#post-update-form");
    // change specific old nodes to updated values
    oldNodes[1].innerHTML = elements.title.value;
    oldNodes[3].src = elements.image.value;
    oldNodes[5].innerHTML = elements.body.value;  
}
//replace old user nodes to updated user values 
function replaceOldNodes_User(oldNodes){
    console.log("Replacing old USER nodes");
    // get form inputs values
    const elements = document.querySelector("#user-update-form");
    // change specific old nodes to updated values
    oldNodes[1].src = elements.image.value;
    oldNodes[3].innerHTML = elements.title.value;
    oldNodes[5].innerHTML = elements.name.value;  
    oldNodes[7].innerHTML = elements.mail.value;  
    oldNodes[9].innerHTML = elements.mail.value;  
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
// fetch reguest to PUT updated data
const response = await fetch(`${endpoint}/users/${id}.json`, 
    { 
            method: "PUT", 
            body: dataAsJson 
    });
    if (response.ok){
        console.log("USER Updated succesfully");
        // alert("USER update succesfull");
        insertNewItem
    }
    else if(!response.ok){
        // show error message and reload page
        // alert("ERROR: USER Update NOT succesfull ");
        iterateData("users");
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
        // alert("POST update succesfull");
    }
    else if(!response.ok){
        // show error message and reload page
        // alert("ERROR: POST Update NOT succesfull ");
        iterateData("posts");
    }
}
//make USER object and POST to database
async function user_POST(title, name, image, mail, phone){
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
        if (response.ok){
            console.log("CREATED USER succesfully");
            // alert("USER created succesfull");
        }
        else if(!response.ok){
            // show error message and reload page
            // alert("ERROR: USER CREATE NOT succesfull ");
            iterateData("users");
        }
    // response with new object id/name
    const data = await response.json();
    // make get request to input specific element into DOM from response id
    insertNewItem(data.name, "users");
  
}
//make post object and POST to databate
async function post_POST(title, body, image){
    //create new object
    const newPost = { 
        title: `${title}`, 
        body: `${body}`,
        image: `${image}`,
    };
     // make javaScript object to Json object
    const dataAsJson = JSON.stringify(newPost);
    // fetch reguest to POST item
    const response = await fetch(`${endpoint}/posts.json`, 
        { 
                method: "POST", 
                body: dataAsJson 
        });
        if (response.ok){
            console.log("CREATED POST succesfully");
            // alert("POST CREATE succesfull");
        }
        else if(!response.ok){
            // show error message and reload page
            // alert("ERROR: POST CREATE NOT succesfull ");
            iterateData("posts");
        }

    // response with new object id/name
    const data = await response.json();
    // make get request to input specific element into DOM from response id
    insertNewItem(data.name, "posts");
}
//fetch single item from database
async function fetchItem(id, type){
    //get updated or new item from database
    const response =  await fetch(`${endpoint}/${type}/${id}.json`);
    const updatedData = await response.json();
    return updatedData;
}
//deletes item from database
async function deleteData(id, type) {
    const url = `${endpoint}/${type}/${id}.json`;
    const response = await fetch(url, { method: "DELETE" });
    if (response.ok){
        console.log("Item was succefully deleted");
        // alert("ITEM WAS SUCCESFULLY DELETED");
    }
    else if(!response.ok){
        // show error message and reload page
        alert("ERROR: error deleting ITEM")
    }
}
//hide object information
function hide_item(){
    // get item children elements
    const elements = this.parentElement.children;
    console.log(elements, this.parentElement);
    //add hidden class to all children elements except last (.show-btn)
    for (let i = (elements.length -1); i >= 0; i--){
        elements[i].classList.add("hidden");    
    }
    // remove eventListener from hide btn
    this.removeEventListener("click", hide_item);

    // add eventListner to show-btn to reveal item
    document.querySelector(".show-btn").addEventListener("click", reveal_item);
    document.querySelector(".show-btn").classList.remove("hidden");
}
//reveal object information
function reveal_item(){
    //  remove eventListener from hide elements
    this.removeEventListener("click", reveal_item);
    // get item children elements
    const elements = this.parentElement.children;
    console.log(elements, this.parentElement);
    //remove hidden class from all children elements except last (.show-btn)
    for (let i = (elements.length -1); i >= 0; i--){
        elements[i].classList.remove("hidden");    
    }
    // add .hidden to show-btn again
     document.querySelector(".show-btn").classList.add("hidden");

     // add eventListener to hide-btn again
     document.querySelector(".hide-btn").addEventListener("click", hide_item);
}



//display POST in DOM 
function display_POST(dataItem){
    // make html post to insert in DOM
    const html = makeHTMLpost(dataItem);
    document.querySelector("#items").insertAdjacentHTML("afterbegin", html);
    // add eventListener to update btn
    document.querySelector("#items article:first-child .update-btn").addEventListener("click", post_updateClicked);
    //add eventListener to hide-btn
    document.querySelector("#items article:first-child .hide-btn").addEventListener("click", hide_item);
    // add eventListener to delete btn
    document.querySelector("#items article:first-child .delete-btn").addEventListener("click", deleteClicked);
}
//display USER in DOM 
function display_USER(dataItem){
    // make html post to insert in DOM
    const html = makeHTMLpost(dataItem);
    document.querySelector("#items").insertAdjacentHTML("afterbegin", html);
    // add eventListener to update btn
    document.querySelector("#items article:first-child .update-btn").addEventListener("click", user_updateClicked);
    //add eventListener to hide-btn
    document.querySelector("#items article:first-child .hide-btn").addEventListener("click", hide_item);
    // add eventListener to delete btn
    document.querySelector("#items article:first-child .delete-btn").addEventListener("click", deleteClicked);
}
