'use strict'

// Get a list of items in inventory based on the classification_id
let classificationList = document.querySelector("#classificationList");

function renderError(error) {
    let errorDisplay = document.getElementById("errorDisplay");
    errorDisplay.innerHTML = error.message;
}

classificationList.addEventListener("change", function () {
    let classification_id = classificationList.value;
    console.log(`classification_id is: ${classification_id}`);
    let classIdURL = "/inv/getInventory/" + classification_id;
    fetch(classIdURL)
        .then(function (response) {
            console.log("response is: ", response);
            if (response.ok) {
                return response.json();
            }
            throw Error("Network response was not OK");
        })
        .then(function (data) {
            buildInventoryList(data);
        })
        .catch(function (error) {
            renderError(error);
            console.log('There was a problem: ', error.message);
        });
});

// Build inventory items into HTML table components and inject into DOM
function buildInventoryList(data) {

    console.log("data is: ", data);


    let inventoryDisplay = document.getElementById("inventoryDisplay");

    // Verificar si el array data está vacío
    if (!data || data.length === 0) {
        inventoryDisplay.innerHTML = "<p>No inventory available.</p>";
        return;
    }

    // Set up the table labels
    let dataTable = '<thead>';
    dataTable += '<tr><th>Vehicle Name</th><td>&nbsp;</td><td>&nbsp;</td></tr>';
    dataTable += '</thead>';
    // Set up the table body
    dataTable += '<tbody>';

    // Iterate over all vehicles in the array and put each in a row
    data.forEach(function (element) {
        console.log(element.inv_id + ", " + element.inv_model);
        dataTable += `<tr><td>${element.inv_make} ${element.inv_model}</td>`;
        dataTable += `<td><a href='/inv/update-inventory/${element.inv_id}' title='Click to update'>Update</a></td>`;
        dataTable += `<td><a href='#' onclick='confirmDelete(${element.inv_id})' title='Click to delete'>Delete</a></td></tr>`;
    });
    dataTable += '</tbody>';

    // Display the contents in the Inventory Management view
    inventoryDisplay.innerHTML = dataTable;
}

// Function to confirm deletion
function confirmDelete(inv_id) {

    console.log("inv_id is: ", inv_id);

    if (confirm("Are you sure you want to delete this item?")) {
        fetch(`/inv/delete/${inv_id}`, {
            method: "DELETE"
        })
            .then(response => {

                console.log("response is: ", response);
                // redirect

                if (response.ok) {
                    alert("Item deleted successfully!");
                    window.location.reload(); // Recarga la página actual
                    // Refresh inventory list
                    // classificationList.dispatchEvent(new Event("change"));
                } else {
                    throw new Error("Failed to delete item");
                }
            })
            .catch(error => {
                alert("Error: " + error.message);
            });
    }
}
