//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

mongoose.connect("mongodb://localhost:27017/todolistDB");

const itemSchema = new mongoose.Schema({
  name:String
});


const Item = mongoose.model("Item",itemSchema);

const item1 = new Item({
  name:"EAT"
})

const item2 = new Item({
  name:"SLEEP"
})

const item3 = new Item({
  name:"REPEAT"
})

const defaultItems = [item1,item2,item3]


const listSchema = new mongoose.Schema({
  name:String,
  items:[itemSchema]
});

const List = mongoose.model("List",listSchema);


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));



app.get("/", function(req, res) {
  Item.find(function(err,items){
    if(items.length === 0){
      Item.insertMany(defaultItems,function(err){
        if(!err){
          res.redirect("/");
        }
      })
    }
    else{
      res.render("list", {listTitle: "Today", newListItems: items});
    }
  })
})

app.post("/", function(req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  });
  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    // make sure listName is correct
    List.findOne({name: listName}, function(err, foundList) {
      foundList.items.push(item); 
      foundList.save(); 
      res.redirect("/" + listName);
    });
  }
});


app.post("/delete",function(req,res){
  const checkbox = req.body.checkbox;
  const listName = req.body.listname;
  if(listName==="Today"){
    Item.deleteOne({_id:checkbox},function(err){
      if(!err){
        res.redirect("/")
      }
    });
  }else{
    List.findOneAndUpdate({name:listName},{$pull : {items : {_id:checkbox} }},function(err,foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    });
  };
  
})




app.get("/:customListTitle", function(req,res){
  const customListTitle = _.capitalize(req.params.customListTitle);
  List.findOne({name:customListTitle},function(err,foundList){
    if(!err){
      if(!foundList){
        const list = new List({
          name:customListTitle,
          items:defaultItems,
        });
        list.save();
        res.redirect("/"+customListTitle);
      }else{
        res.render("list",{listTitle:foundList.name,newListItems:foundList.items})
      }
    }
  })
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
