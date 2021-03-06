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

const ContactModel = require("./models/ContactModel.js");
const Contact_message = ContactModel(sequelize, Sequelize);

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

// User.hasOne(Contact, {
//   foreignKey: {
//     name: "user_id",
//     field: "user_id",
//   },
// });

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
const bcrypt = require("bcryptjs");

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

app.use(
  clientSessions({
    cookieName: "session",
    secret: "cap805-cto",
    duration: 20 * 60 * 1000,
    activeDuration: 10 * 60 * 1000, //automatic logout time
  })
);

//#region Multer

const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: "./views/images/",
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
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
  res.render("about", {
    layout: false,
    user: req.session.user
  });
});

app.get("/contact", (req, res) => {
  res.render("contact", { user: req.session.user, layout: false });
});

const validateForm = require("./utilities/validateForm");

app.post("/contact", (req, res) => {
  const name = req.body.name;
  const email = req.body.email;
  const message = req.body.message;

  if (!name || !email || !message) {
    return res.render("contact", {
      errorMsg: "All fields are required",
      layout: false,
    });
  }
  sequelize
    .sync()
    .then(function () {
      // create a new "Contact" and add it to the database
      Contact_message.create({
        name: name,
        email_id: email,
        message_text: message,
        message_timestamp: new Date(),
      })
        .then(function (Contact_message) {
          // you can now access the newly created Contact via the variable Contact
          console.log("success!");
          return res.render("contact", {
            successMsg: " Message submitted successfully ",
            layout: false,
          });
        })
        .catch(function (error) {
          console.log("something went wrong!");
          console.log(error);
        });
    })
    .catch(function (error) {
      console.log("something went wrong!");
      console.log(error);
    });
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

  if (!firstName || !lastName || !email || !password) {
    return res.render("registration", {
      errorMsg: "First Name, Last Name, Email and Password are required",
      layout: false,
    });
  }

  if (!validateForm.passwordLengthCheck(password)) {
    return res.render("registration", {
      errorMsg: "Password must have at least 8 characters",
      layout: false,
    });
  }
  if (!validateForm.passwordCharacterCheck(password)) {
    return res.render("registration", {
      errorMsg:
        "Password must contain at least one uppercase letter and one lowercase letter and one digit and one special character",
      layout: false,
    });
  }

  // synchronize the Database with our models and automatically add the
  // table if it does not exist

  bcrypt.hash(password, 10, (err, hash) => {
    sequelize.sync().then(function () {
      // create a new "User" and add it to the database
      User.create({
        first_name: firstName,
        last_name: lastName,
        address: address,
        email_id: email,
        pass_word: hash,
        phone_number: phone_number,
        user_created_on: new Date(),
        user_role: "customer",
      })
        .then(function (User) {
          // you can now access the newly created User via the variable User
          console.log("success!");
          res.redirect("/login");
        })
        .catch(function (error) {
          console.log("something went wrong!");
          console.log(error);
        });
    });
  });
});

app.get("/shoppingCart", async (req, res) => {

  if (req.cookies.productsAddedToCart) {
    console.log("productsAddedToCart", req.cookies.productsAddedToCart);
    const frequency = (product_id) => {
      let count = 0;
      req.cookies.productsAddedToCart.forEach((element) => {
        if (element.product_id == product_id) {
          let qty = parseInt(element.quantity);
          count = count + qty;
        }
      })
      return count;
    }
    var cart = [];
    let flag = true;
    let subtotal = 0;
    for (let i = 0; i < req.cookies.productsAddedToCart.length; i++) {
      let data = await Product.findOne({
        where: {
          product_id: req.cookies.productsAddedToCart[i].product_id
        },
        raw: true,
      })
      if (cart.length == 0) {
        data.count = frequency(data.product_id);
        data.total = (data.count * data.unit_price).toFixed(2);
        subtotal = subtotal + parseFloat(data.total);
        cart.push(data);

      } else {
        for (let i = 0; i < cart.length; i++) {
          if (data.product_id == cart[i].product_id) {
            flag = false;
            break;
          } else {
            flag = true
          }
        }
        if (flag) {
          data.count = frequency(data.product_id);
          data.total = (data.count * data.unit_price).toFixed(2);
          subtotal = subtotal + parseFloat(data.total);
          cart.push(data);
        }
      }
    }
    res.render("shoppingCart",
      { layout: false, cartData: cart, subtotal: subtotal, user: req.session.user }
    );

  } else {
    console.log("cart is empty");
    res.render("shoppingCart",
      { layout: false, cartData: cart }
    );
  }
});


