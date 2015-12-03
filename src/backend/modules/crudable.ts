import usermodel = require('../models/User');
import authorization = require('../middleware/authorization');
import mongoose = require('mongoose');
import crudable = require('../models/UserCRUDAble');

export function init<T extends crudable.IUserCrudable>(app,config,model : crudable.IUserCRUDAbleModel<T>, path : string) {

    var Auth = new authorization.AuthMiddleware(config),
        ERRORCODE : number = 404;

    app.get(path, Auth.isAuthenticated, (req, res) => {
        model.findByUserID(req.user._id).then((items : any)=>{
            res.json(items);
        }).catch((err)=>{
            res.status(ERRORCODE);
            res.json({error:err});
        });
    });

    app.post(path + '/search', Auth.isAuthenticated, (req, res) => {
        console.log(req.body.query);
        model.search(req.body.query, req.user._id).then((items : any)=>{
            res.json(items);
        }).catch((err)=>{
            res.status(ERRORCODE);
            res.json({error:err});
        });
    });

    app.get(path + '/:id', Auth.isAuthenticated, (req, res) => {
        model.findOneForUser(req.params.id, req.user._id).then((item : T)=>{
            res.json(item);
        }).catch((err)=>{
            res.status(ERRORCODE);
            res.json({error:err});
        });
    });

    app.post(path, Auth.isAuthenticated, (req, res) => {
        model.createOrSaveForUser(req.body, req.user._id).then((item : T)=>{
            res.json(item);
        }).catch((err)=>{
            res.status(ERRORCODE);
            res.json({error:err});
        });
    });

    app.put(path, Auth.isAuthenticated, (req, res) => {
        model.createOrSaveForUser(req.body, req.user._id).then((item : T)=>{
            res.json(item);
        }).catch((err)=>{
            res.status(ERRORCODE);
            res.json({error:err});
        });
    });

    app.delete(path + '/:id', Auth.isAuthenticated, (req, res) => {
        model.deleteOneForUser(req.params.id, req.user._id).then(()=>{
            res.json({id:req.params.id, message:'OK'});
        }).catch((err)=>{
            res.status(ERRORCODE);
            res.json({error:err});
        });
    });
}
