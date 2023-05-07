"use strict"

/*    ------ TODO ------
   
    MAYBE replace html element attribute "title" to "data-type" for better readability

FOR TESTING: 
https://images.unsplash.com/photo-1642049888276-9c9f0a1a8758?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwyOTA4MTB8MHwxfGFsbHwyfHx8fHx8Mnx8MTY0MjA3NTAwMQ&ixlib=rb-1.2.1&q=80&w=400
something@mail.com

*/
const items = [];
const endpoint = "https://crud-app-kea-default-rtdb.firebaseio.com";

window.addEventListener("load", initApp);

//initialise application 
async function initApp(){

    // fetch and iterate json array and show items
    iterateData("posts");

    add_eventListeners();
    
    // add hidden class to USER CREATE btn
    document.querySelector("#user-create-btn").classList.add("hidden");

}
function add_eventListeners(){
    // add eventListener to SHOW ALL USER and SHOW ALL POSTS btns to change create btn
    document.querySelector("#users-btn").addEventListener("click", change_UI);
    document.querySelector("#posts-btn").addEventListener("click", change_UI);

     //make eventListener for calling either post OR user data --- the ONLY empty function calls
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
    
    // add eventListener to search
    document.querySelector("#search-input").addEventListener("keyup", search_data);

    // add eventListener to sort selection
    document.querySelector("#sort-selecting").addEventListener("change", sort_data_by_choice);
    // add eventListener to toast message
    document.querySelector("#response-message").addEventListener("click", function(){this.classList.add("hidden")});
}
// iterate data array and show items
async function iterateData(type){
    // fetch json from database
    const dataArray = await loadData(type);

    // reset global array items[] for new item data
    items.splice(0, items.length)
    //empty grid-container
    document.querySelector("#items").innerHTML = "";

    // iterate array and show items
    for (let i = 0; i < dataArray.length; i++){
        displayItem(dataArray[i], type);
        // push item to global array items[] for later use
        items[i] = dataArray[i];
    }
}

// --------------------------- FETCH/LOAD DATA FUNCTIONS -------------
// fetch all items with async/await
async function loadData(type){
    const response = await fetch(`${endpoint}/${type}.json`);    
    const data = await response.json();
    const dataArray = prepareDataArray(data);
    return dataArray;
}
// convert Json object to object array
function prepareDataArray(dataObject){
    const dataArray = [];
    for (let key in dataObject){
        const post = dataObject[key];
        post.id = key;
        dataArray.push(post)
    }
    return dataArray;
}
// fetch single item from database
async function fetchItem(id, type){
    //get updated or new item from database
    const response =  await fetch(`${endpoint}/${type}/${id}.json`);
    const updatedData = await response.json();
    return updatedData;
}