app.get("/product/delete/:prodID", (req, res) => {

  if (req.cookies.productsAddedToCart) {
    const frequency = (product_id) => {
      let count = 0;
      req.cookies.productsAddedToCart.forEach((element) => {
        if (element.product_id == product_id) {
          let qty = parseInt(element.quantity);
          count = count + qty;
        }
      })
      return count;
    };
    var cart = [];
    let flag = true;
    for (let i = 0; i < req.cookies.productsAddedToCart.length; i++) {
      let data = {}
      if (cart.length == 0) {
        data.product_id = req.cookies.productsAddedToCart[i].product_id;
        let quantity = frequency(req.cookies.productsAddedToCart[i].quantity);
        data.quantity = quantity.toString();
        cart.push(data);

      } else {
        for (let j = 0; j < cart.length; j++) {
          if (req.cookies.productsAddedToCart[i].product_id == cart[j].product_id) {
            flag = false;
            break;
          } else {
            flag = true
          };
        };
        if (flag) {
          data.product_id = req.cookies.productsAddedToCart[i].product_id;
          let quantity = frequency(req.cookies.productsAddedToCart[i].product_id);
          data.quantity = quantity.toString();
          cart.push(data);
        };
      };
    };

    let updatedCart = []
    cart.forEach((element) => {
      if (element.product_id != req.params.prodID) {
        updatedCart.push(element)
      };
    });

    console.log("updated cart: ", updatedCart);
    res.cookie("productsAddedToCart", updatedCart, { secure: false, overwrite: true });
    console.log("after deletion: ", res.cookie.productToBeAddedToCart);
    res.redirect("/shoppingCart");

  };
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

  // if (email == "" || password == "") {
  //   return res.render("login", {
  //     errorMsg: "Both fields are required",
  //     layout: false
  //   });
  // }
  if (!validateForm.emailNullCheck(email)) {
    return res.render("login", {
      errorMsg: "email is required",
      layout: false,
    });
  } else {
    if (!validateForm.passwordNullCheck(password)) {
      return res.render("login", {
        errorMsg: "password is required",
        layout: false,
      });
    }
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

      bcrypt.compare(password, user.pass_word).then((isMatch) => {
        if (isMatch) {
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
      });
    };
  });
});

