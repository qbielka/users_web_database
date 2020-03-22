const USER_ID = 5;
const USER_TAB = 4;
const USER_DRINK = 3;
const USER_AGE = 2;
const USER_EMAIL = 1;
const USER_NAME = 0;
let lastSortedBy = USER_NAME;
let quince_db = new Array();
// const server_link = "http://localhost:3000/";
const server_link = "/";
clearAndSortByName();

async function addNameToDB() {
    const nameField = document.getElementById("nameId");
    const emailField = document.getElementById("emailId");
    const numberField = document.getElementById("ageId");
    const drinkField = document.getElementById("drinkId");
    const tabField = document.getElementById("tabId");

    if (nameField.value == null || nameField.value === "") {
        alert("You Must Input a Name");
        return;
    } else if (emailField.value == null || emailField.value === "") {
        alert("You Must Input an Email");
        return;
    } else if (numberField.value == null || numberField.value === "") {
        alert("You Must Input an Age");
        return;
    }

    const item = [nameField.value, emailField.value, numberField.value, drinkField.value, tabField.value];

    //globaldb
    const new_db_obj_id = await addUserToGlobalDB(item);
    const new_item = [nameField.value, emailField.value, numberField.value, drinkField.value, tabField.value, new_db_obj_id];
    //localDB
    quince_db.push(new_item);

    let stringBuilder = "  " + (quince_db.length) + ". ";
    stringBuilder += "Name: " + nameField.value;
    stringBuilder += ", Email: " + emailField.value;
    stringBuilder += ", Age: " + numberField.value;
    stringBuilder += ", Favourite Drink: " + drinkField.value;
    stringBuilder += ", Current Tab: " + tabField.value;

    document.getElementById("DatabaseOfEntries")
        .appendChild(document.createTextNode(stringBuilder));
    addEndlTo("DatabaseOfEntries");
    setAge();
}

async function addUserToGlobalDB(user, userId) {
    let stringBuilder = server_link;
    stringBuilder += "users_add?";
    stringBuilder +="name="+user[USER_NAME]+"&";
    stringBuilder +="email="+user[USER_EMAIL]+"&";
    stringBuilder +="age="+user[USER_AGE]+"&";
    stringBuilder +="drink="+user[USER_DRINK]+"&";
    stringBuilder +="tab="+user[USER_TAB];

    let response = await fetch(stringBuilder, {
        method:'GET',
        headers: {'Content-Type': 'application/json'},
    });
    let result = await response.json();
    return result[0]
}

function clearView() {
    viewName = "DatabaseOfEntries";
    clearSpecificView(viewName);
}

function clearSpecificView(viewName) {
    var databaseView = document.getElementById(viewName);
    var child = databaseView.firstChild;
    while (child != null) {
        databaseView.removeChild(child);
        child = databaseView.firstChild;
    }
}

async function repopulateView() {
    quince_db = await refreshFromDatabase();
    for (let i = 0; i < quince_db.length; i++) {
        var stringBuilder = "  " + (i + 1) + ". ";
        stringBuilder += "Name: " + quince_db[i][USER_NAME];
        stringBuilder += ", Email: " + quince_db[i][USER_EMAIL];
        stringBuilder += ", Age: " + quince_db[i][USER_AGE];
        stringBuilder += ", Favourite Drink: " + quince_db[i][USER_DRINK];
        stringBuilder += ", Current Tab: " + quince_db[i][USER_TAB];
        document.getElementById("DatabaseOfEntries")
            .appendChild(document.createTextNode(stringBuilder));
        addEndlTo("DatabaseOfEntries");
    }
}

function sort2DArrayBy(innerIndexToSortBy, listToUse) {
    if (innerIndexToSortBy == USER_AGE) {
        listToUse.sort(function (a, b) { return a[innerIndexToSortBy] - b[innerIndexToSortBy] });
    } else if (innerIndexToSortBy == USER_NAME) {
        listToUse.sort(compareNames);
    } else if (innerIndexToSortBy == USER_EMAIL) {
        listToUse.sort(compareEmails);
    }
}

function compareNames(item1, item2) {
    if (item1[0] > item2[0]) {
        return 1;
    }
    return -1;
}

function compareEmails(item1, item2) {
    if (item1[1] > item2[1]) {
        return 1;
    }
    return -1;
}

async function clearAndSortByName() {
    await clearAndSortBy(USER_NAME);
}

