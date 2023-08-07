import express from 'express';
import passportAuth from '../authentication/passportAuth';
import catalogController from '../controllers/catalogController';
import { authenticateUser, canManageCatalog, canViewCatalog, isAuthenticated } from '../authentication/jwtAuth';
// import { authorizationMiddleware } from '../authentication/jwtAuth';

var router = express.Router();

/* GET Catalog Endpoint. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Veniqa Curated Catalog' });
});
router.use(authenticateUser);
// router.use(isAuthenticated);

router.post('/search', canViewCatalog, catalogController.searchCatalog);

router.post('/addProduct', canManageCatalog, catalogController.addProductToCatalog);

router.get('/getProductDetails', canViewCatalog, catalogController.getProductDetails);

router.put('/updateProduct', canManageCatalog, catalogController.updateProductInCatalog);

router.delete('/deleteProduct', canManageCatalog, catalogController.deleteProductFromCatalog);

router.get('/getPresignedUrlsForCatalogImageUploads', canManageCatalog, catalogController.getPresignedUrlsForCatalogImageUploads);

module.exports = router;