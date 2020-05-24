const {db} = require('../util/admin');


exports.getScreams = (request,response) => {
    db
    .collection('screams')
    .orderBy('createdAt','desc')
    .get()
    .then((data) =>{
            let screams = [];
            data.forEach(doc=>{
                screams.push({
                    screamId:doc.id,
                    body:doc.data().body,
                    userhandle:doc.data().userhandle,
                    createdAt:doc.data().createdAt
                });
            });
            return response.json(screams);
        })
        .catch(err=>console.log(err));
};

exports.createScream = (request,response)=>{
    const newScream = {
        body:request.body.body,
        userhandle:request.user.handle,
        createdAt:new Date().toISOString()
    };
    db
    .collection('screams')
    .add(newScream)
    .then((doc)=>{
        return response.json({message:`document ${doc.id} created successfully`});
    }).catch(err=>{
        response.status(500).json({message:`object creation failed`});
        console.log(err);
    });
};