const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    // ✅ Added role field (safe default)
    role: { 
        type: String, 
        default: "user"   // by default every user is normal user
    }

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);