// --------------------------- SEARCH / SORT FUNCTIONS --------------------
// search data 
function search_data(){
    // search INPUT string
    const searchInput = document.querySelector("#search-input").value;
    // clear search input field ---- DISABLED WHEN "keyup" EVENT ACTIVE
    // document.querySelector("#search-input").value = "";

    // make Regular Expression search VALUE - i for case insensetiv
    const searchValue = new RegExp(`${searchInput}`, "i")
    
    //get currently loaded data-type from first html element title attribute
    const type = document.querySelector(".grid-container").children[0].title;  

    // ------------ SEARCH WITH .FILTER() FROM GLOBAL ARRAY items[] -----------------
    const search_results = items.filter(search_item);
        // search through json object properties 
        function search_item(dataItem){
            for (let key in dataItem){
                if (searchValue.test(dataItem[key])){
                    return dataItem;
                }  
            }  
        }  
    // SHOW search result if any
    if (search_results.length >= 1){
        //empty grid-container
        document.querySelector("#items").innerHTML = ""; 
        // iterate array and show items
        for (let dataItem of search_results) {
            displayItem(dataItem, type);
        }
        // ----------------------- NOT ACTIVE WHEN "KEYUP" EVENT IS ACTIVE -------------------
        // response_message("SEARCH RESULTS FOR ---> " + `${searchInput}`.toLocaleUpperCase());
    }
    else {
        response_message("NO SEARCH RESULTS");
    }
}
// find and return html element
function find_html_element_by_id(id){
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
// sort data by title, firstname or lastname
function sort_data_by_choice(event){
    // event.preventDefault();
    const choice = event.target.value;

    //get currently loaded data-type from first html element title attribute
    const type = document.querySelector(".grid-container").children[0].title;  

    if (choice === "title"){
        items.sort(compareTitle);
        //reverse array for displaying correctly since I add html with first-child and beforebegin
        items.reverse();
        //empty grid-container
        document.querySelector("#items").innerHTML = ""; 
        // iterate array and show items
        for (let dataItem of items) {
            displayItem(dataItem, type);
        }
    }
    else if (choice === "first-name"){
        // sort items array by first name
        items.sort(compare_firstName);
        //reverse array for displaying correctly since I add html with first-child and beforebegin
        items.reverse();
        //empty grid-container
        document.querySelector("#items").innerHTML = ""; 
        // iterate array and show items
        for (let dataItem of items) {
            displayItem(dataItem, type);
        }
    }
    else if (choice === "last-name"){
        // sort items array by first name
        items.sort(compare_lastName);
        //reverse array for displaying correctly since I add html with first-child and beforebegin
        items.reverse();
        //empty grid-container
        document.querySelector("#items").innerHTML = ""; 
        // iterate array and show items
        for (let dataItem of items) {
            displayItem(dataItem, type);
        }
    }
    // -------------------------------- COMPARE FUNCTIONS ------------------------

    function compareTitle(user1, user2) {
        return user1.title.localeCompare(user2.title);
    };
    function compare_firstName(user1, user2) {
        return user1.name.localeCompare(user2.name);
    };
    function compare_lastName(user1, user2) {
        // split and get last name only
        const split_user1 = user1.name.split(" ");
        const split_user2 = user2.name.split(" ");
        const user1_lastName = split_user1.pop();
        const user2_lastName = split_user2.pop();
        return user1_lastName.localeCompare(user2_lastName);
    };
}

// ------------------------------ DISPLAY DATA FUNCTIONS ---------------------
//display single item - add eventListeners - controls deleteClicked, user_updateClicked, post_updateCLicked
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

        }
        else {
            alert("------------> DATA ERROR <-----------");
        }
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
                <h1 class="user_title">${dataItem.title}</h1>
                <h1 class="user_name">${dataItem.name}</h1>
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
//fetch and insert new item
async function insertNewItem(id, type){
    const newItem = await fetchItem(id, type);
    displayItem(newItem, type);
}

