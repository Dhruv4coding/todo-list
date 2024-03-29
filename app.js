 const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require('lodash')
require('dotenv').config()
mongoose.set('strictQuery', false);

const date = require(__dirname + "/date.js")



 const app = express();

app.use(bodyParser.urlencoded({ extended: true }))

app.set('view engine', 'ejs');

app.use(express.static('public'));

await mongoose.connect("mongodb+srv://Dhruv-admin:"+ process.env.MONGO_DB_PASS+ "@cluster0.gtzmx2u.mongodb.net/todolistDB")

const itemsSchema = new mongoose.Schema({
    name: String
})

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "welcome to your todoList"
})

const item2 = new Item({
    name: "Hit the + button to add a new item"
})

const item3 = new Item({
    name: "Hit the checkBox to delete an item"
})

const defaultItems = [item1, item2, item3]

const listSchema = {
    name: String,
    items: [itemsSchema]
}

const List = mongoose.model("List", listSchema);

app.get("/", async(req, res) => {

    await Item.find({}, (err, foundItems) => {
        if (err) {
            console.log(err);
        }
        else {
            if (foundItems.length === 0) {
                Item.insertMany(defaultItems, (err) => {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        console.log("succesfully insert defualt items");
                    }

                })
                res.redirect("/");
            }
            else {
                res.render("list", { listTitle: "Today", addedTasks: foundItems })
            }
        }
    })


})

app.post("/", async(req, res) => {


    const itemName = req.body.nextTask;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    })

    if (listName === "Today") {
        await item.save()
        res.redirect("/")
    }
    else{
        await List.findOne({name:listName} , (err , foundList) => {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        })
    }


})

app.post("/delete", async(req, res) => {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === "Today"){
        await Item.findByIdAndRemove(checkedItemId, (err) => {
            if (err) {
                console.log(err);
            }
            else {
                console.log("successfully Deleted")
                res.redirect("/")
            }
        })
    }

    else{
        await List.findOneAndUpdate({name:listName} , {$pull:{items:{_id:checkedItemId}}} , (err , foundList)=>{
            if(!err){
                res.redirect("/"+listName);
            }
        })
    }
   
})



app.get("/:customListName", async(req, res) => {
    const customListName = _.capitalize(req.params.customListName);
    await List.findOne({ name: customListName }, (err, foundList) => {
        if (!err) {
            if (!foundList) {
                //create a new list
                const list = new List({
                    name: customListName,
                    items: defaultItems
                })

                list.save();
                res.redirect("/" + customListName)

            }
            else {
                //show an existing list
                res.render("list", { listTitle: foundList.name, addedTasks: foundList.items })
            }
        }
    })


})



app.get("/about", (req, res) => {
    res.render("about")
})
app.listen(5000, () => {
  
    console.log("server running at 5000 port")
})