import User from '../models/User.js';
import bcrypt from 'bcrypt';
import { hashPassword } from '../utils/hashPassword.js';

export const baseDetails = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('name profilePicture');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}

export const completeProfile = async (req, res) => {
  try {
    const { fullName, mobile, gender, dateofBirth, address } = req.body;

    // Check if user exists
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Save profile picture path if uploaded
    let profilePicPath = user.profilePicture;
    if (req.file) {
      profilePicPath = `/uploads/profile/${req.file.filename}`;
    }

    // Update user details
    user.name = fullName || user.name;
    user.mobile = mobile || user.mobile;
    user.gender = gender || user.gender;
    user.dateofBirth = dateofBirth || user.dateofBirth;
    user.address = address || user.address;
    user.profilePicture = profilePicPath;
    user.profileCompleted = true;

    await user.save();

    res.status(200).json({
      message: 'Profile updated successfully',
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get full account details
export const getAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -__v'); // exclude sensitive fields
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update account
export const updateAccount = async (req, res) => {
  try {
    const { fullName, mobile, gender, dateofBirth, address } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // handle file upload
    if (req.file) {
      user.profilePicture = `/uploads/profile/${req.file.filename}`;
    }

    // update editable fields
    user.name = fullName || user.name;
    user.mobile = mobile || user.mobile;
    user.gender = gender || user.gender;
    user.dateofBirth = dateofBirth || user.dateofBirth;
    user.address = address || user.address;

    await user.save();

    res.json({ message: 'Account updated successfully', user });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// update password
export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Check if user exists
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if current password is correct
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateLocation = async (req, res) => {
  try {

    const userId = req.user._id;

    const x = req.body.x ?? req.body.lng ?? req.body.longitude;
    const y = req.body.y ?? req.body.lat ?? req.body.latitude;

    const longitude = Number(x);
    const latitude = Number(y);

    if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) {
      return res.status(400).json({ message: 'longitude/latitude (or lng/lat or x/y) must be numbers' });
    }
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({ message: 'Invalid coordinate range' });
    }

    const user = await User.findById(userId).select('_id location lastLocationAt');
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.location = { type: 'Point', coordinates: [longitude, latitude] };
    user.lastLocationAt = new Date();

    await user.save();

    return res.status(200).json({
      message: 'Location updated',
      location: user.location,
      lastLocationAt: user.lastLocationAt,
    });
  } catch (err) {
    console.error('updateLocation error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};