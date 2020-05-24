const { admin, db } = require('./admin');

module.exports = (request,response,next)=>{
    let idtoken;
    if(request.headers.authorization && request.headers.authorization.startsWith('Bearer ')){
        idtoken = request.headers.authorization.split('Bearer ')[1];
    }else{
        console.log('No token found');
        return response.status(403).json({error:'Unauthorized'});
    }
    admin
    .auth()
    .verifyIdToken(idtoken)
    .then(decodedToken=>{
        request.user = decodedToken;
        console.log(decodedToken);
        return db.collection('users').where('userId','==',request.user.uid)
        .limit(1)
        .get();
    })
        .then(data=>{
            request.user.handle = data.docs[0].data().handle;
            return next();
        }).catch(err=>{
            console.log(err);
            return response.status(403).json({err});
        });
    };