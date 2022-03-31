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

const ProductModel = require("./models/ProductModel");
const Product = ProductModel(sequelize, Sequelize);

const CategoryModel = require("./models/CategoryModel");
const Category = CategoryModel(sequelize, Sequelize);

Category.hasOne(Product, {
  foreignKey: {
    name: "category_id",
    field: "category_id",
  },
});

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
app.engine(
  ".hbs",
  engine({
    extname: ".hbs",
    helpers: {
      navLink: function (url, options) {
        let liClass = url == app.locals.activeRoute ? "nav-item active" : "nav-item";
        return ( `<li class="` + liClass + `" >
                  <a class="nav-link" href="` + url + `">` +
                    options.fn(this) +
                  `</a>
                </li>`
        );
      },
      for: function(from, to, incr, block) {
        var accum = '';
        for(var i = from; i <= to; i += incr)
            accum += block.fn(i);
        return accum;
      },
      sum: function(a, b){
        return  parseInt(a) + b;
      },
      notEqual: function(lvalue, rvalue, options) {
          if (arguments.length < 3) throw new Error('Handlebars Helper equal needs 2 parameters');

          if (lvalue == rvalue) {
              return options.inverse(this);
          } else {
              return options.fn(this);
          }
      },
      equal: function(lvalue, rvalue, options) {
        if (arguments.length < 3) throw new Error('Handlebars Helper equal needs 2 parameters');

        if (lvalue != rvalue) {
            return options.inverse(this);
        } else {
            return options.fn(this);
        }
    }
    },
  })
);


app.set("view engine", ".hbs");

// added the property 'activeRoute' to 'app.locals' whenever the route changes,
//ie: if our route is '/products', the app.locals.activeRoute value will be '/products'
app.use((req, res, next) => {
  let route = req.baseUrl + req.path;
  app.locals.activeRoute = route == "/" ? "/" : route.replace(/\/$/, "");
  next();
});

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
    user_role:"customer"
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
app.get("/createProduct", ensureAdmin, (req, res) => {
  res.render("createProduct", { layout: false });
});
app.get("/updateProduct", ensureAdmin, (req, res) => {
  res.render("updateProduct", { layout: false });
});
app.get("/deleteProduct", ensureAdmin, (req, res) => {
  res.render("deleteProduct", { layout: false });
});
app.get("/dashboardAdmin", ensureAdmin, (req, res) => {
  res.render("dashboardAdmin", { layout: false });
});

app.get("/productInDatabase", (req, res) => {
  var products = [];
  sequelize.sync().then(function () {
    Product.findAll().then(function (data) {
      data = data.map(value => value.dataValues);
      for (var i = 0; i < data.length; i++) {
          products.push({
          product_id : data[i].product_id,
          product_name: data[i].product_name,
          description: data[i].description, 
          image:data[i].image, 
          unit_price: data[i].unit_price,
          quantity_in_stock: data[i].quantity_in_stock,
          category_id: data[i].category_id,
          bestseller: data[i].bestseller,
          discount_percentage: data[i].discount_percentage
        })
      }
      res.render("productInDatabase", {
        user: req.session.user,
        data: products,
        layout: false
      });
    });
  });
});

//#endregion


//#region Products
const getPagination = (page, size) => {
  const limit = size ? size : 9;
  page--;
  const offset = page ? page * limit : 0;
  return { limit, offset };
};

const getPagingData = (data, page, limit) => {
  const { count: totalItems, rows: products } = data;
  const currentPage = page ? page : 1;
  const totalPages = Math.ceil(totalItems / limit);
  return { totalItems, products, totalPages, currentPage };
};

const getProducts = (query) => {
  const { page, size, product_name } = query;
  var condition = product_name ? { product_name: { [Op.like]: `%${product_name}%` } } : null;
  const { limit, offset } = getPagination(page, size);

  return new Promise( (resolve, reject) => {
    Product.findAndCountAll({
      where: condition,
      limit,
      offset,
      raw: true
    })
    .then(data => {
      const response = getPagingData(data, page, limit);       
      resolve(response);
    })
    .catch(err => {
        reject(err);
    });
  } );
}

app.get("/products", (req, res) => {
  let allProductsResp = '';
  getProducts(req.query)
  .then(data => {
      allProductsResp = data;
      return Category.findAll({raw: true});
  })
  .then(data => {
      res.render("productListing", {
        layout: false,
        finalData: {
          allProductsResp: allProductsResp,
          allCategories: data
        }
      });
  })
  .catch(err => {
      console.log('No Products found: ' + err);
  });
});

app.get("/products/:prodID", (req, res) => {
  let singleProduct = '';
  Product.findOne({
      where: {
        product_id: req.params.prodID
      },
      raw: true
  })
  .then(data => {
      singleProduct = data;
      return Product.findAll({
        limit: 4,
        raw: true
      })
  })
  .then(relatedProducts => {
      res.render("productDetail", {
        layout: false,
        finalData: {
          singleProduct: singleProduct,
          relatedProducts: relatedProducts
        }
      });
  })
  .catch(err => {
      console.log('No results returned for product with product ID ' + req.params.prodID);
      console.log(err);
  });
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
