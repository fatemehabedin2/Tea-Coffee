function checkPrice(price) {
  var temp = price;
  if (price === null || price === "") {
    return false;
  } else if (temp.trim().length === 0) {
    return false;
  } else {
    var num = Number(price);
    if (num !== NaN) {
      if (num > 0.00 && price <= 100.00) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
}

function checkDiscount(discount) {
  var temp = discount;
  if (discount === null || discount === "") {
    return false;
  } else if (temp.trim().length === 0) {
    return false;
  } else {
    var percent = Number(discount);
    if (percent !== NaN) {
      if (percent >= 0.00 && percent <= 100.00) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
}

function checkName(name) {
  var temp = name;
  if (name === "" || name === null) {
    return false;
  } else if (temp.trim().length === 0) {
    return false;
  } else {
    return true;
  }
}

function checkDesc(desc) {
  var temp = desc;
  if (desc === "" || desc === null) {
    return false;
  } else if(temp.trim().length === 0){
    return false;
  } else {
    return true;
  }
}

function checkFile(filename) {
  var temp = filename;
  if (filename === null || filename === "") {
    return false;
  } else if (temp.trim().length === 0){
    return false;
  } else{
    let extension = filename.split(".").pop();
    if (extension !== null && extension.length > 2 && extension.length < 5) {
      if (extension === "jpeg" || extension === "jpg" || extension === "png") {
        return true;
      } else {
        return false;
      }
    }
  }
}

function validProduct(name, desc, price, discount, filename) {
  if (
    this.checkName(name) &&
    this.checkDesc(desc) &&
    this.checkPrice(price) &&
    this.checkDiscount(discount) &&
    this.checkFile(filename)
  ) {
    return true;
  } else {
    return false;
  }
}

exports.checkPrice = checkPrice;
exports.checkDiscount = checkDiscount;
exports.checkName = checkName;
exports.checkDesc = checkDesc;
exports.checkFile = checkFile;
exports.validProduct = validProduct;