//------------------------------- UPDATE FUNCTIONS ----------------
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
        response_message("USER SUCCESSFULLY UPDATED");
       // find element nodes to update
       const nodes_to_update = find_html_element_by_id(id).childNodes;
       // change old nodes to updated info
        update_USER_info(nodes_to_update);

        //reset form
        document.querySelector("#user-update-form").reset();
    }
    else if(!response.ok){
        // show error message and reload page
        alert("ERROR: USER Update NOT succesfull ");
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
        response_message("POST SUCCESSFULLY UPDATED");
         // find element nodes to update
         const nodes_to_update = find_html_element_by_id(id).childNodes;
         // change old nodes to updated info
         update_POST_info(nodes_to_update);
         //reset form
         document.querySelector("#post-update-form").reset();
    }
    else if(!response.ok){
        // show error message
        alert("ERROR: POST Update NOT succesfull ");
    }
}
//replace old post node values to updated values 
function update_POST_info(oldNodes){
    // get form inputs values
    const elements = document.querySelector("#post-update-form");
    // change specific old nodes to updated values
    oldNodes[1].innerHTML = elements.title.value;
    oldNodes[3].src = elements.image.value;
    oldNodes[5].innerHTML = elements.body.value;  
}
//replace old user node values to updated values 
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
//get update values and update data in database
async function updateData(event){
    event.preventDefault();
    //values for identification
    const form = event.target;
    const id = form.getAttribute("data-id");
    const type = form.getAttribute("title"); // data type to update murder me
 
    if (type === "users"){
        // get user form inputs
        const elements = document.querySelector("#user-update-form");

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
    }
    else if (type === "posts"){
        // get post form inputs
        const elements = document.querySelector("#post-update-form");
         
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

//-------------------------------- CREATE FUNCTIONS --------------
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
// get create dialog values 
function createItem(event){
    event.preventDefault();
    const element = this;
        // decide what values to get and send and reset form
        if(element.id === "post-create-form"){
            // close dialog
            document.querySelector("#post-create-dialog").close();
            // remove eventlistener
            document.querySelector("#post-create-form").removeEventListener("submit", createItem);
            // post input values
            const title = event.target.title.value;
            const image = event.target.image.value;
            const body = event.target.body.value;
          
            post_POST(title, body, image);

            // reset form
            document.querySelector("#post-create-form").reset();
        }

        else if (element.id === "user-create-form"){
            // close dialog
            document.querySelector("#user-create-dialog").close();
    
            // remove eventlistener
            document.querySelector("#user-create-form").removeEventListener("submit", createItem);
            
            // user values
            const name = event.target.name.value;
            const title = event.target.title.value;
            const image = event.target.image.value;
            const mail = event.target.mail.value;
            const phone = event.target.phone.value;

            user_POST(title, name, image, mail, phone);

            // reset form
            document.querySelector("#user-create-form").reset();
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
            response_message("USER SUCCESSFULLY CREATED");
        }
        else if(!response.ok){
            // show error message and reload page
            alert("ERROR: USER CREATE NOT succesfull ");
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
            response_message("POST SUCCESSFULLY CREATED");
             // response with new object id/name
            const data = await response.json();
            // make get request to input specific element into DOM from response id
            insertNewItem(data.name, "posts");
        }
        else if(!response.ok){
            // show error message 
            alert("ERROR: POST CREATE NOT succesfull ");
        }

   
}

// ------------------------------ DELETE FUNCTIONS -------------------
//deletes item from database
async function deleteData(event) {
    //get values to id item to delete in database
    const id = event.target.getAttribute("data-id");
    const type = event.target.getAttribute("title"); //data type (posts/users) WEIRD I KNOW sry
    // delete item globally
    const url = `${endpoint}/${type}/${id}.json`;
    const response = await fetch(url, { method: "DELETE" });
        if (response.ok){
            // delete item locally
            const element_to_delete = find_html_element_by_id(id);
            element_to_delete.remove();
            // show confirmation message with data type
            const deleted_type = type.slice(0, -1);
            const message_type = deleted_type.toUpperCase();
            response_message(`${message_type}` + " SUCCESSFULLY DELETED");
        }
        else if(!response.ok){
            alert("ERROR: error deleting ITEM")
        }
}

// --------------------- CHANGE AND RESPONSE FUNCTIONS -------------
//change UI --- change create-btn, sort options, search placeholders
function change_UI(){
    const btn = this;
    //show or hide create-btn
    if (btn.id === "users-btn"){ 
        // hide post-create-btn and show user-create-btn
        document.querySelector("#post-create-btn").classList.add("hidden");
        document.querySelector("#user-create-btn").classList.remove("hidden");

        //search placeholder for users
        document.querySelector("#search-input").setAttribute("placeholder", 
        "SEARCH by Full/Partial TITLE, NAME or MAIL");

         // show sort select for users
         document.querySelector("#sort-selecting").classList.remove("hidden");
    }
    else if (btn.id === "posts-btn"){
        // hide user-create-btn and show post-create-btn
        document.querySelector("#post-create-btn").classList.remove("hidden");
        document.querySelector("#user-create-btn").classList.add("hidden");
        
        //search placeholder for posts
        document.querySelector("#search-input").setAttribute("placeholder", "SEARCH by Full/Partial TITLE or BODY");

        // hide sort select for users
        document.querySelector("#sort-selecting").classList.add("hidden");
    }
}
// show reponse message to user 
function response_message(msg) {
    const message_element = document.getElementById("response-message");
    message_element.innerHTML = msg;
    message_element.classList.remove("hidden");
    // automatically remove toast message if user doesn´t click it
    setTimeout(function(){message_element.classList.add("hidden")}, 5000);
}   

// ----------------------- ITEM HIDE / REVEAL FUNCTIONS ------------------ 
//hide object information
function hide_item(){
    // get item children elements
    const elements = this.parentElement.children;
    //add hidden class to all children elements except last (.show-btn)
    for (let i = (elements.length -1); i >= 0; i--){
        elements[i].classList.add("hidden");    
    }
    // remove hidden from show-btn
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