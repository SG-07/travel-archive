const express = require('express');
const router = express.Router({ mergeParams: true });
const wrapAsync = require('../utils/wrapAsync.js');
const reviewController = require('../controllers/review.js');
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');  


//Post route
router.post('/', isLoggedIn, validateReview, wrapAsync(reviewController.createReview));

//Edit Route
router.get('/:reviewId/edit', isLoggedIn, isReviewAuthor, wrapAsync(reviewController.editReview));


router.route('/:reviewId')
      .put(isLoggedIn, isReviewAuthor, wrapAsync(reviewController.updateReview))   //Update Route
      .delete(isLoggedIn, isReviewAuthor, wrapAsync(reviewController.destroyReview));  //Delete Route


module.exports = router;