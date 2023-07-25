const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _= require("lodash");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb://127.0.0.1:27017/blogDB", {useNewUrlParser: true});

const itemsSchema = new mongoose.Schema({
  name: String,
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your todolist!",
});

const item2 = new Item({
  name: "Hit the + button to add a new item",
});

const item3 = new Item({
  name: "<-- Hit this to delete an item.",
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

function Insertitems() {
  Item.insertMany(defaultItems)
    .then(function () {
      console.log("Successfully saved our default items to db");
    })
    .catch(function (err) {
      console.log(err);
    });
}

// Item.deleteMany({name:"Welcome to your todolist!"}).then(function(){
//   console.log("deleted");
// });

app.get("/", function (req, res) {
  Item.find()
    .then(function (foundItems) {
      if(foundItems.length==0 ) {
         Insertitems();
         console.log("Succesfullysaved");
         res.redirect("/");
      }else{
        res.render("list", { listTitle: "Today", newListItems: foundItems });
        console.log(foundItems);
      }
     
    })
    .catch(function (err) {
      console.log(err);
    });

  //console.log(currentDay);
});

app.post("/", (req, res) => {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });
 

  if(listName ==="Today"){
    item.save();

    res.redirect("/");
  }else{
    List.findOne({name: listName}).then(function(foundlist){
       foundlist.items.push(item);
       foundlist.save();
       res.redirect("/"+listName);
    })
  }

});

app.post("/delete",function(req,res){
  const checkItem= req.body.checkbox;
  const listName = req.body.listName;

  if(listName==="Today"){
    Item.findByIdAndRemove(checkItem).then({
      function(){
         console.log("deleted");
      }
    }).catch(function(err){
      console.log(err);
    });
  
    res.redirect("/");
  }else{
     
    List.findOneAndUpdate({name:listName},{$pull :{items:{_id:checkItem}} }).then(function(foundlist){
      res.redirect("/"+listName);
    }).catch(function(err){
      console.log(err);
    });

  }

 


})

app.get("/about", function (req, res) {
  res.render("about");
});


app.get("/:customListName", function(req,res){
   const customListName= _.capitalize(req.params.customListName);
  
   List.findOne({name: customListName}).then(function(foundlist){
       if(!foundlist){
        const list = new List({
          name: customListName,
          items: defaultItems
         });
         list.save();
         res.redirect("/"+customListName);
       }else{
        res.render("list", { listTitle: foundlist.name, newListItems: foundlist.items });
       }
   })

  

})




// app.post("/work", (req, res) => {
//   let item = req.body.newItem;

//   workItems.push(item);
//   res.redirect("/");
// });

app.listen(3000, function () {
  console.log("Server started on 3000 portal");
});
//01400081101
