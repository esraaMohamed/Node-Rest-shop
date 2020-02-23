const Order = require('../modules/orders');
const Product = require('../modules/products');
const mongoose = require('mongoose');

exports.orders_get_all = (req, res, next) => {
    Order.find().select('product quantity _id')
        .populate('product', 'name')
        .exec()
        .then(orders => {
                res.status(200).json({
                    count: orders.length,
                    orders: orders.map(order => {
                        return {
                            _id: order._id,
                            product: order.product,
                            quantity: order.quantity,
                            request: {
                                type: 'GET',
                                url: 'http://localhost:3000/orders/' + order._id
                            }
                        }
                    })
                });
            }
        ).catch(error => {
        res.status(500).json({
            error: error
        });
    });
};

exports.orders_get_order = (req, res, next) => {
    Order.findById(req.params.orderId)
        .populate('product')
        .exec()
        .then(order => {
            if (!order) {
                return res.status(404).json({
                    message: 'Order not found'
                });
            }
            res.status(200).json({
                message: 'Order details',
                _id: order._id,
                product: order.product,
                quantity: order.quantity,
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/orders/'
                }
            });
        }).catch(error => {
        res.status(500).json({
            error: error
        });
    });
};

exports.orders_create_order = (req, res, next) => {
    Product.findById(req.body.productId)
        .then(product => {
            if (!product) {
                return res.status(404).json({
                    message: 'Product not found'
                });
            }
            const order = new Order({
                _id: mongoose.Types.ObjectId(),
                quantity: req.body.quantity,
                product: req.body.productId
            });
            return order.save();
        })
        .then(
            result => {
                console.log(result);
                res.status(201).json({
                    message: 'Order was created',
                    createdOrder: {
                        _id: result._id,
                        quantity: result.quantity,
                        product: result.product
                    },
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/orders/' + result._id
                    }
                });
            }
        ).catch(error => {
        console.log(error);
        res.status(500).json({
            error: error
        });
    });
};

exports.orders_delete_order = (req, res, next) => {
    const id = req.params.orderId;
    Order.deleteOne({_id: id})
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Order deleted',
                request: {
                    type: 'POST',
                    url: 'https://localhost:3000/orders',
                    body: {
                        productId: 'ID',
                        quantity: 'Number'
                    }
                }
            });
        })
        .catch(error => {
            res.status(500).json({
                error: error
            });
        });
};