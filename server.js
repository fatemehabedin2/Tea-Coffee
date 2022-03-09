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

app.get("/register", (req, res) => {
  res.render("registration", { layout: false });
});

app.get("/shoppingCart", (req, res) => {
  res.render("shoppingCart", { layout: false });
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
app.get("/forgotpassword", (req, res) => {
  res.render("forgotpassword", { layout: false });
});



//#endregion

//#region AuthorizedUsers
app.get("/dashboardUser", (req, res) => {
  res.render("dashboardUser", { layout: false });
});
app.get("/profile", (req, res) => {
  res.render("profile", { layout: false })
});

app.get("/shippingDetail", (req, res) => {
  res.render("shippingDetail", { layout: false });
});

app.get("/orders", (req, res) => {
  res.render("orderHistory", { layout: false });
});

app.get("/confirmOrder", (req, res) => {
  res.render("confirmOrder", { layout: false });
});

app.get("/checkout", (req, res) => {
  res.render("checkout", { layout: false });
});

app.get("/editProfile", (req,res) => {
  res.render("editProfile", {layout: false}) 
});
//#endregion AdminPages

//#region AdminPages
app.get("/createProduct", (req, res) => {
  res.render("createProduct", { layout: false });
});
app.get("/updateProduct", (req, res) => {
  res.render("updateProduct", { layout: false });
});
app.get("/deleteProduct", (req, res) => {
  res.render("deleteProduct", { layout: false });
});
app.get("/dashboardAdmin", (req, res) => {
  res.render("dashboardAdmin", { layout: false });
});

app.get("/productInDatabase", (req, res) => {
  res.render("productInDatabase", { layout: false });
});
//#endregion

//#region Products
app.get("/products", (req, res) => {
  res.render("productListing", { layout: false });
});

app.get("/products/1", (req, res) => {
  res.render("productDetail", { layout: false });
});

app.get("/search", (req, res) => {
  res.render("productSearch", { layout: false });
});


//#endregion

//#region Custom Functions and Startup
app.listen(HTTP_PORT, OnHttpStart);
//#endregion
