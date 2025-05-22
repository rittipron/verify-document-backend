const validateMulti = (data, keyValidate) => {
  if (!data) return { isValid: false, missingKeys: keyValidate };

  const missingKeys = keyValidate.filter(
    (property) =>
      !data.hasOwnProperty(property) ||
      data[property] === null ||
      data[property] === undefined ||
      data[property] === "" ||
      typeof data[property] === "undefined"
  );

  return {
    isValid: missingKeys.length === 0,
    missingKeys
  };
};

  
const validateMultiArr = (data, keyValidate) => {
    if((data || []).length > 0){
      let isValids = "start"
  
      data.map((val, index)=>{
        let isValid = validateMulti(val,keyValidate)
        if(isValids == "start" || String(isValid) == "false"){
          if (isValid) {
            isValids = true
          } else {
            isValids = false
          }
        }
        
      })
      return isValids
    }else{
        return false
      }
  }
  
const validateSingle = (data) => {
      if (data != null && data != undefined && data != "" && data != " " && data && typeof data !== "undefined" && data !== "undefined") {
          return true
        } else {
          return false
        }
  }
  
const validateObject = (empty) => {
    if(Object.keys(empty).length === 0 && empty.constructor === Object){
      return false
    } else {
      return true
    }
  }
  

  module.exports = { 
    validateMulti, 
    validateMultiArr,
    validateSingle,
    validateObject
  };