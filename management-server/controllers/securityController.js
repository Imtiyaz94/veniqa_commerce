import securityService from '../services/securityService';
import httpStatus from 'http-status-codes';
import logger from '../logging/logger';
import User from '../database/models/user';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export default {
    async forgotPassword(req, res, next) {
        let response;
        try {
            response = await securityService.forgotPassword(req.query.email);
            return res.status(response.httpStatus).send(response);
        }
        catch (err) {
            logger.error("Error in forgotPassword Controller", { meta: err });
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ httpStatus: httpStatus.INTERNAL_SERVER_ERROR, status: "failed", errorDetails: err });
        }
    },

    async validatePasswordResetToken(req, res, next) {
        let response;
        try {
            response = await securityService.isPasswordResetTokenValid(req.params.token);
            return res.status(response.httpStatus).send(response);
        }
        catch (err) {
            logger.error("Error in validatePasswordResetToken Controller", { meta: err });
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ httpStatus: httpStatus.INTERNAL_SERVER_ERROR, status: "failed", errorDetails: err });
        }
    },

    async resetPassword(req, res, next) {
        let response;
        try {
            response = await securityService.resetPassword(req.body.token, req.body.newPassword);
            return res.status(response.httpStatus).send(response);
        }
        catch (err) {
            logger.error("Error in resetPassword Controller", { meta: err });
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ httpStatus: httpStatus.INTERNAL_SERVER_ERROR, status: "failed", errorDetails: err });
        }
    },

    async login(req, res, next) {
        // If this part gets executed, it means authentication was successful
        // Regenerating a new session ID after the user is authenticated
        // let temp = req.session.passport;
        // req.session.regenerate((err) => {
        //     req.session.passport = temp;
        //     req.session.save((err) => {
        //         res.status(httpStatus.OK).send({
        //             email: req.user.email,
        //             name: req.user.name,
        //             permissions: req.user.permissions
        //         });
        //     })
        // });

        // using jwt auth for login

        const { email, password } = req.body;

        // Find the user with the provided username
        const user = await User.findOne({ email });
        //  const user = users.find((user) => user.username === username);
        if (!user) {
            return res
                .status(401)
                .json({ message: 'Authentication failed. User not found.' });
        }

        // Compare the provided password with the stored password hash
        const hashed = bcrypt.compare(password, user.password);
        // console.log('hashed', hashed);
        if (!hashed) {
            return res
                .status(401)
                .json({ message: 'Authentication failed. Invalid password.' });
        }
        const userDetails = { email: user.email, permissions: user.permissions };
        const token = jwt.sign(
            userDetails,
            process.env.VENIQA_JWT_SECRET_KEY,

        );
        // req.cookies.session = token;
        // console.log('login session', req.cookies.session);
        // Return the token to the client
        res.cookie('token', token);
        // console.log('res', res);
        return res.status(httpStatus.OK).send({
            email: user.email,
            name: user.name,
            permissions: user.permissions,
            token: token,
            cookies: req.cookies.token,
        });

        //     bcrypt.compareSync(password, user.password, async (err, result) => {
        //       if (err) {
        //         console.log(err);
        //         return res.status(500).json({ message: 'Internal server error.' });
        //       }
        //       if (!result) {
        //         return res
        //           .status(401)
        //           .json({ message: 'Authentication failed. Invalid password.' });
        //       }
        //
        //       console.log('before token');
        //       // Create and sign the JWT token
        //       const token = jwt.sign(
        //         { email: user.email },
        //         process.env.VENIQA_JWT_SECRET_KEY,
        //       );
        //       // Return the token to the client
        //       // return res.status(httpStatus.OK).send({
        //       //   email: req.user.email,
        //       //   name: req.user.name,
        //       //   permissions: req.user.permissions,
        //       //   token: token,
        //       // });
        //       res.json({ token });
        //     });

    },

    async logout(req, res, next) {
        // Since there is no really logic in this and passport is doing most of the job, putting the response logic in controller.
        //     req.logout();
        //     if (req.session) {
        //         req.session.destroy((err) => {
        //             if (err) {
        //                 return res.status(httpStatus.INTERNAL_SERVER_ERROR).send("server error - could not clear out session info completely");
        //             }
        //             return res.status(httpStatus.OK).send("logged out successfully");
        //         });
        //     }
        //     else {
        //         if (req.isUnauthenticated()) {
        //             return res.status(httpStatus.OK).send("logged out successfully");
        //         }
        //         else {
        //             return res.status(httpStatus.INTERNAL_SERVER_ERROR).send("server error - could not log out");
        //         }
        //     }
        // }

        // using jwt for logout
        const token = await req.cookies.token;
        console.log('token', token);
        if (!token) {
            return res.status(401).json({ message: 'No token found, user is already logged out.' });
        }

        jwt.verify(token, process.env.VENIQA_JWT_SECRET_KEY, (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: 'Invalid token, user is already logged out.' });
            }

            // Perform logout actions (e.g., remove token from cookie or invalidate session)
            res.clearCookie('token'); // Clear the token from the cookie

            return res.status(200).json({ message: 'User logged out successfully.', token });
        });
    }
};