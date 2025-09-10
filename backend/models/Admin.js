// models/admin.js
import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  createdOn: { type: Date, default: Date.now },
  phone: { type: String },
});

export default mongoose.model('Admin', adminSchema);
