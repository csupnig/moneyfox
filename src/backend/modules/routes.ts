import usermodel = require('../models/User');
import authorization = require('../middleware/authorization');
import multipart = require('connect-multiparty');
import csvhandler = require('../modules/CSVDataProcessor');
import crudable = require('../modules/crudable');
import account = require('../models/Account');
import category = require('../models/Category');
import classifier = require('../modules/Classifyer');
import stmt = require('../models/Statement');
import Request = Express.Request;
import combiner = require('../modules/StatisticCombiner');

export function init (app, passport,config) {

    var Auth = new authorization.AuthMiddleware(config),
        multipartMiddleware = multipart(),
        csvprocessor = new csvhandler.CSVDataProcessor(),
        Categorizer = new classifier.Classifyer(),
        statCombiner = new combiner.StatisticCombiner();

    crudable.init(app,config,account.AccountModel,'/settings/account');
    crudable.init(app,config,category.CategoryModel,'/settings/category');
    crudable.init(app,config,stmt.StatementModel, '/statement');

    app.get("/auth/facebook", passport.authenticate("facebook", {scope: "email"}));
    app.get("/auth/facebook/callback",
        passport.authenticate("facebook", {failureRedirect: '/#/login'}),
        (req, res) => {
            res.redirect('/');
        }
    );

    app.get("/userinfo/authenticated", (req : Request, res) => {
        if (req.user) {
            var userinfo : any = {
                userid: req.user._id,
                authenticated: true,
                email: req.user.email,
                firstName: req.user.firstName,
                lastName: req.user.lastName
            };
            if (req.user.email == config.adminemail) {
                userinfo.isadmin = true;
            }
            res.json(userinfo);
        } else {
            res.json({authenticated: false});
        }
    });


    app.post('/upload/csv', multipartMiddleware, (req, res) => {
        csvprocessor.handle(req.files.file.path, req.body.description, req.body.account, req.user).then((statements)=>{
            return Categorizer.classify(statements,req.user);
        }).then((data)=>{
            res.json({"message":"OK", data:data});
        }).catch((err)=>{
            res.json({"message":"ERROR"});
        });
    });

    app.post('/statements', Auth.isAuthenticated, (req, res)=>{
       Categorizer.learn(req.body, req.user).then((learned)=>{
           return stmt.StatementModel.upsertAll(learned, req.user);
       }).then((saved)=>{
           res.json(saved);
       }).catch((err)=>{
          res.status(500);
          res.json({"message":"error while saving"});
       });
    });

    app.delete('/statements/:accountid', Auth.isAuthenticated, (req, res) => {
       stmt.StatementModel.deleteByAccount(req.params.accountid, req.user).then(()=>{
           res.json({"status":"ok"});
       }).catch(()=>{
           res.status(500);
           res.json({"message":"error while deleting"});
       });
    });

    app.get('/statistics/:start/:end/:resolution', Auth.isAuthenticated, (req, res) => {
        var query = {"date":{$gt : req.params.start, $lt : req.params.end}};
        stmt.StatementModel.search(query, req.user._id).then((items : any)=>{
            category.CategoryModel.findByUserID(req.user).then((cats) => {
                var result = statCombiner.combine(items, req.params.resolution, <Array<category.ICategory>> cats);
                result.start = req.params.start;
                result.end = req.params.end;
                res.json(result);
            });
        }).catch((err)=>{
            res.status(500);
            res.json({error:err});
        });
    });

    app.get('/', (req, res) => {
        res.render('index');
    });

    app.get('/logout', (req : Request, res) => {
        req.logout();
        res.redirect('/#/login');
    });
}