async function clearAndSortByEmail() {
    await clearAndSortBy(USER_EMAIL);
}

async function clearAndSortByAge() {
    await clearAndSortBy(USER_AGE);
}

async function clearAndSortBy(itemToSortBy) {
    clearView();
    await repopulateView();
    lastSortedBy = itemToSortBy;
}

function addEndlTo(item) {
    document.getElementById(item).appendChild(document.createElement("br"));
}

async function refreshFromDatabase() {

    const item = await refreshFromDataBaseThread();
    let new_list = new Array();
    for (let i = 0; i < item.length; i++){
        new_list.push([item[i].name, item[i].email, item[i].age, item[i].drink, item[i].tab, item[i].id]);
    }
    console.log("RefreshFROMDB");
    console.log(new_list);
    sort2DArrayBy(USER_NAME, new_list);
    console.log(new_list);
    return new_list;
}

async function refreshFromDataBaseThread() {
    return (await fetch(server_link+"users_database", {
        method: 'GET',
        headers: {'Content-Type': 'application/json'}
    })).json();
}

async function setAge() {
    quince_db = await refreshFromDatabase();
    // clear old data
    clearSpecificView("AverageAge");
    // set default if array is blank
    if (quince_db.length == 0) {
        document.getElementById("AverageAge")
            .appendChild(document.createTextNode(
                "The average age of all users is not yet defined because there are no users"));
        return;
    }
    // calculate age
    let sumAge = 0;
    for (let index = 0; index < quince_db.length; index++) {
        sumAge += parseInt(quince_db[index][USER_AGE], 10);
    }
    const averageAge = sumAge / quince_db.length;

    document.getElementById("AverageAge")
        .appendChild(document.createTextNode("The average age of all users is " + averageAge));
}

async function edit(name, email, age, drink, tab, old_user) {
    let stringBuilder = server_link;
    stringBuilder += "users_edit?";
    stringBuilder += "&id="+old_user[USER_ID];

    if (name !== undefined && name !== "") {
        stringBuilder += "&name=" + name;
    } else {
        stringBuilder += "&name=" + old_user[USER_NAME];
    }
    if (email !== undefined && email !== "") {
        stringBuilder += "&email=" + email;
    } else {
        stringBuilder += "&email=" + old_user[USER_EMAIL];
    }
    if (age !== undefined && age !== "") {
        stringBuilder += "&age=" + age;
    } else {
        stringBuilder += "&age=" +old_user[USER_AGE];
    }
    if (drink !== undefined && drink !== "") {
        stringBuilder += "&drink=" + drink;
    } else {
        stringBuilder += "&drink=" + old_user[USER_DRINK];
    }
    if (tab !== undefined && tab !== ""){
        stringBuilder += "&tab=" + tab;
    } else {
        stringBuilder += "&tab=" + old_user[USER_TAB];
    }


    console.log(stringBuilder);
    let response = await fetch(stringBuilder, {
        method:'GET',
        headers: {'Content-Type': 'application/json'},
    });
    let result = await response.json();
    console.log(result);
}

async function editView() {

    const indexField = document.getElementById("editIDNumber");
    const nameField = document.getElementById("editNameId");
    const emailField = document.getElementById("editEmailId");
    const numberField = document.getElementById("editAgeId");
    const drinkField = document.getElementById("drinkId");
    const tabField = document.getElementById("tabId");
    const index = indexField.value;
    if (index == null || index < 1 || index >= quince_db.length + 1) {
        alert("Not a Valid Element");
        return;
    }
    console.log("Pool");
    console.log(quince_db);
    console.log(quince_db[index - 1]);
    await edit(nameField.value, emailField.value, numberField.value, drinkField.value, tabField.value, quince_db[index - 1]);


    if (nameField.value != null && nameField.value != "") {
        quince_db[index - 1][USER_NAME] = nameField.value;
        indexField.value = null;
    }

    if (emailField.value != null && emailField.value != "") {
        quince_db[index - 1][USER_EMAIL] = emailField.value;
        indexField.value = null;
    }

    if (numberField.value != null && numberField.value != "") {
        quince_db[index - 1][USER_AGE] = numberField.value;
        indexField.value = null;
    }

    if (drinkField.value != null && drinkField.value != "") {
        quince_db[index - 1][USER_DRINK] = drinkField.value;
        indexField.value = null;
    }

    if (tabField.value != null && tabField.value != "") {
        quince_db[index - 1][USER_TAB] = tabField.value;
        indexField.value = null;
    }

    clearAndSortBy(lastSortedBy);

    nameField.value = null;
    emailField.value = null;
    numberField.value = null;
    drinkField.value = null;
    tabField.value = null;

    setAge();
}

