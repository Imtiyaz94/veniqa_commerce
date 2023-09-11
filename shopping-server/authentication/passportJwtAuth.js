import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import jwt from 'jsonwebtoken';
import bCrypt from 'bcrypt'; // Assuming you have the bcrypt library installed
import User from '../database/models/user';


export default {
	initializePassport() {
		// Configure Passport to use JWT strategy
		const opts = {
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: 'your-secret-key', // Replace with your actual secret key
		};

		passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
			User.findById(jwt_payload.sub, (err, user) => {
				if (err) {
					return done(err, false);
				}
				if (user) {
					return done(null, user);
				} else {
					return done(null, false);
				}
			});
		}));

		// Serialization and deserialization are not needed for token-based auth
		passport.serializeUser(function (user, done) {
			done(null, user._id);
		});

		passport.deserializeUser(function (id, done) {
			done(null, id);
		});

		// Configure the JWT strategy for login
		passport.use('login', new JwtStrategy({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: 'your-secret-key',
		},
			function (jwt_payload, done) {
				User.findById(jwt_payload.sub, (err, user) => {
					// if (err) {
					// 	return done(err, false);
					// }
					// 
					// if (user) {
					// 	return done(null, user);
					// } else {
					// 	return done(null, false);
					// }
					// In case of any error, return using the done method
					if (err) {
						return done(err);
					}
					// Username does not exist, log the error and redirect back
					if (!user) {
						logger.verbose('User Not Found with username', { meta: username });
						return done(null, false);
					}
					// User exists but wrong password, log the error 
					if (!isValidPassword(user, password)) {
						logger.verbose('Invalid Password');
						return done(null, false); // redirect back to login page
					}

					// If user has not confirmed their email address yet, make sure to not log them in
					if (user.emailConfirmationToken) {
						logger.verbose('Email confirmation pending');
						return done(null, false);
					}

					// User and password both match, return user from done method
					// which will be treated like success
					return done(null, user);
				});
			})
		);
		var isValidPassword = (user, password) => {
			return bCrypt.compare(password, user.password);
		};
	},

	generateAuthToken(user) {
		// Generate and return a JWT
		return jwt.sign({ sub: user._id }, 'your-secret-key', { expiresIn: '1h' });
	},

	isAuthenticated(req, res, next) {
		// Use the passport.authenticate middleware to authenticate requests
		passport.authenticate('jwt', { session: false }, (err, user) => {
			if (err || !user) {
				return res.status(401).send('Only for authenticated users');
			}
			req.user = user;
			next();
		})(req, res, next);
	}
};
