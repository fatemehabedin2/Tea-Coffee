//#region COMMENT HEADER
/* Author: Group 1
   Date: March 26,2022
   Title: Project Phase 3
*/
//#endregion

//#region Server Setup
var express = require("express");
var app = express();
var HTTP_PORT = process.env.PORT || 8080;

//body parser
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));

const Sequelize = require("sequelize");
const clientSessions = require("client-sessions");

  //#region CONNECT TO THE DATABASE
var sequelize = new Sequelize(
  "da0rg01ri3pfsj",
  "mrnohuyjzbaahe",
  "0bbb43a19ee6ffd1fba8dea290ec2f7eaa733ced8eea3bdd587d139b3725458b",
  {
    host: "ec2-34-233-157-9.compute-1.amazonaws.com",
    dialect: "postgres",
    port: 5432,
    dialectOptions: {
      ssl: { rejectUnauthorized: false },
    },
  }
);

sequelize
  .authenticate()
  .then(function () {
    console.log("Connection to database has been established successfully.");
  })
  .catch(function (err) {
    console.log("Unable to connect to the database:", err);
  });

//#endregion

  //#region call Models
const UserModel = require("./models/UserModel.js");
const User = UserModel(sequelize, Sequelize);

const ProductModel = require('./models/ProductModel');
const Product = ProductModel(sequelize, Sequelize);

const CategoryModel = require('./models/CategoryModel');
const Category = CategoryModel(sequelize, Sequelize);

Category.hasOne(Product,{ foreignKey: {
  name: 'category_id',
  field: 'category_id' }});

//#endregion
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


// added custome helper 
app.engine(".hbs", engine({
  extname: ".hbs" ,
  helpers: {
    navLink: function (url, options) {
      let liClass = (url == app.locals.activeRoute) ? 'nav-item active' : 'nav-item';
      return `<li class="` + liClass + `" >
                  <a class="nav-link" href="` + url + `">` + options.fn(this) + `</a>
              </li>`;
  }
  }
}));

app.set("view engine", ".hbs");

// added the property 'activeRoute' to 'app.locals' whenever the route changes, 
//ie: if our route is '/products', the app.locals.activeRoute value will be '/products'
app.use( (req, res, next) => {
  let route = req.baseUrl + req.path;
  app.locals.activeRoute = (route == '/') ? '/' : route.replace(/\/$/, '');
  next();
})

// const clientSessions = require("client-sessions");
app.use(
  clientSessions({
    cookieName: "session",
    secret: "cap805-cto",
    duration: 2 * 60 * 1000,
    activeDuration: 60 * 1000, //automatic logout time
  })
);

//#region Routes
/*
 */
//#endregion

//#region General Pages
app.get("/", (req, res) => {
  res.render("home", { user: req.session.user, layout: false });
});

app.get("/about", (req, res) => {
  res.render("about", { layout: false });
});

app.get("/contact", (req, res) => {
  res.render("contact", { user: req.session.user, layout: false });
});

app.get("/register", (req, res) => {
  res.render("registration", { layout: false });
});

app.post("/register", (req, res) => {
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const address = req.body.address;
  const email = req.body.email;
  const password = req.body.password;
  const phone_number = req.body.phone_number;
  
  // synchronize the Database with our models and automatically add the 
// table if it does not exist

sequelize.sync().then(function () {
  // create a new "User" and add it to the database
  User.create({
    first_name: firstName,
    last_name: lastName,
    address: address,
    email_id: email,
    pass_word: password,
    phone_number: phone_number,
    user_created_on: new Date(),
    user_role:"user"
  })
    .then(function (User) {
      // you can now access the newly created User via the variable User
      console.log("success!");
    })
    .catch(function (error) {
      console.log("something went wrong!");
      console.log(error);
    });
 });
      res.redirect("/login");
});

app.get("/shoppingCart", (req, res) => {
  res.render("shoppingCart", { layout: false });
});

//#endregion

//#region Authentication
app.get("/login", (req, res) => {
  res.render("login", { user: req.session.user, layout: false });
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (email == "" || password == "") {
    return res.render("login", {
      errorMsg: "Both fields are required",
      layout: false,
    });
  }

  UserModel.findOne({ where: { email: email } })
    .exec()
    .then((usr) => {
      if (!email) {
        res.render("login", {
          errorMsg: "Email does not match",
          layout: false,
        });
      } else {
        if (password == usr.password) {
          //successful login
          req.session.user = {
            // if the user logged in, redirect to user dashboard
            email: usr.email,
            firstName: usr.firstName,
            lastName: usr.lastName,
            address: usr.address,
            phone: usr.phone,
          };
          res.redirect("/dashboardUser");
        } else {
          res.render("login", {
            errorMsg: "PASSWORD does not match",
            layout: false,
          });
        }
      }
    });

  // if(!(email == process.env.EMAIL)){
  //   return res.render("login", {errorMsg:"Email does not match", layout: false });
  // }
  // if(!(password == process.env.PASSWORD)){
  //   return res.render("login", {errorMsg:"PASSWORD does not match", layout: false });
  // }
});

app.get("/logout", (req, res) => {
  req.session.reset();
  res.redirect("/");
});
app.get("/forgotpassword", (req, res) => {
  res.render("forgotPassword", { layout: false });
});

//#endregion

//#region AuthorizedUsers
app.get("/dashboardUser", ensureLogin, (req, res) => {
  res.render("dashboardUser", { layout: false });
});
app.get("/profile", ensureLogin, (req, res) => {
  res.render("profile", { user: req.session.user, layout: false });
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

app.get("/editProfile", ensureLogin, (req, res) => {
  res.render("editProfile", { user: req.session.user, layout: false });
});
app.post("/editProfile", ensureLogin, (req, res) => {
  const email = req.body.email;
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const address = req.body.address;
  const phone = req.body.phone;

  req.session.user = {
    //recreate session after editing profile
    email: email,
    firstName: firstName,
    lastName: lastName,
    address: address,
    phone: phone,
  };

  res.redirect("/profile");
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
app.get("/dashboardAdmin", ensureAdmin, (req, res) => {
  res.render("dashboardAdmin", { layout: false });
});

app.get("/productInDatabase", (req, res) => {
  res.render("productInDatabase", { layout: false });
});
//#endregion

//#region Products
app.get("/products", (req, res) => {
  let allProducts = [
    {
      id: 1,
      prodName: 'prod name',
      prodDesc: 'prod desc',
      price: '10.66'
    },
    {
      id: 2,
      prodName: '2 prod name',
      prodDesc: 'prod desc',
      price: '210.66'
    },
    {
      id: 3,
      prodName: '3 prod name',
      prodDesc: 'prod desc',
      price: '30.66'
    }
  ];
  res.render("productListing", {
    layout: false,
    allProducts: allProducts
  });
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
function ensureLogin(req, res, next) {
  if (!req.session.user) {
    //if user session does not exist
    res.redirect("/login");
  } else {
    next(); //do whatever you want to do
  }
}

function ensureAdmin(req, res, next) {
  if (!req.session.user.isAdmin) {
    //if user is not admin and want to go pages that is not allowed
    res.redirect("/login");
  } else {
    next(); //do whatever you want to do
  }
}

app.listen(HTTP_PORT, OnHttpStart);
//#endregion
