import Location from "../models/Location.js";
import Service from "../models/Service.js";

// Get all enabled locations
export const getLocations = async (req, res) => {
  try {
    const locations = await Location.find({ isDisabled: false })
      .populate("serviceId", "name icon color")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: locations });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Add a new location
export const addLocation = async (req, res) => {
  try {
    const { serviceId, name, address, phone1, phone2, email, latitude, longitude, selectedIcon } = req.body;

    if (!serviceId || !name || !address || !phone1 || !email || !latitude || !longitude || !selectedIcon) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const location = new Location({
      serviceId,
      name,
      address,
      phone1,
      phone2,
      email,
      latitude,
      longitude,
      selectedIcon,
    });

    await location.save();
    res.status(201).json({ success: true, data: location });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Toggle location enable/disable
export const toggleLocationStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const location = await Location.findById(id);
    if (!location) {
      return res.status(404).json({ success: false, message: "Location not found" });
    }

    // Flip the status
    location.isDisabled = !location.isDisabled;
    await location.save();

    res.json({
      success: true,
      message: `Location ${location.isDisabled ? "disabled" : "enabled"} successfully`,
      data: location,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update a location (partial update)
export const updateLocation = async (req, res) => {
  try {
    const { id } = req.params;

    // Only allow these fields to be updated
    const allowed = [
      "serviceId",
      "name",
      "address",
      "phone1",
      "phone2",
      "email",
      "latitude",
      "longitude",
      "selectedIcon",
      // isDisabled is intentionally excluded here; use toggle endpoint
    ];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }
    updates.updatedAt = new Date();

    const updated = await Location.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).populate("serviceId", "name icon color");

    if (!updated) {
      return res.status(404).json({ success: false, message: "Location not found" });
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    // Catch invalid ObjectId casts etc.
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Delete a location
export const deleteLocation = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Location.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Location not found" });
    }

    res.json({ success: true, message: "Location deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};