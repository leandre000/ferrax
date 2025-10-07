import express from 'express';
import { addToWishlist, clearWishlist, deleteWishlist, getWishlist, removeFromWishlist } from '../controllers/wishlist.controller.js';

const wishlistRouter = express.Router();

wishlistRouter.post('/add', addToWishlist);
wishlistRouter.post('/:carId/remove', removeFromWishlist);
wishlistRouter.get('/get', getWishlist);
wishlistRouter.delete('/delete', deleteWishlist);
wishlistRouter.delete('/clear', clearWishlist);

export default wishlistRouter;
