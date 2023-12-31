import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import jwt from 'jsonwebtoken';
import bCrypt from 'bcrypt'; // Assuming you have the bcrypt library installed
import User from '../database/models/user.js';
import bcryptjs from 'bcryptjs';
const localStrategy = require('passport-local').Strategy;
import { Strategy } from 'passport-local';
const initializePassport = () => {
	// const opts = {
	// 	jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
	// 	secretOrKey: 'your-secret-key', // Replace with your actual secret key
	// };

	// 	passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
	// 		console.log("jwt payload", jwt_payload);
	// 		User.findById(jwt_payload.sub, (err, user) => {
	// 			if (err) {
	// 				console.log("error in pass", err);
	// 
	// 				return done(err, false);
	// 			}
	// 			if (user) {
	// 				console.log("user in pass", user);
	// 				return done(null, user);
	// 			} else {
	// 				return done(null, false);
	// 			}
	// 		});
	// 	}));

	// Serialization and deserialization are not needed for token-based auth
	// 	passport.serializeUser(function (user, done) {
	// 		done(null, user._id);
	// 	});
	// 
	// 	passport.deserializeUser(function (id, done) {
	// 		done(null, id);
	// 	});

	passport.use('login', new Strategy({
		usernameField: 'email',
		passwordField: 'password'
	}, async (email, password, done) => {
		try {
			const user = await User.findOne({ email });
			if (!user) {
				logger.verbose('User Not Found with username', { meta: username });
				return done(null, false);
			}

			const validate = await isValidPassword(user, password);

			if (!validate) {
				logger.verbose('Invalid Password');
				return done(null, false); // redirect back to login page
			}
			if (user.emailConfirmationToken) {
				logger.verbose('Email confirmation pending');
				return done(null, false);
			}
			return done(null, user, { message: 'Logged in Successfully' });
		} catch (error) {
			return done(error);
		}
	}));
	// Configure the JWT strategy for login
	passport.use('jwt', new JwtStrategy({
		jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
		secretOrKey: 'your-secret-key',
	},
		function (jwt_payload, done) {
			try {
				console.log('jwt data', jwt_payload);
				return done(null, jwt_payload);
			} catch (error) {
				done(error);
			}
			// 			User.findById(jwt_payload.sub, (err, user) => {
			// 				console.log(user);
			// 				// In case of any error, return using the done method
			// 				if (err) {
			// 					console.log(err);
			// 					return done(err);
			// 				}
			// 			
			// 
			// 				// User and password both match, return user from done method
			// 				// which will be treated like success
			// 				return done(null, user);
			// 			});

		})
	);
	var isValidPassword = (user, password) => {
		return bcryptjs.compareSync(password, user.password);
	};
};

const generateAuthToken = (user) => {
	// Generate and return a JWT
	// console.log("user in auth token", user);
	return jwt.sign({ sub: user._id }, 'your-secret-key', { expiresIn: '1h' });
};

const isAuthenticated = (req, res, next) => {
	// Use the passport.authenticate middleware to authenticate requests
	passport.authenticate('jwt', { session: false }, (err, user) => {
		if (err || !user) {
			return res.status(401).send('Only for authenticated users');
		}
		req.user = user;
		next();
	})(req, res, next);
};

export default {
	isAuthenticated,
	generateAuthToken,
	initializePassport
};
// export default {
// 	initializePassport() {
// 		// Configure Passport to use JWT strategy
// 		const opts = {
// 			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
// 			secretOrKey: 'your-secret-key', // Replace with your actual secret key
// 		};
// 
// 		passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
// 			console.log("jwt payload", jwt_payload);
// 			// 			User.findById(jwt_payload.sub, (err, user) => {
// 			// 				if (err) {
// 			// 					console.log("error in pass", err);
// 			// 
// 			// 					return done(err, false);
// 			// 				}
// 			// 				if (user) {
// 			// 					console.log("user in pass", user);
// 			// 					return done(null, user);
// 			// 				} else {
// 			// 					return done(null, false);
// 			// 				}
// 			// 			});
// 		}));
// 
// 		// Serialization and deserialization are not needed for token-based auth
// 		// passport.serializeUser(function (user, done) {
// 		// 	done(null, user._id);
// 		// });
// 
// 		// passport.deserializeUser(function (id, done) {
// 		// 	done(null, id);
// 		// });
// 
// 		// Configure the JWT strategy for login
// 		// 		passport.use('login', new JwtStrategy({
// 		// 			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
// 		// 			secretOrKey: 'your-secret-key',
// 		// 		},
// 		// 			function (jwt_payload, done) {
// 		// 				User.findById(jwt_payload.sub, (err, user) => {
// 		// 					// In case of any error, return using the done method
// 		// 					if (err) {
// 		// 						return done(err);
// 		// 					}
// 		// 					// Username does not exist, log the error and redirect back
// 		// 					if (!user) {
// 		// 						logger.verbose('User Not Found with username', { meta: username });
// 		// 						return done(null, false);
// 		// 					}
// 		// 					// User exists but wrong password, log the error 
// 		// 					if (!isValidPassword(user, password)) {
// 		// 						logger.verbose('Invalid Password');
// 		// 						return done(null, false); // redirect back to login page
// 		// 					}
// 		// 
// 		// 					// If user has not confirmed their email address yet, make sure to not log them in
// 		// 					if (user.emailConfirmationToken) {
// 		// 						logger.verbose('Email confirmation pending');
// 		// 						return done(null, false);
// 		// 					}
// 		// 
// 		// 					// User and password both match, return user from done method
// 		// 					// which will be treated like success
// 		// 					return done(null, user);
// 		// 				});
// 		// 			})
// 		// 		);
// 		// 		var isValidPassword = (user, password) => {
// 		// 			return bCrypt.compare(password, user.password);
// 		// 		};
// 	},
// 
// 	generateAuthToken(user) {
// 		// Generate and return a JWT
// 		return jwt.sign({ sub: user._id }, 'your-secret-key', { expiresIn: '1h' });
// 	},
// 
// 	isAuthenticated(req, res, next) {
// 		// Use the passport.authenticate middleware to authenticate requests
// 		passport.authenticate('jwt', { session: false }, (err, user) => {
// 			if (err || !user) {
// 				return res.status(401).send('Only for authenticated users');
// 			}
// 			req.user = user;
// 			next();
// 		})(req, res, next);
// 	}
// };
