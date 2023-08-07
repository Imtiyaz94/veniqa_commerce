import express from 'express';
import securityController from '../controllers/securityController';
var router = express.Router();
import passport from 'passport';
import { authenticateUser, isAuthenticated } from '../authentication/jwtAuth';

/* GET Amazon Endpoint. */
router.get('/', function (req, res, next) {
    res.render('index', { title: 'Veniqa Security' });
});

router.route('/login').post(securityController.login);

router.get('/isLoggedIn', authenticateUser, (req, res, next) => {
    // console.log("loggedin", req);
    return res.status(200).send('User Logged In..');
});

router.route('/logout').get(securityController.logout);

router.route('/forgotPassword').get(securityController.forgotPassword);

router.route('/validatePasswordResetToken/:token').get(securityController.validatePasswordResetToken);

router.route('/resetPassword').post(securityController.resetPassword);

module.exports = router;