async function deleteFromGlobal(userId) {
    let stringBuilder = server_link;
    stringBuilder += "users_delete?";
    stringBuilder += "id="+userId;

    console.log(stringBuilder);
    let response = await fetch(stringBuilder, {
        method:'GET',
        headers: {'Content-Type': 'application/json'},
    });
    let result = await response.json();
    console.log(result);
}

async function deleteView() {

    var indexField = document.getElementById("editIDNumber");
    var index = indexField.value;
    if (index == null || index < 1 || index >= quince_db.length + 1) {
        alert("Not a Valid Element");
        return;
    }

    for (i = index; i < quince_db.length; i++) {
        quince_db[index - 1] = quince_db[index];
    }
    const item = quince_db.pop();
    await deleteFromGlobal(item[USER_ID]);
    clearAndSortBy(lastSortedBy);
    indexField.value = null;
    setAge();
}

function checkEditValid() {


    var indexField = document.getElementById("editIDNumber");
    var nameField = document.getElementById("editNameId");
    var emailField = document.getElementById("editEmailId");
    var numberField = document.getElementById("editAgeId");
    var tabField = document.getElementById("editAgeId");
    var drinkField = document.getElementById("editAgeId");
    var editButton = document.getElementById("editButton");
    var index = indexField.value;

    if (index == null || index < 1 || index >= quince_db.length + 1) {
        editButton.classList.remove("validButton");
        editButton.classList.add("invalidButton");
        return;
    }

    // if any of the three items exist the button is valid
    if (nameField.value != null && nameField.value != "") {
        editButton.classList.add("validButton");
        editButton.classList.remove("invalidButton");
        return;
    }

    if (emailField.value != null && emailField.value !== "") {
        editButton.classList.add("validButton");
        editButton.classList.remove("invalidButton");
        return;
    }

    if (numberField.value != null && numberField.value !== "") {
        editButton.classList.add("validButton");
        editButton.classList.remove("invalidButton");
        return;
    }

    if (tabField.value != null && tabField.value !== "") {
        editButton.classList.add("validButton");
        editButton.classList.remove("invalidButton");
        return;
    }

    if (drinkField.value != null && drinkField.value !== "") {
        editButton.classList.add("validButton");
        editButton.classList.remove("invalidButton");
        return;
    }

    // Default is invalid
    editButton.classList.remove("validButton");
    editButton.classList.add("invalidButton");

}

function checkDeleteValid() {
    var indexField = document.getElementById("editIDNumber");
    var deleteButton = document.getElementById("deleteButton");
    var index = indexField.value;
    if (index == null || index < 1 || index >= quince_db.length + 1) {
        deleteButton.classList.remove("validButton");
        deleteButton.classList.add("invalidButton");
        return;
    }

    deleteButton.classList.add("validButton");
    deleteButton.classList.remove("invalidButton");
}

function checkAddValid() {
    var nameField = document.getElementById("nameId");
    var emailField = document.getElementById("emailId");
    var numberField = document.getElementById("ageId");
    var tabField = document.getElementById("editAgeId");
    var drinkField = document.getElementById("editAgeId");
    var addButton = document.getElementById("addButton");

    if (nameField.value == null || nameField.value === "") {
        addButton.classList.remove("validButton");
        addButton.classList.add("invalidButton");
        return;
    } else if (emailField.value == null || emailField.value === "") {
        addButton.classList.remove("validButton");
        addButton.classList.add("invalidButton");
        return;
    } else if (numberField.value == null || numberField.value === "") {
        addButton.classList.remove("validButton");
        addButton.classList.add("invalidButton");
        return;
    }


    else if (tabField.value == null || tabField.value === "") {
        addButton.classList.add("validButton");
        addButton.classList.remove("invalidButton");
        return;
    }

    else if (drinkField.value == null || drinkField.value === "") {
        addButton.classList.add("validButton");
        addButton.classList.remove("invalidButton");
        return;
    }

    addButton.classList.add("validButton");
    addButton.classList.remove("invalidButton");

}

checkDeleteValid();
checkAddValid();
checkEditValid();
// Create Listeners
window.setInterval(function () {
    checkDeleteValid();
    checkAddValid();
    checkEditValid();
}, 100);
