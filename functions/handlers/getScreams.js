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

exports.getScreamsbyId = (request,response)=>{
    let screamData = {};
    db.doc(`/screams/${request.params.screamId}`).get()
        .then((doc)=>{
            if(!doc.exists){
                return response.status(404).json({error:'Scream not found'});
            }
                screamData = doc.data();
                screamData.screamId = doc.id;
                return db.collection('comments').orderBy('createdAt','desc').where('screamId','==',request.params.screamId).get();
        })
                    .then(data=>{
                        screamData.comments = [];
                        data.forEach(doc=>{
                            screamData.comments.push(doc.data())
                        });
                        return response.json(screamData);
                    }).catch(err=>{
                        return response.status(500).json({error:err.code});
                    });
    };

    exports.commentOnScream = (request,response)=>{
        if(request.body.body.trim()===''){
            return response.status(400).json({error:'Inputy must not be empty'});
        }
        const newComment = {
            body:request.body.body,
            createdAt:new Date().toISOString(),
            screamId:request.params.screamId,
            userhandle:request.user.handle,
            userImage:request.user.imageUrl
        };

        db.doc(`/screams/${request.params.screamId}`).get()
        .then((doc)=>{
            if(!doc.exists){
                return response.status(404).json({error:'Scream not found'});
            }
            return db.collection('comments').add(newComment)
        }).then(()=>{
            response.json(newComment);
        }).catch(err=>{
            return response.status(500).json({error:'Something went wrong'});
        });
    };