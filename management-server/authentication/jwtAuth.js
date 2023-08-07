import bcrypt from 'bcrypt';
import HttpStatusCode from 'http-status-codes';
import User from '../database/models/user';
import * as _ from 'lodash';
import logger from '../logging/logger';
import jwt from 'jsonwebtoken';


// console.log('hello');
const checkPermissions = async (req, res, validPermissions, done) => {
	// console.log("permission", validPermissions);
	const found = await req.user.permissions.some((permission) =>
		validPermissions.includes(permission),
	);
	// console.log("found", found);
	if (found) {
		done();
	} else {
		logger.verbose('User doesnt have necessary permission to access this.');
		return res
			.status(HttpStatusCode.FORBIDDEN)
			.send(
				'Permission denied for the user. User doesnt have necessary permission to access this',
			);
	}
};
// export const authenticateUser = (req, res, next) => {
// 
// 	const authHeader = req.headers.authorization;
// 	const token = authHeader && authHeader.split(' ')[1];
// 	// const token = req.headers.authorization?.split(' ')[1];
// 
// 	if (!token) {
// 		return res.status(401).json({ error: 'Unauthorized' });
// 	}
// 
// 	jwt.verify(token, process.env.VENIQA_JWT_SECRET_KEY, (error, decoded) => {
// 		if (error) {
// 			return res.status(401).json({ error: 'Invalid token' });
// 		}
// 		const userId = decoded.userId;
// 		console.log("userid", userId);
// 
// 		User.findById(userId, (err, user) => {
// 			if (err) {
// 				return res.status(UNAUTHORIZED).send('Unauthorized');
// 			}
// 			console.log('req user', user);
// 			req.user = user;
// 			const validPermissions = decoded;
// 			checkPermissions(req, res, validPermissions, next);
// 			next();
// 		});
// 		// req.user = decoded;
// 		// next();
// 	});
// };

export const authenticateUser = (req, res, next) => {
	// 	console.log("req.headers", req.cookies.token);
	// 	const authHeader = req.headers.authorization;
	// 	console.log('authheader', authHeader);
	// 
	// 	const token = authHeader && authHeader.split(' ')[1];
	const token = req.cookies.token;
	// console.log('token', token);
	if (!token) {
		// console.log('Unauthorized');
		return res.status(401).json({ error: 'Unauthorized! Please login first...' });
	}

	jwt.verify(token, process.env.VENIQA_JWT_SECRET_KEY, async (error, decoded) => {
		if (error) {
			console.log('Invalid token');
			return res.status(401).json({ error: 'Invalid token' });
		}

		const { email, permissions } = decoded;
		// console.log("userId:", email);

		await User.findOne({ email }, (err, user) => {
			if (err) {
				console.log('User retrieval error:', err);
				return res.status(401).send('Unauthorized');
			}

			// console.log ('req user :', req.user);
			req.user = user;
			// console.log('req user', req.user);
			try {
				const validPermissions = decoded.permissions;
				// console.log('valid permis', validPermissions);
				checkPermissions(req, res, validPermissions, next);
				// next();
			} catch (error) {
				console.log(error);
			}
			// next();
		});
	});
};



export const isAuthenticated = (req, res, next) => {
	// console.log("is auth user", req.cookies);
	if (req.cookies.token) {
		next();
		// console.log("isAuth user ", req.cookies.token);
	} else {
		return res
			.status(401)
			.send('Only for logged in users');
	}
};

export const isSuperAdmin = (req, res, next) => {
	const validPermissions = ['SUPERADMIN'];
	return checkPermissions(req, res, validPermissions, next);
};

export const canManageCatalog = (req, res, next) => {
	const validPermissions = ['SUPERADMIN', 'CATALOG_MANAGE'];
	return checkPermissions(req, res, validPermissions, next);
};

export const canViewCatalog = (req, res, next) => {
	const validPermissions = ['SUPERADMIN', 'CATALOG_MANAGE', 'CATALOG_VIEW'];
	return checkPermissions(req, res, validPermissions, next);
};

export const canManageOrders = (req, res, next) => {
	const validPermissions = ['SUPERADMIN', 'ORDER_MANAGE'];
	return checkPermissions(req, res, validPermissions, next);
};

