module.exports.checkPrice = function (price) {
    var num = Number(price);
    if(num !== NaN){
      if(num > 0){
        return true;
      }else{
        return false;
      }
    }else{
      return false;
    }
  }

  module.exports.checkDiscount = function (discount) {
    var percent = Number(discount);
    if(percent !== NaN){
      if(percent > 0){
        return true;
      }else{
        return false;
      }
    }else{
      return false;
    }
  }