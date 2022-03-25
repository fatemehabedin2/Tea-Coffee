//#region COMMENT HEADER
/* Author: Group 1
   Date: March 26,2022
   Title: Project Phase 2

*/
//#endregion


//#region Server Setup
var express = require("express");
var app = express();
var HTTP_PORT = process.env.PORT || 8080;

const Sequelize = require('sequelize');
const clientSessions = require("client-sessions");



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




//#region CONNECT TO THE DATABASE

//#endregion
var sequelize = new Sequelize('da0rg01ri3pfsj', 'mrnohuyjzbaahe', '0bbb43a19ee6ffd1fba8dea290ec2f7eaa733ced8eea3bdd587d139b3725458b', {
  host: 'ec2-34-233-157-9.compute-1.amazonaws.com',
  dialect: 'postgres',
  port: 5432,
  dialectOptions: {
    ssl: { rejectUnauthorized: false }
  }
});

sequelize
  .authenticate()
  .then(function () {
    console.log('Connection to database has been established successfully.');
  })
  .catch(function (err) {
    console.log('Unable to connect to the database:', err);
  });

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
  res.render("forgotPassword", { layout: false });
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

app.get("/editProfile", (req, res) => {
  res.render("editProfile", { layout: false })
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

app.use("*", (req, res) => {
  res.render("pageNotFound", { layout: false });
});

//#region Custom Functions and Startup
app.listen(HTTP_PORT, OnHttpStart);
//#endregion
