import Brand from "../models/brand.model.js";

export const createBrand = async (req, res) => {
    const { name, count, logo } = req.body;
    try {
        const brand = new Brand({ name, count, logo });
        await brand.save();
        res.status(201).json({
            success : true,
            message : "Brand created successfully",
            brand : brand
        });
    } catch (error) {
        res.status(400).json({ 
            success : false,
            message : "Internal server error",
            error : error.message
        });
    }
}

export const getAllBrands = async (req, res) => {
    const { limit = 10 } = req.query;
    try {
        const brands = await Brand.find().limit(limit);
        return res.status(200).json({
            success : true,
            message : "Brands found successfully",
            data : {
                brands : brands,
                count : brands.length,
                pagination : {
                    page : 1,
                    limit : limit
                }
            }
        });
    } catch (error) {
        res.status(400).json({ 
            success : false,
            message : "Internal server error",
            error : error.message
        });
    }
}

export const getBrandById = async (req, res) => {
    const { id } = req.params;
    try {
        const brand = await Brand.findById(id);
        if (!brand) {
            return res.status(404).json({ 
                success : false,
                message : "Brand not found" 
            });
        }
        return res.status(200).json({
            success : true,
            message : "Brand found successfully",
            brand : brand
        });
    } catch (error) {
        res.status(400).json({ 
            success : false,
            message : "Internal server error",
            error : error.message
        });
    }
}

export const updateBrand = async (req, res) => {
    const { brandId } = req.params;
    const { name, count, logo } = req.body;
    try {
        const brand = await Brand.findById(brandId);
        if (!brand) {
            return res.status(404).json({ message: "Brand not found" });
        }
        brand.name = name;
        brand.count = count;
        brand.logo = logo;
        await brand.save();
        return res.status(200).json({
            success : true,
            message : "Brand updated successfully",
            brand : brand
        });
    } catch (error) {
        res.status(400).json({ 
            success : false,
            message : "Internal server error",
            error : error.message
        });
    }
}

export const deleteBrand = async (req, res) => {
    const { brandId } = req.params;
    try {
        const brand = await Brand.findById(brandId);
        if (!brand) {
            return res.status(404).json({ 
                success : false,
                message : "Brand not found" 
            });
        }
        await brand.deleteOne();
        return res.status(200).json({
            success : true,
            message : "Brand deleted successfully"
        });
    } catch (error) {
        res.status(400).json({ 
            success : false,
            message : "Internal server error",
            error : error.message
        });
    }
}

export const getBrandByName = async (req, res) => {
    const { name } = req.params;
    try {
        const brand = await Brand.findOne({ name : name });
        if (!brand) {
            return res.status(404).json({ 
                success : false,
                message : "Brand not found" 
            });
        }
        return res.status(200).json({
            success : true,
            message : "Brand found successfully",
            brand : brand
        });
    } catch (error) {
        res.status(400).json({ 
            success : false,
            message : "Internal server error",
            error : error.message
        });
    }
}