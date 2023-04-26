"use strict"

/*
    ------ TODO ------
    
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

     //make eventListener for calling either posts or users json --- the ONLY empty function calls
    document.querySelector("#posts-btn").addEventListener("click", function(){iterateData("posts")});
    document.querySelector("#users-btn").addEventListener("click", function(){iterateData("users")});

    // add eventlistener to update submit forms 
     document.querySelector("#post-update-form").addEventListener("submit", updateData);
     document.querySelector("#user-update-form").addEventListener("submit", updateData);

    // add eventListener to create-btns
     document.querySelector("#post-create-btn").addEventListener("click", post_createDialog);
     document.querySelector("#user-create-btn").addEventListener("click", user_createDialog);

     // add eventListener to delete-btn dialog
     document.querySelector("#form-delete").addEventListener("submit", deleteData);
    
      // add hidden class to USER CREATE btn
    document.querySelector("#user-create-btn").classList.add("hidden");

    // add eventListener to toast message
    document.querySelector("#m_toast").addEventListener("click", function(){this.classList.add("hidden")});
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
//fetch with async/await
async function loadData(type){
    console.log("loading data with async/await");
    const response = await fetch(`${endpoint}/${type}.json`);    
    const data = await response.json();
    const dataArray = prepareDataArray(data);
    return dataArray;
}
// show toast message 
function mtoast(msg) {
    const toast = document.getElementById("m_toast");
    toast.innerHTML = msg;
    toast.classList.remove("hidden");
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
        <article class="grid-item" data-id=${dataItem.id} title="posts">
                <h1 class="title">${dataItem.title}</h1>
                <img class="image" src="${dataItem.image}">
                <h1 class="body">${dataItem.body}</h1>
                <button class="update-btn">Update Post</button>
                <button class="delete-btn">Delete Post</button>
                <button class="hide-btn">Hide Post</button>
                <button class="show-btn autofocus hidden">Show Post</button>
        </article>
    `;
    return html;
}
//returns HTML user element
function makeHTMLuser(dataItem){ 
    //make for users object
    const html = /*HTML*/ `
        <article class="grid-item" data-id=${dataItem.id} title="users">
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
//display single item - add eventListeners - controls deleteClicked, user_updateClicked, post_updateDialog
function displayItem(dataItem, type){
    // check for what HTML element to create and insert
        if (type === "posts"){
            // make html post to insert in DOM
            const html = makeHTMLpost(dataItem);
            document.querySelector("#items").insertAdjacentHTML("afterbegin", html);
            // add eventListener to update btn and hide functionality
            document.querySelector("#items article:first-child .update-btn").addEventListener("click", post_updateClicked);
            document.querySelector("#items article:first-child .hide-btn").addEventListener("click", hide_item);
            document.querySelector("#items article:first-child .show-btn").addEventListener("click", reveal_item);
        }
        else if (type === "users"){
             const html = makeHTMLuser(dataItem);
             document.querySelector("#items").insertAdjacentHTML("afterbegin", html);
             // add eventListener to update btn dialog and hide functionality
            document.querySelector("#items article:first-child .update-btn").addEventListener("click", user_updateClicked);
            document.querySelector("#items article:first-child .hide-btn").addEventListener("click", hide_item);
            document.querySelector("#items article:first-child .show-btn").addEventListener("click", reveal_item);

        };
        // add eventListener to delete btn
        document.querySelector("#items article:first-child .delete-btn").addEventListener("click", deleteClicked);
        
    function deleteClicked(){
        // get title value to indicate TYPE of data to delete
        const type = this.parentElement.title;
        document.querySelector("#dialog-delete-title").textContent = dataItem.title;
        // set attributes values for further identification
        document.querySelector("#form-delete").setAttribute("title", type);
        document.querySelector("#form-delete").setAttribute("data-id", dataItem.id);
        //open modal
        document.querySelector("#dialog-delete").showModal();

    }
    function user_updateClicked(){
          // get title value to indicate TYPE of data to update
          const type = this.parentElement.title;

          const user_updateForm = document.querySelector("#user-update-form"); 
           // insert current object values in update form
          user_updateForm.name.value = dataItem.name; 
          user_updateForm.title.value = dataItem.title; 
          user_updateForm.image.value = dataItem.image; 
          user_updateForm.mail.value = dataItem.mail; 
          user_updateForm.phone.value = dataItem.phone; 
          //insert dataID attribute for identification later
          user_updateForm.setAttribute("data-id", dataItem.id); 
          user_updateForm.setAttribute("title", type);
          //open modal
          document.querySelector("#user-update-dialog").showModal();
    }
    function post_updateClicked(){
         // get title value to indicate TYPE of data to update
        const type = this.parentElement.title;

        const post_updateForm = document.querySelector("#post-update-form"); 
         // insert current object values in update form
        post_updateForm.title.value = dataItem.title; 
        post_updateForm.body.value = dataItem.body; 
        post_updateForm.image.value = dataItem.image; 
        //insert dataID attribute for identification later
        post_updateForm.setAttribute("data-id", dataItem.id); 
        post_updateForm.setAttribute("title", type);
        //open modal
        document.querySelector("#post-update-dialog").showModal();
    }
}
//find and return html element
function find_item_by_data_id(id){
    // get all items currently displayed 
    const items = document.getElementsByClassName("grid-item");
        // iterate and check id and return element with matching id
        for (let i = 0; i < items.length; i++){
            if (items[i].getAttribute("data-id") === id){
                const html_element = items[i];
                return html_element;
            }
        }
}
//update data in database
async function updateData(event){
    event.preventDefault();
    //values for identification
    const form = event.target;
    const id = form.getAttribute("data-id");
    const type = form.getAttribute("title"); // data type to update murder me
 
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
        const mail = elements.mail.value;
        const phone = elements.phone.value;
        //update database with updated values
        user_PUT(title, name, image, mail, phone, id);

        // change old nodes to updated info
        const nodes_to_update = find_item_by_data_id(id).childNodes;
        update_USER_info(nodes_to_update);

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

        // change old nodes to updated info
        const nodes_to_update = find_item_by_data_id(id).childNodes;
        update_POST_info(nodes_to_update);
    }
}
//replace old post nodes to updated post values 
function update_POST_info(oldNodes){
    // get form inputs values
    const elements = document.querySelector("#post-update-form");
    // change specific old nodes to updated values
    oldNodes[1].innerHTML = elements.title.value;
    oldNodes[3].src = elements.image.value;
    oldNodes[5].innerHTML = elements.body.value;  
}
//replace old user nodes to updated user values 
function update_USER_info(oldNodes){
    // get form inputs values
    const elements = document.querySelector("#user-update-form");
    // change specific old nodes to updated values
    oldNodes[1].src = elements.image.value;
    oldNodes[3].innerHTML = elements.title.value;
    oldNodes[5].innerHTML = elements.name.value;  
    oldNodes[7].innerHTML = elements.mail.value;  
    oldNodes[9].innerHTML = elements.phone.value;  
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
        mtoast("USER SUCCESSFULLY CREATED");
    }
    else if(!response.ok){
        // show error message and reload page
        alert("ERROR: USER Update NOT succesfull ");
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
        mtoast("POST SUCCESSFULLY UPDATED");
    }
    else if(!response.ok){
        // show error message and reload page
        alert("ERROR: POST Update NOT succesfull ");
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
            mtoast("USER SUCCESSFULLY CREATED");
        }
        else if(!response.ok){
            // show error message and reload page
            alert("ERROR: USER CREATE NOT succesfull ");
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
            mtoast("POST SUCCESSFULLY CREATED");
        }
        else if(!response.ok){
            // show error message and reload page
            alert("ERROR: POST CREATE NOT succesfull ");
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
async function deleteData(event) {
    //get values to id item to delete in database
    const id = event.target.getAttribute("data-id");
    const type = event.target.getAttribute("title"); //data type WEIRD I KNOW sry
    // delete item globally
    const url = `${endpoint}/${type}/${id}.json`;
    const response = await fetch(url, { method: "DELETE" });
        if (response.ok){
            // delete item locally
            const element_to_delete = find_item_by_data_id(id);
            element_to_delete.remove();
        }
        else if(!response.ok){
            alert("ERROR: error deleting ITEM")
        }
}
//change create btn to show create USER or create POST
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
//hide object information
function hide_item(){
    // get item children elements
    const elements = this.parentElement.children;
    //add hidden class to all children elements except last (.show-btn)
    for (let i = (elements.length -1); i >= 0; i--){
        elements[i].classList.add("hidden");    
    }
    // remove hidden
    elements[elements.length-1].classList.remove("hidden");
}
//reveal object information
function reveal_item(){
    // get children elements from html
    const elements = this.parentElement.children;
    //remove hidden class from all children elements except last (.show-btn)
    for (let i = (elements.length -1); i >= 0; i--){
        elements[i].classList.remove("hidden");    
    }
    // add .hidden to show-btn again
    elements[elements.length -1].classList.add("hidden");
}