const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');


router.post('/', reviewController.createReview);

router.get('/product/:productId', reviewController.getReviewsByProduct);

router.get('/user/:userId', reviewController.getReviewsByUser);

router.put('/:id_reviews', reviewController.updateReview);

router.delete('/:id_reviews', reviewController.deleteReview);

module.exports = router;
