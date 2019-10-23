var mongoose = require("mongoose");
var Campground = require("./models/campground");
var Comment = require("./models/comment");

var data = [
    {
        author: {
            username: "jose"
        },
        name: "Ocote",
        image: "https://images.unsplash.com/photo-1546890975-7596e98cdbf1?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=334&q=80",
        description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
        price: "49.99"
    },
    {
        author: {
            username: "jose"
        },
        name: "Desierto de los leones",
        image: "https://images.unsplash.com/photo-1504851149312-7a075b496cc7?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60",
        description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
        price: "49.99"
    },
    {
        author: {
            username: "jose"
        },
        name: "Pabellon de Arteaga",
        image: "https://images.unsplash.com/photo-1515408320194-59643816c5b2?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=750&q=80",
        description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
        price: "49.99"
    }
];

async function seedDB() {
    // Remove all campgrounds
    await Campground.deleteMany({});
    console.log("removed campgrounds!");
    await Comment.deleteMany({});
    console.log("removed comments!");
    //add a few campgrounds
    for (const seed of data){
        let campground = await Campground.create(seed);
        console.log("added a campground");
        //add a few comments
        let comment = await Comment.create(
            {
                text: "I would like to be there I love México <3",
                author: {
                    username: "jose"
                }
            });
        campground.comments.push(comment);
        campground.save();
        console.log("created new comment");
    }
}

module.exports = seedDB;