const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "./models/transactions.json");

// Read the JSON file
fs.readFile(filePath, "utf8", (err, data) => {
  if (err) {
    console.error("Error reading the file:", err);
    return;
  }

  try {
    // Parse the JSON data
    const itemList = JSON.parse(data);

    for (let i = 0; i < itemList.length; i++) {
      itemList[i].origin = "source";
    }

    // Save the updated JSON data back to the file
    fs.writeFile(filePath, JSON.stringify(itemList, null, 2), (err) => {
      if (err) {
        console.error("Error writing to the file:", err);
      } else {
        console.log("Ids added to items successfully!");
      }
    });
  } catch (parseError) {
    console.error("Error parsing JSON:", parseError);
  }
});
