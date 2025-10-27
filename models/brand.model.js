import mongoose from "mongoose"

const brandSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    count : { type : Number },
    logo : { type : String }
})

const Brand = mongoose.model("brands", brandSchema);

export default Brand