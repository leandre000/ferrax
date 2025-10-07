import Wishlist from "../models/wishlist.model.js";
import { logger } from "../config/logger.js";

export const addToWishlist = async (req, res) => {
    const { carId } = req.body;
    const { id } = req.user;

    try {
        let wishlist = await Wishlist.findOne({ user: id });
        if (!wishlist) {
            wishlist = new Wishlist({ user: id, cars: [] });
        }
        if (!wishlist.cars.includes(carId)) {
            wishlist.cars.push(carId);
            await wishlist.save();
            return res.status(200).json({ message: 'Car added to wishlist', success: true });
        } else {
            return res.status(200).json({ message: 'Car already in wishlist', success: true });
        }
    } catch (error) {
        logger.error({ err: error }, 'Error adding car to wishlist');
        return res.status(500).json({ message: 'Error adding car to wishlist' });
    }
};

export const removeFromWishlist = async (req, res) => {
    const { carId } = req.body;
    const { id } = req.user;

    try {
        let wishlist = await Wishlist.findOne({ user: id });
        if (!wishlist) {
            return res.status(200).json({ message: 'Car not in wishlist', success: true });
        }
        if (wishlist.cars.includes(carId)) {
            wishlist.cars.pull(carId);
            await wishlist.save();
            return res.status(200).json({ message: 'Car removed from wishlist', success: true });
        } else {
            return res.status(200).json({ message: 'Car not in wishlist', success: true });
        }
    } catch (error) {
        logger.error({ err: error }, 'Error removing car from wishlist');
        return res.status(500).json({ message: 'Error removing car from wishlist' });
    }
};

export const getWishlist = async (req, res) => {
    const { id } = req.user;
    try {
        const wishlist = await Wishlist.findOne({ user: id }).populate('cars');
        return res.status(200).json({ message: 'Wishlist retrieved successfully', success: true, data: wishlist });
    } catch (error) {
        logger.error({ err : error }, 'Error getting wishlist');
        return res.status(500).json({ message: 'Error getting wishlist' });
    }
};

export const deleteWishlist = async (req, res) => {
    const { id } = req.user;
    try {
        const wishlist = await Wishlist.findOneAndDelete({ user: id });
        if (!wishlist) {
            return res.status(200).json({ message: 'Wishlist not found', success: true });
        }
        return res.status(200).json({ message: 'Wishlist deleted successfully', success: true });
    } catch (error) {
        logger.error({ err : error }, 'Error deleting wishlist');
        return res.status(500).json({ message: 'Error deleting wishlist' });
    }
};

export const clearWishlist = async (req, res) => {
    const { id } = req.user;
    try {
        const wishlist = await Wishlist.findOne({ user: id });
        if (!wishlist) {
            return res.status(200).json({ message: 'Wishlist not found', success: true });
        }
        wishlist.cars = [];
        await wishlist.save();
        return res.status(200).json({ message: 'Wishlist cleared successfully', success: true });
    } catch (error) {
        logger.error({ err : error }, 'Error clearing wishlist');
        return res.status(500).json({ message: 'Error clearing wishlist' });
    }
};