app.get("/logout", (req, res) => {
  req.session.reset();
  res.clearCookie("productsAddedToCart");
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
        finalData: {
          teaProducts,
          coffeeProducts: data
        },
        user: req.session.user
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

app.get("/shippingDetail", ensureLogin, (req, res) => {

  User.findOne({
    where: {
      email_id: req.session.user.email
    }
  }).then((data) => {
    const firstName = data.first_name;
    const lastName = data.last_name;
    const address = (data.address);
    var arraylist = address.split(",");

    const address1 = arraylist[0];
    const address2 = arraylist[1];
    const city = arraylist[2];
    const state = arraylist[3];

    let shippingAddress = {
      firstName,
      lastName,
      address1,
      address2,
      city,
      state
    };

    res.render("shippingDetail", {
      layout: false,
      data1: shippingAddress,
      user: req.session.user
    }
    );
  });
});

app.post("/shippingDetail", ensureLogin, async (req, res) => {
  const inputFirstName = req.body.inputFirstName;
  const inputLastName = req.body.inputLastName;
  const inputAddress1 = req.body.inputAddress1;
  const inputAddress2 = req.body.inputAddress2;
  const inputCity = req.body.inputCity;
  const inputState = req.body.inputState;
  //const inputZip = req.body.inputZip;
  let address = inputAddress1 + "," + inputAddress2 + "," + inputCity + "," + inputState;;
  let shippingAddress = {
    inputFirstName,
    inputLastName,
    inputAddress1,
    inputAddress2,
    inputCity,
    inputState
  };
  const frequency = (product_id) => {
    let count = 0;
    req.cookies.productsAddedToCart.forEach((element) => {
      if (element.product_id == product_id) {
        let qty = parseInt(element.quantity);
        count = count + qty;
      }
    })
    return count;
  }
  var cart = [];
  let flag = true;
  let subtotal = 0;
  for (let i = 0; i < req.cookies.productsAddedToCart.length; i++) {
    let data = await Product.findOne({
      where: {
        product_id: req.cookies.productsAddedToCart[i].product_id
      },
      raw: true,
    })
    if (cart.length == 0) {
      data.count = frequency(data.product_id);
      data.total = (data.count * data.unit_price).toFixed(2);
      subtotal = subtotal + parseFloat(data.total);
      // console.log('aaaaaaaaaa ' + data.product_id + "      " + data.count);
      cart.push(data);

    } else {
      for (let i = 0; i < cart.length; i++) {
        if (data.product_id == cart[i].product_id) {
          flag = false;
          break;
        } else {
          flag = true
        }
      }
      if (flag) {
        data.count = frequency(data.product_id);
        data.total = (data.count * data.unit_price).toFixed(2);
        subtotal = subtotal + parseFloat(data.total);
        cart.push(data);
      }
    }
  }

  User.update({
    address: address
  },
    {
      where: {
        email_id: req.session.user.email
      }
    }).then(data => {
      res.render("checkout", { shippingAddress: shippingAddress, cartData: cart, subtotal: subtotal, layout: false });
    });
});

app.get("/orders", (req, res) => {
  res.render("orderHistory", { layout: false, user: req.session.user });
});

app.get("/confirmOrder", ensureLogin, async (req, res) => {
  const frequency = (product_id) => {
    let count = 0;
    req.cookies.productsAddedToCart.forEach((element) => {
      if (element.product_id == product_id) {
        let qty = parseInt(element.quantity);
        count = count + qty;
      }
    })
    return count;
  }
  var cart = [];
  let flag = true;
  let subtotal = 0;
  for (let i = 0; i < req.cookies.productsAddedToCart.length; i++) {
    let data = await Product.findOne({
      where: {
        product_id: req.cookies.productsAddedToCart[i].product_id
      },
      raw: true,
    })
    if (cart.length == 0) {
      data.count = frequency(data.product_id);
      data.total = (data.count * data.unit_price).toFixed(2);
      subtotal = subtotal + parseFloat(data.total);
      // console.log('aaaaaaaaaa ' + data.product_id + "      " + data.count);
      cart.push(data);

    } else {
      for (let i = 0; i < cart.length; i++) {
        if (data.product_id == cart[i].product_id) {
          flag = false;
          break;
        } else {
          flag = true
        }
      }
      if (flag) {
        data.count = frequency(data.product_id);
        data.total = (data.count * data.unit_price).toFixed(2);
        subtotal = subtotal + parseFloat(data.total);
        cart.push(data);
      }
    }
  }
  res.render("confirmOrder", { layout: false, cartData: cart, subtotal: subtotal, user: req.session.user });
});

app.get("/checkout", ensureLogin, async (req, res) => {

  res.render("checkout",
    { layout: false, user: req.session.user }
  );
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

  User.findOne({ where: { email_id: email } })
    .then((user) => {
      //  .on('success', function (user) {
      if (user) {
        user.update({
          first_name: firstName,
          last_name: lastName,
          address: address,
          email_id: email,
          phone_number: phone,
        });
        // .success(function () {})
      }
    })
    .then(() => {
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
});
//#endregion AdminPages

//#region AdminPages
app.get("/createProduct", ensureAdmin, (req, res) => {
  res.render("createProduct", { user: req.session.user, layout: false });
});

const validate = require("./utilities/validateProduct");
const { timeStamp } = require("console");

app.post("/createProduct", ensureAdmin, upload.single("photo"), (req, res) => {
  if (
    validate.validProduct(
      req.body.product_name,
      req.body.description,
      req.body.unit_price,
      req.body.unit_price,
      req.file.filename
    )
  ) {
    sequelize.sync().then(function () {
      Product.create({
        product_name: req.body.product_name,
        description: req.body.description,
        image: "images/" + req.file.filename,
        unit_price: Number(req.body.unit_price),
        quantity_in_stock: parseInt(req.body.quantity),
        category_id: parseInt(req.body.category),
        bestseller: Boolean(req.body.bestseller),
        discount_percentage: Number(req.body.discount),
      })
        .then(function (product) {
          console.log(product);
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

    res.render("createProduct", {
      user: req.session.user,
      data: { msg1: msg1_, msg2: msg2_, msg3: msg3_ },
      layout: false,
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
            category_id: data.category_id,
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
  if (
    validate.validProduct(
      req.body.product_name,
      req.body.description,
      req.body.unit_price,
      req.body.unit_price,
      img
    )
  ) {
    sequelize
      .sync()
      .then(function () {
        Product.update(
          {
            product_name: req.body.product_name,
            description: req.body.description,
            image: img,
            unit_price: Number(req.body.unit_price),
            quantity_in_stock: parseInt(req.body.quantity),
            category_id: parseInt(req.body.category),
            bestseller: Boolean(req.body.bestseller),
            discount_percentage: Number(req.body.discount)
          },
          {
            where: { product_id: Number(req.body.product_id) }
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
                data: {
                  product,
                  category,
                  msg1: msg1_,
                  msg2: msg2_,
                  msg3: msg3_,
                },
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
            res.render("deleteProduct", {
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
app.post("/delete", ensureAdmin, (req, res) => {
  sequelize.sync().then(function () {
    Product.destroy({
      where: { product_id: req.body.prod_id },
    }).then(function () {
      res.redirect("/productInDatabase");
      console.log("successfully removed product id " + req.body.prod_id);
    });
  });
});

app.get("/dashboardAdmin", ensureAdmin, (req, res) => {
  res.render("dashboardAdmin", { user: req.session.user, layout: false });
});

app.get("/productInDatabase", ensureAdmin, (req, res) => {
  sequelize.sync().then(function () {
    Product.findAll({
      order: [["product_id", "ASC"]],
      raw: true,
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
  const limit = size ? size : 12;
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
  let condition = product_name
    ? {
      product_name: Sequelize.where(
        Sequelize.fn("LOWER", Sequelize.col("product_name")),
        "LIKE",
        "%" + product_name.toLowerCase() + "%"
      ),
    }
    : null;

  const { limit, offset } = getPagination(page, size);

  return new Promise((resolve, reject) => {
    Product.findAndCountAll({
      where: condition,
      order: [["product_id", "ASC"]],
      limit,
      offset,
      raw: true,
    })
      .then((data) => {
        const response = getPagingData(data, page, limit);
        resolve(response);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

app.get("/products", (req, res) => {
  // console.log(req.session.user);
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
          user: req.session.user
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
          user: req.session.user
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
            user: req.session.user
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
