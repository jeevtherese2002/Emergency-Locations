import Service from "../models/Service.js";

// Get all services
export const getServices = async (req, res) => {
  try {
    const services = await Service.find().sort({ name: 1 });
    res.json({ success: true, data: services });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Add a new service
export const addService = async (req, res) => {
  try {
    const { name, icon, color } = req.body;
    if (!name || !icon || !color) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const existing = await Service.findOne({ name });
    if (existing) {
      return res.status(400).json({ success: false, message: "Service already exists" });
    }

    const service = new Service({ name, icon, color });
    await service.save();

    res.status(201).json({ success: true, data: service });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
