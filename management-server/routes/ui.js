import express from 'express';
import passportAuth from '../authentication/passportAuth';
import uiController from '../controllers/uiController.js';
import { authenticateUser, canManageFeatured, canViewFeatured } from '../authentication/jwtAuth';
var router = express.Router();

/* GET UI Customizations Endpoint. */
router.get('/', function (req, res, next) {
    res.render('index', { title: 'Veniqa User Interface Customizations' });
});

// router.use(passportAuth.isAuthenticated);
router.use(authenticateUser);


router.post('/featured', canManageFeatured, uiController.updateOrUpsertFeaturedSection);

router.get('/featuredList', canViewFeatured, uiController.getAllFeaturedSections);

router.get('/featured', canViewFeatured, uiController.getFeaturedSection);

router.delete('/featured', canManageFeatured, uiController.deleteFeaturedSection);

module.exports = router;