const isEmail = (email)=>{
    const regex = '/^[a-z0-9](?!.*?[^\na-z0-9]{2})[^\s@]+@[^\s@]+\.[^\s@]+[a-z0-9]$/';
    if(email.match(regex)){
        return true;
    }
    else
    {
        return false;
    }

};

const isEmpty = (string) =>{
    if(string.trim()==='') return true;
    else return false;
};

exports.validateSignUpData = (data) =>{
    let errors = {};
    if(isEmpty(data.email)){
        errors.email = 'Email must not be empty';
    }else if(isEmail(data.email)){
        errors.email = 'Not a valid email';
    }
    if(isEmpty(data.password)){
        errors.password = 'must not be empty';
    }
    if(data.password!=data.confirmPassword){
        errors.confirmPassword = 'Passwords does not match';
    }
    if(isEmpty(data.handle)){
        errors.handle = 'must not be empty';
    }
    return{
        errors,
        valid: Object.keys(errors).length === 0 ? true:false
    };
};

exports.validateLoginData = (data) => {
    let errors = {};
  
    if (isEmpty(data.email)) errors.email = 'Must not be empty';
    if (isEmpty(data.password)) errors.password = 'Must not be empty';
  
    return {
      errors,
      valid: Object.keys(errors).length === 0 ? true : false
    };
  };

  exports.reduceUserDetails = (data) =>{
      let userDetails = {};
      if(!isEmpty(data.bio.trim())){
            userDetails.bio = data.bio;
      }

      if(!isEmpty(data.website.trim())){
          if(data.website.trim().substring(0,4)!='http'){
              userDetails.website = `http://${data.website.trim()}`
          }else{
              userDetails.website = data.website;
          }
      }
      if(!isEmpty(data.location.trim())){
        userDetails.location = data.location;
  }
  return userDetails;
  };