export const canViewOrders = (req, res, next) => {
	const validPermissions = ['SUPERADMIN', 'ORDER_MANAGE', 'ORDER_VIEW'];
	return checkPermissions(req, res, validPermissions, next);
};

export const canViewTariff = (req, res, next) => {
	const validPermissions = ['SUPERADMIN', 'TARIFF_VIEW', 'TARIFF_MANAGE'];
	return checkPermissions(req, res, validPermissions, next);
};

export const canManageTariff = (req, res, next) => {
	const validPermissions = ['SUPERADMIN', 'TARIFF_MANAGE'];
	return checkPermissions(req, res, validPermissions, next);
};

export const canViewCategories = (req, res, next) => {
	const validPermissions = ['SUPERADMIN', 'CATEGORIES_VIEW', 'CATEGORIES_MANAGE'];
	return checkPermissions(req, res, validPermissions, next);
};

export const canManageCategories = (req, res, next) => {
	const validPermissions = ['SUPERADMIN', 'CATEGORIES_MANAGE'];
	return checkPermissions(req, res, validPermissions, next);
};

export const canViewFeatured = (req, res, next) => {
	const validPermissions = ['SUPERADMIN', 'FEATURED_MANAGE', 'FEATURED_VIEW', 'FEATURED_PREVIEW'];
	return checkPermissions(req, res, validPermissions, next);
};

export const canManageFeatured = (req, res, next) => {
	const validPermissions = ['SUPERADMIN', 'FEATURED_MANAGE'];
	return checkPermissions(req, res, validPermissions, next);
};


// export default {
// 
// 
// 
// 
// 	isSuperAdmin: (req, res, next) => {
// 		const validPermissions = ['SUPERADMIN'];
// 		return checkPermissions(req, res, validPermissions, next);
// 	},
// 
// 	canManageCatalog: (req, res, next) => {
// 		const validPermissions = ['SUPERADMIN', 'CATALOG_MANAGE'];
// 		return checkPermissions(req, res, validPermissions, next);
// 	},
// 
// 	canViewCatalog: (req, res, next) => {
// 		const validPermissions = ['SUPERADMIN', 'CATALOG_MANAGE', 'CATALOG_VIEW'];
// 		return checkPermissions(req, res, validPermissions, next);
// 	},
// 
// 	canManageOrders: (req, res, next) => {
// 		const validPermissions = ['SUPERADMIN', 'ORDER_MANAGE'];
// 		return checkPermissions(req, res, validPermissions, next);
// 	},
// 
// 	canViewOrders: (req, res, next) => {
// 		const validPermissions = ['SUPERADMIN', 'ORDER_MANAGE', 'ORDER_VIEW'];
// 		return checkPermissions(req, res, validPermissions, next);
// 	},
// 
// 	canViewTariff: (req, res, next) => {
// 		const validPermissions = ['SUPERADMIN', 'TARIFF_VIEW', 'TARIFF_MANAGE'];
// 		return checkPermissions(req, res, validPermissions, next);
// 	},
// 
// 	canManageTariff: (req, res, next) => {
// 		const validPermissions = ['SUPERADMIN', 'TARIFF_MANAGE'];
// 		return checkPermissions(req, res, validPermissions, next);
// 	},
// 
// 	canViewCategories: (req, res, next) => {
// 		const validPermissions = ['SUPERADMIN', 'CATEGORIES_VIEW', 'CATEGORIES_MANAGE'];
// 		return checkPermissions(req, res, validPermissions, next);
// 	},
// 
// 	canManageCategories: (req, res, next) => {
// 		const validPermissions = ['SUPERADMIN', 'CATEGORIES_MANAGE'];
// 		return checkPermissions(req, res, validPermissions, next);
// 	},
// 
// 	canViewFeatured: (req, res, next) => {
// 		const validPermissions = [
// 			'SUPERADMIN',
// 			'FEATURED_MANAGE',
// 			'FEATURED_VIEW',
// 			'FEATURED_PREVIEW',
// 		];
// 		return checkPermissions(req, res, validPermissions, next);
// 	},
// 
// 	canManageFeatured: (req, res, next) => {
// 		const validPermissions = ['SUPERADMIN', 'FEATURED_MANAGE'];
// 		return checkPermissions(req, res, validPermissions, next);
// 	},
// };
