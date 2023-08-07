import express from 'express';
import orderController from '../controllers/orderController';
import passportAuth from '../authentication/passportAuth';
import { authenticateUser, canManageOrders, canViewOrders } from '../authentication/jwtAuth';
var router = express.Router();

// router.use(passportAuth.isAuthenticated);

router.use(authenticateUser);

router.get('/', function (req, res, next) {
    res.render('index', { title: 'Veniqa Orders' });
});

router.post('/orderList', canViewOrders, orderController.getOrderList);

router.get('/order', canViewOrders, orderController.getOrderDetails);

router.post('/confirmOrder', canManageOrders, orderController.confirmOrder);

router.post('/cancelOrder', canManageOrders, orderController.cancelOrder);

router.post('/markItemAsFulfilling', canManageOrders, orderController.markItemAsFulfilling);

router.post('/markItemAsShipped', canManageOrders, orderController.markItemAsShipped);

router.post('/markItemAsDelivered', canManageOrders, orderController.markItemAsDelivered);

router.put('/updateOrderFulfillmentDetails', canManageOrders, orderController.updateOrderFulfillmentDetails);

router.put('/updateShipmentDetails', canManageOrders, orderController.updateShipmentDetails);

router.put('/updateDeliveryDetails', canManageOrders, orderController.updateDeliveryDetails);

router.post('/addComment', canManageOrders, orderController.addComment);

router.put('/editComment', canManageOrders, orderController.editComment);

router.delete('/deleteComment', canManageOrders, orderController.deleteComment);

module.exports = router;