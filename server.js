//#region COMMENT HEADER
/* Author: Group 1
   Date: April 1,2022
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

//cookie parser
var cookieParser = require("cookie-parser");
app.use(cookieParser());

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
        let liClass =
          url == app.locals.activeRoute ? "nav-item active" : "nav-item";
        return (
          `<li class="` +
          liClass +
          `" >
                  <a class="nav-link" href="` +
          url +
          `">` +
          options.fn(this) +
          `</a>
                </li>`
        );
      },
      for: function (from, to, incr, block) {
        var accum = "";
        for (var i = from; i <= to; i += incr) accum += block.fn(i);
        return accum;
      },
      sum: function (a, b) {
        return parseInt(a) + b;
      },
      notEqual: function (lvalue, rvalue, options) {
        if (arguments.length < 3)
          throw new Error("Handlebars Helper equal needs 2 parameters");

        if (lvalue == rvalue) {
          return options.inverse(this);
        } else {
          return options.fn(this);
        }
      },
      equal: function (lvalue, rvalue, options) {
        if (arguments.length < 3)
          throw new Error("Handlebars Helper equal needs 2 parameters");

        if (lvalue != rvalue) {
          return options.inverse(this);
        } else {
          return options.fn(this);
        }
      },
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

app.use(
  clientSessions({
    cookieName: "session",
    secret: "cap805-cto",
    duration: 2 * 60 * 1000,
    activeDuration: 60 * 1000, //automatic logout time
  })
);

//#region Multer

const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: "./views/images/",
  filename: function (req, file, cb) {
    cb(null, "New" + file.originalname);
  },
});
const upload = multer({ storage: storage });
//#endregion

//#region General Pages
app.get("/", (req, res) => {
  //getting 4 products of tea category and are bestseller
  let teaProducts = "";
  Product.findAll({
    where: {
      category_id: [1, 2, 3],
      bestseller: true,
    },
    limit: 4,
    raw: true,
  })
    .then((data) => {
      teaProducts = data;
      //getting 4 products of coffe category and are bestseller
      return Product.findAll({
        where: {
          category_id: [4, 5],
          bestseller: true,
        },
        limit: 4,
        raw: true,
      });
    })
    .then((data) => {
      res.render("home", {
        layout: false,
        user: req.session.user,
        finalData: {
          teaProducts,
          coffeeProducts: data,
        },
      });
    })
    .catch((err) => {
      console.log(
        "No results returned for product with product ID " + req.params.prodID
      );
      console.log(err);
    });
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
      user_role: "customer",
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
  if (req.cookies.productsAddedToCart) {
    console.log("productsAddedToCart", req.cookies.productsAddedToCart);
  } else {
    console.log("cart is empty");
  }

  res.render("shoppingCart", { layout: false });
});

app.post("/addToCart", (req, res) => {
  const productToBeAddedToCart = {
    product_id: req.body.product_id,
    quantity: req.body.product_qty,
  };

  let cookieValue = [];
  // get cookie value if already present
  if (req.cookies.productsAddedToCart) {
    cookieValue = req.cookies.productsAddedToCart;
  }
  // push newly product which needs to be added into the cart
  cookieValue.push(productToBeAddedToCart);

  // set cookie
  res.cookie("productsAddedToCart", cookieValue);

  // redirect to shoppingCart page
  res.redirect("/shoppingCart");
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

  User.findOne({ where: { email_id: email } }).then((user) => {
    if (!user) {
      // if could not find the email (no user match)
      res.render("login", {
        errorMsg: "Email does not match",
        layout: false,
      });
    } // if could find the email (user exist)
    else {
      // console.log(user.email_id, user.first_name, password, user.pass_word);

      if (password == user.pass_word) {
        //successful login
        let isAdmin = user.user_role == "administrator" ? true : false;
        req.session.user = {
          email: user.email_id,
          firstName: user.first_name,
          lastName: user.last_name,
          address: user.address,
          phone: user.phone_number,
          isAdmin: isAdmin,
        };
        // if the user logged in, redirect to user dashboard
        if (isAdmin) {
          res.redirect("/dashboardAdmin");
        } else {
          res.redirect("/dashboardUser");
        }
      } else {
        res.render("login", {
          errorMsg: "PASSWORD does not match",
          layout: false,
        });
      }
    }
  });
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
  let teaProducts = "";
  Product.findAll({
    where: {
      category_id: [1, 2, 3],
      bestseller: true,
    },
    limit: 4,
    raw: true,
  })
    .then((data) => {
      teaProducts = data;
      return Product.findAll({
        where: {
          category_id: [4, 5],
          bestseller: true,
        },
        limit: 4,
        raw: true,
      });
    })
    .then((data) => {
      res.render("dashboardUser", {
        layout: false,
        user: req.session.user,
        finalData: {
          teaProducts,
          coffeeProducts: data,
        },
      });
    })
    .catch((err) => {
      console.log("No results returned");
      console.log(err);
    });
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
  res.render("createProduct", { user: req.session.user, layout: false });
});

const validate = require("./utilities/validateProduct");

app.post("/createProduct", ensureAdmin, upload.single("photo"), (req, res) => {
  let product = {
    product_name: req.body.product_name,
    description: req.body.description,
    image: "images/" + req.file.filename,
    unit_price: req.body.unit_price,
    quantity_in_stock: req.body.quantity,
    category_id: req.body.category,
    bestseller: Boolean(req.body.bestseller),
    discount_percentage: req.body.discount
  }
  if (validate.validProduct(req.body.product_name, req.body.description, req.body.unit_price, req.body.unit_price, req.file.filename)) {
    sequelize.sync().then(function () {
      Product.create({
        product_name: req.body.product_name,
        description: req.body.description,
        image: "images/" + req.file.filename,
        unit_price: Number(req.body.unit_price),
        quantity_in_stock: parseInt(req.body.quantity),
        category_id: parseInt(req.body.category),
        bestseller: Boolean(req.body.bestseller),
        discount_percentage: Number(req.body.discount)
      })
        .then(function (product) {
          console.log("success!");
        })
        .catch(function (error) {
          console.log("something went wrong!");
          console.log(error);
        });
    });
    res.redirect("/productInDatabase");
  } else {
    let msg1_ = validate.checkPrice(req.body.unit_price)
      ? null
      : "Invalid Price";
    let msg2_ = validate.checkDiscount(req.body.discount)
      ? null
      : "Invalid Discount";
    let msg3_ = validate.checkFile(req.file.filename) ? null : "Invalid Image";
    Category.findOne({
      attributes: ["category_type"],
      where: {
        category_id: parseInt(req.body.category)
      },
      raw: true,
    })
      .then(function (data_) {
        let category = data_;
        res.render("createProduct", {
          user: req.session.user,
          data: { product, category, msg1: msg1_, msg2: msg2_, msg3: msg3_ },
          layout: false,
        });
      })
      .catch((err) => {
        console.log("No results returned");
      });
  }
});

app.get("/updateProduct", ensureAdmin, (req, res) => {
  res.render("updateProduct", { user: req.session.user, layout: false });
});

app.post("/updateProduct", ensureAdmin, (req, res) => {
  var id_ = Number(req.body.product_id);
  var product = {};
  sequelize.sync().then(function () {
    Product.findOne({
      where: {
        product_id: id_,
      },
      raw: true,
    })
      .then(function (data) {
        product = data;
        Category.findOne({
          attributes: ["category_type"],
          where: {
            category_id: data.category_id
          },
          raw: true,
        })
          .then(function (data_) {
            let category = data_;
            res.render("updateProduct", {
              user: req.session.user,
              data: { product, category },
              layout: false,
            });
          })
          .catch((err) => {
            console.log("No results returned");
          });
      })
      .catch((err) => {
        console.log("No results returned for product with product ID " + id_);
      });
  });
});

app.post("/update", ensureAdmin, upload.single("photo"), (req, res) => {
  let img = req.file ? "images/" + req.file.filename : req.body.img1;
  if (validate.validProduct(req.body.product_name, req.body.description, req.body.unit_price, req.body.unit_price, img)) {
    sequelize
      .sync()
      .then(function () {
        Product.update({
          product_name: req.body.product_name,
          description: req.body.description,
          image: img,
          unit_price: Number(req.body.unit_price),
          quantity_in_stock: parseInt(req.body.quantity),
          category_id: parseInt(req.body.category),
          bestseller: Boolean(req.body.bestseller),
          discount_percentage: Number(req.body.discount),
        },
          {
            where: { product_id: Number(req.body.product_id) },
          }
        ).then(function () {
          console.log("Product is updated successfully");
          res.redirect("/productInDatabase");
        });
      })
      .catch(function (error) {
        console.log("Something went wrong!");
      });
  } else {
    let msg1_ = validate.checkPrice(req.body.unit_price)
      ? null
      : "Invalid Price";
    let msg2_ = validate.checkDiscount(req.body.discount)
      ? null
      : "Invalid Discount";
    let msg3_ = validate.checkFile(img) ? null : "Invalid Image";
    var id_ = Number(req.body.product_id);
    var product = {};
    sequelize.sync().then(function () {
      Product.findOne({
        where: {
          product_id: id_,
        },
        raw: true,
      })
        .then(function (data) {
          product = data;
          Category.findOne({
            attributes: ["category_type"],
            where: {
              category_id: data.category_id,
            },
            raw: true,
          })
            .then(function (data_) {
              let category = data_;
              res.render("updateProduct", {
                user: req.session.user,
                data: { product, category, msg1: msg1_, msg2: msg2_, msg3: msg3_ },
                layout: false,
              });
            })
            .catch((err) => {
              console.log("No results returned");
            });
        })
        .catch((err) => {
          console.log("No results returned ");
        });
    });
  }
});

app.get("/deleteProduct", ensureAdmin, (req, res) => {
  res.render("deleteProduct", { user: req.session.user, layout: false });
});
app.post("/deleteProduct", ensureAdmin, (req, res) => {
  res.render("deleteProduct", { user: req.session.user, layout: false });
});
app.post("/delete", ensureAdmin, (req, res) => {
  res.render("deleteProduct", { user: req.session.user, layout: false });
});
app.get("/dashboardAdmin", ensureAdmin, (req, res) => {
  res.render("dashboardAdmin", { user: req.session.user, layout: false });
});

app.get("/productInDatabase", ensureAdmin, (req, res) => {
  var productList = [];
  sequelize.sync().then(function () {
    Product.findAll({
      raw: true
    })
      .then(function (products) {
        res.render("productInDatabase", {
          user: req.session.user,
          data: products,
          layout: false,
        });
      })
      .catch((err) => {
        console.log("No results returned.");
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

let sortOptions = [
  {
    id: 1,
    value: "A-Z",
    order: ["product_name", "ASC"],
    active: true,
  },
  {
    id: 2,
    value: "Z-A",
    order: ["product_name", "DESC"],
    active: false,
  },
  {
    id: 3,
    value: "Price, Low to High",
    order: ["unit_price", "ASC"],
    active: false,
  },
  {
    id: 4,
    value: "Price, High to Low",
    order: ["unit_price", "DESC"],
    active: false,
  },
];

const makeAllSortOptionsNonActive = () => {
  sortOptions.forEach((sortOption) => {
    sortOption.active = false;
  });
};

const getProducts = (query) => {
  const { page, size, product_name, sort } = query;
  let condition = product_name
    ? {
      product_name: Sequelize.where(
        Sequelize.fn("LOWER", Sequelize.col("product_name")),
        "LIKE",
        "%" + product_name.toLowerCase() + "%"
      ),
    }
    : null;
  let order = ["product_id", "ASC"];
  if (sort > 1 && sort <= sortOptions.length) {
    order = sortOptions[sort - 1].order;
    makeAllSortOptionsNonActive();
    sortOptions[sort - 1].active = true;
  }

  const { limit, offset } = getPagination(page, size);

  return new Promise((resolve, reject) => {
    Product.findAndCountAll({
      where: condition,
      order: [order],
      limit,
      offset,
      raw: true,
    })
      .then((data) => {
        const response = getPagingData(data, page, limit, sort);
        resolve(response);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

app.get("/products", (req, res) => {
  let allProductsResp = "";
  getProducts(req.query)
    .then((data) => {
      allProductsResp = data;
      // console.log(allProductsResp)
      return Category.findAll({ raw: true });
    })
    .then((data) => {
      res.render("productListing", {
        layout: false,
        finalData: {
          allProductsResp,
          allCategories: data,
          sortOptions,
        },
      });
    })
    .catch((err) => {
      console.log("No Products found: " + err);
    });
});

app.get("/products/:prodID", (req, res) => {
  let singleProduct = "";
  Product.findOne({
    where: {
      product_id: req.params.prodID,
    },
    raw: true,
  })
    .then((data) => {
      singleProduct = data;
      return Product.findAll({
        limit: 4,
        raw: true,
      });
    })
    .then((relatedProducts) => {
      res.render("productDetail", {
        layout: false,
        finalData: {
          singleProduct: singleProduct,
          relatedProducts: relatedProducts,
        },
      });
    })
    .catch((err) => {
      console.log(
        "No results returned for product with product ID " + req.params.prodID
      );
      console.log(err);
    });
});

// displaying products with pagination on search page
app.get("/search", (req, res) => {
  const query = req.query;
  const searchText = req.query.searchTerm
    ? req.query.searchTerm
    : req.body.searchTerm;

  if (searchText !== undefined) {
    query.product_name = searchText;
    getProducts(query)
      .then((data) => {
        res.render("productSearch", {
          layout: false,
          finalData: {
            searchText,
            filteredProductsResp: data,
          },
        });
      })
      .catch((err) => {
        console.log("No Products found: " + err);
      });
  } else {
    res.render("productSearch", {
      layout: false,
      finalData: {
        searchText: "",
        filteredProductsResp: [],
      },
    });
  }
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
  if (!req.session.user) {
    res.redirect("/login");
  } else if (!req.session.user.isAdmin) {
    res.redirect("/login");
  } else {
    next();
  }
}

app.listen(HTTP_PORT, OnHttpStart);
//#endregion
