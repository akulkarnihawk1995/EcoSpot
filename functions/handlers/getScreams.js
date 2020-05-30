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
        userImage:request.user.imageUrl,
        createdAt:new Date().toISOString(),
        likeCount : 0,
        commentCount : 0
    };
    db
    .collection('screams')
    .add(newScream)
    .then((doc)=>{
        const responseScream = newScream;
        responseScream.screamId = doc.id;
        return response.json({responseScream});
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

    //like a scream
    exports.likeScream = (req, res) => {
        const likeDocument = db
          .collection('likes')
          .where('userHandle', '==', req.user.handle)
          .where('screamId', '==', req.params.screamId)
          .limit(1);
      
        const screamDocument = db.doc(`/screams/${req.params.screamId}`);
      
        let screamData;
      
        screamDocument
          .get()
          .then((doc) => {
            if (doc.exists) {
              screamData = doc.data();
              screamData.screamId = doc.id;
              return likeDocument.get();
            } else {
              return res.status(404).json({ error: 'Scream not found' });
            }
          })
          .then((data) => {
            if (data.empty) {
              return db
                .collection('likes')
                .add({
                  screamId: req.params.screamId,
                  userHandle: req.user.handle
                })
                .then(() => {
                  screamData.likeCount++;
                  return screamDocument.update({ likeCount: screamData.likeCount });
                })
                .then(() => {
                  return res.json(screamData);
                });
            } else {
              return res.status(400).json({ error: 'Scream already liked' });
            }
          })
          .catch((err) => {
            console.error(err);
            res.status(500).json({ error: err.code });
          });
      };

    exports.unlikeScream = (req, res) => {
        const likeDocument = db
          .collection('likes')
          .where('userHandle', '==', req.user.handle)
          .where('screamId', '==', req.params.screamId)
          .limit(1);
      
        const screamDocument = db.doc(`/screams/${req.params.screamId}`);
      
        let screamData;
      
        screamDocument
          .get()
          .then((doc) => {
            if (doc.exists) {
              screamData = doc.data();
              screamData.screamId = doc.id;
              return likeDocument.get();
            } else {
              return res.status(404).json({ error: 'Scream not found' });
            }
          })
          .then((data) => {
            if (data.empty) {
              return res.status(400).json({ error: 'Scream not liked' });
            } else {
              return db
                .doc(`/likes/${data.docs[0].id}`)
                .delete()
                .then(() => {
                  screamData.likeCount--;
                  return screamDocument.update({ likeCount: screamData.likeCount });
                })
                .then(() => {
                  res.json(screamData);
                });
            }
          })
          .catch((err) => {
            console.error(err);
            res.status(500).json({ error: err.code });
          });
      };