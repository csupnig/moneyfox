import usermodel = require('../models/User');

var config = {};

export class AuthMiddleware {
    constructor(private conf : any){}

    public isAuthenticated (req, res , next) {
        if(req.isAuthenticated()){
            next();
        }else{
            res.status(401);
            res.send({error:'Not authenticated'});
        }
    }

    public isAdmin (req, res, next) {
        if(req.isAuthenticated() && req.user.email == this.conf.adminemail){
            next();
        }else{
            res.status(401);
            res.send({error:'Not authenticated'});
        }
    }

    public userExists (req, res, next) {
        usermodel.UserModel.count({
            email: req.body.email
        }, (err, count) => {
            if (count === 0) {
                next();
            } else {
                res.status(404);
                res.send({error:'Not authenticated'});
            }
        });
    }
}
