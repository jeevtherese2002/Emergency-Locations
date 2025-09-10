import Admin from '../models/Admin.js';
import bcrypt from 'bcrypt';
import { hashPassword } from '../utils/hashPassword.js';

export const baseDetails = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user._id).select('name');
    res.json({ success: true, data: admin });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const getMyAccount = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user._id).select('name email phone');
    res.json({ success: true, data: admin });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const updateMyAccount = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const admin = await Admin.findByIdAndUpdate(
      req.user._id,
      { name, phone },
      { new: true }
    ).select('name email phone');
    res.json({ success: true, data: admin });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const admin = await Admin.findById(req.user._id);
    if (!admin) return res.status(404).json({ success: false, message: 'Admin not found' });

    // Check if current password is correct
    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    admin.password = hashedPassword;
    await admin.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}