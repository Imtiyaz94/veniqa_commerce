import express from 'express';
import passportAuth from '../authentication/passportAuth';
import referenceDataController from '../controllers/referenceDataController';
import { authenticateUser, canManageCategories, canManageTariff, canViewCategories, canViewTariff } from '../authentication/jwtAuth';

var router = express.Router();


/* GET Reference Data Endpoint. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Veniqa Reference Data' });
});
router.use(authenticateUser);

// router.use(passportAuth.isAuthenticated);

router.get('/getCatalogBundle', referenceDataController.getCatalogBundle);

router.get('/getStores', referenceDataController.getStores);

router.get('/getRoles', referenceDataController.getRoles);

router.get('/getWeightUnits', referenceDataController.getWeightUnits);

router.get('/productCategoryList', canViewCategories, referenceDataController.getProductCategoryList);

router.post('/productCategory', canManageCategories, referenceDataController.addProductCategory);

router.get('/productCategory', canViewCategories, referenceDataController.getProductCategory);

router.put('/productCategory', canManageCategories, referenceDataController.updateProductCategory);

router.get('/tariffList', canViewTariff, referenceDataController.getTariffList);

router.post('/tariff', canManageTariff, referenceDataController.addTariffCategory);

router.get('/tariff', canViewTariff, referenceDataController.getTariffCategory);

router.put('/tariff', canManageTariff, referenceDataController.updateTariffCategory);

module.exports = router;