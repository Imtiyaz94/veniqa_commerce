import express from 'express';
import securityController from '../controllers/securityController';
import HttpStatusCode from 'http-status-codes';
import passport from 'passport';
import passportJwtAuth from '../authentication/passportJwtAuth';
import jwt from 'jsonwebtoken';

var router = express.Router();

/* GET Amazon Endpoint. */
router.get('/', function (req, res, next) {
    res.render('index', { title: 'Veniqa Security' });
});

router.route('/signup').post(securityController.signup);

// router.post('/login', passport.authenticate('login'), (req, res, next) => {
//     // If this part gets executed, it means authentication was successful
//     // Regenerating a new session ID after the user is authenticated
//     let temp = req.session.passport;
//     req.session.regenerate((err) => {
//         req.session.passport = temp;
//         req.session.save((err) => {
//             res.status(HttpStatusCode.OK).send({
//                 email: req.user.email,
//                 name: req.user.name,
//                 referral_token: req.user.referral_token,
//                 emailConfirmed: req.user.emailConfirmationToken ? false : true,
//                 cart: req.user.cart
//             });
//         });
//     });
// });

// Token base auth 
router.post('/login', passport.authenticate('login', { session: false }), (req, res) => {
    const authToken = passportJwtAuth.generateAuthToken(req.user);
    console.log('user in login', authToken);
    const token =
        res.status(HttpStatusCode.OK).send({
            authToken: authToken,
            email: req.user.email,
            name: req.user.name,
            referral_token: req.user.referral_token,
            emailConfirmed: req.user.emailConfirmationToken ? false : true,
            cart: req.user.cart
        });
});


// router.get('/isLoggedIn', (req, res, next) => {
//     return res.status(HttpStatusCode.OK).send(req.isAuthenticated());
// });

// token based
router.get('/isLoggedIn', passport.authenticate('jwt', { session: false }), (req, res) => {
    // console.log("islogged in", req.user);
    // If this middleware is reached, it means the token is valid and user is authenticated
    res.status(HttpStatusCode.OK).send(true);
});

// router.get('/logout', (req, res, next) => {
//     req.logout();
//     if (req.session) {
//         req.session.destroy((err) => {
//             if (err) {
//                 return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send("server error - could not clear out session info completely");
//             }
//             return res.status(HttpStatusCode.OK).send("logged out successfully");
//         });
//     }
//     else {
//         if (req.isUnauthenticated()) {
//             return res.status(HttpStatusCode.OK).send("logged out successfully");
//         }
//         else {
//             return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send("server error - could not log out");
//         }
//     }
// });

// token based
router.post('/logout', (req, res, next) => {
    console.log("logout", req.user);
    // In a token-based system, there's no server-side state to clear
    // The client will simply stop using the token to effectively log out
    const token = jwt.sign({ sub: req.user }, 'your-secret-key', { expiresIn: 0 });
    res.status(HttpStatusCode.OK).send("Logged out successfully");

    // You might want to provide additional instructions to the client
    // req.logOut(options, (err) => {
    //     if (err) {
    //         return next(err);
    //     }
    //     res.redirect('/');
    //     res.status(HttpStatusCode.OK).send("Logged out successfully");
    // });
});


router.route('/resendEmailAddressConfirmationLink').get(securityController.resendEmailAddressConfirmationLink);

router.route('/confirmEmailAddress/:token').get(securityController.confirmEmailAddress);

router.route('/forgotPassword').get(securityController.forgotPassword);

router.route('/validatePasswordResetToken/:token').get(securityController.validatePasswordResetToken);

router.route('/resetPassword').post(securityController.resetPassword);

module.exports = router;