//#region COMMENT HEADER
/* Author: Group 1
   Date: Feb 23,2022
   Title: Project Phase 2

*/
//#endregion

//#region Server Setup
var express = require("express");
var app = express();
var HTTP_PORT = process.env.PORT || 8080;

require("dotenv").config();

function OnHttpStart() {
  console.log("****************************************");
  console.log("Express server started successfully");
  console.log("Link: http://localhost:" + HTTP_PORT);
  console.log("****************************************");
}

app.use(express.static("views"));
app.use(express.static("public"));

const { engine } = require("express-handlebars");

app.engine(".hbs", engine({ extname: ".hbs" }));

app.set("view engine", ".hbs");

//#endregion

//#region Routes
/*
 */
//#endregion

//#region General Pages
app.get("/", (req, res) => {
  res.render("home", { layout: false });
});

app.get("/about", (req, res) => {
  res.render("about", { layout: false });
});

app.get("/contact", (req, res) => {
  res.render("contact", { layout: false });
});

app.get("/register", (req,res) => {
  res.render("registration", {layout: false });
});

//#endregion

//#region Authentication
app.get("/login", (req, res) => {
    res.render("login", { layout: false });
  });
app.get("/logout", (req, res) => {
      //todo logout stuff
    res.redirect("/")
  });
  app.get("/forgotpassword", (req,res) => {
    res.render("forgotpassword", {layout: false});
   });  

   //#endregion

//#region AuthorizedUsers
app.get("/dashboarduser", (req, res) => {
  res.render("dashboardUser", { layout: false });
});
app.get("/profile", (req,res) => {
  res.render("profile", {layout: false})
 });
//#endregion AdminPages

//#region AdminPages
app.get("/createproduct", (req, res) => {
  res.render("createProduct", { layout: false });
});
app.get("/updateproduct", (req, res) => {
  res.render("updateProduct", { layout: false });
});
app.get("/deleteproduct", (req, res) => {
  res.render("deleteProduct", { layout: false });
});
app.get("/dashboardadmin", (req, res) => {
  res.render("dashboardAdmin", { layout: false });
});

app.get("/productindatabase", (req, res) => {
  res.render("productInDB", { layout: false });
});
//#endregion

//#region Products
app.get("/products", (req, res) => {
  res.render("productListing", { layout: false });
}); 
//#endregion

//#region Custom Functions and Startup
app.listen(HTTP_PORT, OnHttpStart);
//#endregion
