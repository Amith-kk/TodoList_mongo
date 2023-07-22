//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
// const { name } = require("ejs");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-amith:256517@cluster0.ab5ovif.mongodb.net/todolistDB");

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item ({
  name: "Welcome to your todolist!"
});

const item2 = new Item ({
  name: "Hit the + button to add a new item."
});

const item3 = new Item ({
  name: "<--Hit this to delete an item."
});

const defultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List =mongoose.model("List", listSchema);



app.get("/", function(req, res) {

  Item.find()
  .then(function (foundItem) {
    if ( foundItem.length === 0) {
      Item.insertMany(defultItems)
      .then(function () {
        // console.log("Successfully saved defult items to DB");
      })
      .catch(function (err) {
        console.log(err);
      });
      res.redirect("/");
    } else {
      res.render("list", {listTitle: "Today", newListItems: foundItem});
    }
    
  });


});


app.get("/:customListName", function(req, res) {
  const customListName =_.capitalize(req.params.customListName);
  
  List.findOne({ name: customListName })
  .then((foundList) => {
    if (!foundList) {
      // Create a new list
      const list = new List({
        name: customListName,
        items: defultItems
      });
    
      list.save();
      res.redirect("/" + customListName );
    
    } else {
      // Show an existing list
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
    }
  })
  .catch((err) => {
    console.error("Error occurred:", err);
  });      
      
      

  
});


app.post("/", function(req, res){

  const itemName  = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });
  
  if (listName === "Today"){
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName})
    .then((foundList) => {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    })
  }

  
});

app.post("/delete", function(req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId)
  .then(function(checkedItemId) {
    // console.log("suces");
    res.redirect("/");
  })
  } else {
    List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } })
    .then(() => {
      res.redirect("/" + listName);
    })
    .catch((err) => {
      console.error("Error occurred:", err);
    });
  }

  
  

});



app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
