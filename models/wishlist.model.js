import mongoose from 'mongoose';

const wishlistSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    cars: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Car', required: true }]
}, { timestamps: true })

const Wishlist = mongoose.model('Wishlist', wishlistSchema)

export default Wishlist