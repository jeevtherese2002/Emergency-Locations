import User from "../models/User.js";

export const getSOSContacts = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const user = await User.findById(userId).select("sosContacts");
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({ data: user.sosContacts || [] });
  } catch (err) {
    console.error("getSOSContacts error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const addSOSContact = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const {
      name = "",
      relation = "",
      email = "",
      mobile = "",
    } = req.body || {};

    const emailNorm = String(email).trim().toLowerCase();
    if (!emailNorm) {
      return res.status(400).json({ message: "Email is required for SOS contacts." });
    }

    const user = await User.findById(userId).select("sosContacts");
    if (!user) return res.status(404).json({ message: "User not found" });

    if ((user.sosContacts?.length || 0) >= 5) {
      return res.status(400).json({ message: "You can add a maximum of 5 SOS contacts." });
    }

    const duplicate = (user.sosContacts || []).some(
      (c) => (c.email || "").toLowerCase() === emailNorm
    );
    if (duplicate) {
      return res.status(400).json({ message: "A contact with this email already exists." });
    }

    user.sosContacts.push({
      name: String(name).trim(),
      relation: String(relation).trim(),
      email: emailNorm,
      mobile: String(mobile || "").trim(),
    });

    await user.save();
    return res.status(201).json({
      message: "Contact added successfully",
      data: user.sosContacts,
    });
  } catch (err) {
    console.error("addSOSContact error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateSOSContact = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { contactId } = req.params;
    const { name, relation, email, mobile } = req.body || {};
    const emailNorm = email !== undefined ? String(email).trim().toLowerCase() : undefined;

    const user = await User.findById(userId).select("sosContacts");
    if (!user) return res.status(404).json({ message: "User not found" });

    const contact = user.sosContacts.id(contactId);
    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    // If updating email, ensure present and unique among the user's other contacts
    if (emailNorm !== undefined) {
      if (!emailNorm) {
        return res.status(400).json({ message: "Email is required for SOS contacts." });
      }
      const duplicate = (user.sosContacts || []).some(
        (c) => c._id.toString() !== contactId && (c.email || "").toLowerCase() === emailNorm
      );
      if (duplicate) {
        return res.status(400).json({ message: "Another contact with this email already exists." });
      }
      contact.email = emailNorm;
    }

    if (name !== undefined) contact.name = String(name).trim();
    if (relation !== undefined) contact.relation = String(relation).trim();
    if (mobile !== undefined) contact.mobile = String(mobile).trim();

    await user.save();
    return res.status(200).json({
      message: "Contact updated successfully",
      data: user.sosContacts,
    });
  } catch (err) {
    console.error("updateSOSContact error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const deleteSOSContact = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { contactId } = req.params;

    const user = await User.findById(userId).select("sosContacts");
    if (!user) return res.status(404).json({ message: "User not found" });

    const contact = user.sosContacts.id(contactId);
    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    contact.deleteOne(); // remove the subdocument
    await user.save();

    return res.status(200).json({
      message: "Contact deleted successfully",
      data: user.sosContacts,
    });
  } catch (err) {
    console.error("deleteSOSContact error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};