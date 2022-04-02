function checkPrice(price) {
  var num = Number(price);
  if (num !== NaN) {
    if (num > 0 && price <= 100) {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
}

function checkDiscount(discount) {
  if (discount === null || discount === "" ) {
    return false;
  } else {
    var percent = Number(discount);
    if (percent !== NaN) {
      if (percent >= 0 && percent <= 100) {
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
  if (name === "" || name === null) {
    return false;
  } else {
    return true;
  }
}

function checkDesc(desc) {
  if (desc === "" || desc === null) {
    return false;
  } else {
    return true;
  }
}

function checkFile(filename) {
  let extension = filename.split(".").pop();
  if (extension !== null && extension.length > 2) {
    if (extension === "jpeg" || extension === "jpg" || extension === "png") {
      return true;
    } else {
      return false;
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
