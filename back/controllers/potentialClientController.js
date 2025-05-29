import PotentialClient from "../models/PotentialClient.js";
import mongoose from "mongoose";

// 1. Create Potential Client
export const createPotentialClient = async (req, res, next) => {
  const { name, phone, email, status } = req.body;
  const managerId = req.user._id;

  try {
    const existingClient = await PotentialClient.findOne({ email });
    if (existingClient) {
      return res
        .status(409)
        .json({ message: "Potential client with this email already exists." });
    }

    const potentialClient = new PotentialClient({
      name,
      phone,
      email,
      status,
      manager: managerId,
    });

    await potentialClient.save();

    // Populate manager field before sending response
    const populatedClient = await PotentialClient.findById(
      potentialClient._id
    ).populate("manager", "firstName lastName email");

    res.status(201).json(populatedClient);
  } catch (error) {
    // Check for Mongoose validation errors
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
};

// 2. Assign Assistant
export const assignAssistant = async (req, res, next) => {
  const { id: clientId } = req.params;
  const assistantId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(clientId)) {
    return res.status(400).json({ message: "Invalid client ID format." });
  }

  try {
    const potentialClient = await PotentialClient.findById(clientId);

    if (!potentialClient) {
      return res.status(404).json({ message: "Potential client not found." });
    }

    if (potentialClient.assistant) {
      return res.status(400).json({ message: "Assistant already assigned." });
    }

    // Verify that the client was created at least 1 month ago
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    if (potentialClient.createdAt > oneMonthAgo) {
      return res.status(403).json({
        message:
          "Client not eligible for assistant assignment yet. Must be created at least 1 month ago.",
      });
    }

    // Check if the user assigning is a coordinator (as per schema, but good to double check controller-side if needed)
    // The schema validation for assistant role should handle this, but a controller check can be added if explicit check is desired.
    // For now, relying on schema validation.

    potentialClient.assistant = assistantId;
    await potentialClient.save();

    const populatedClient = await PotentialClient.findById(potentialClient._id)
      .populate("manager", "firstName lastName email")
      .populate("assistant", "firstName lastName email");

    res.status(200).json(populatedClient);
  } catch (error) {
    // Check for Mongoose validation errors (e.g. if assistant role is invalid)
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
};

// 3. Add Comment
export const addComment = async (req, res, next) => {
  const { id: clientId } = req.params;
  const { text } = req.body;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(clientId)) {
    return res.status(400).json({ message: "Invalid client ID format." });
  }

  if (!text || typeof text !== "string" || text.trim() === "") {
    return res.status(400).json({ message: "Comment text is required." });
  }

  try {
    const potentialClient = await PotentialClient.findById(clientId);

    if (!potentialClient) {
      return res.status(404).json({ message: "Potential client not found." });
    }

    const isManager = potentialClient.manager.equals(userId);
    const isAssistant =
      potentialClient.assistant && potentialClient.assistant.equals(userId);

    if (!isManager && !isAssistant) {
      return res
        .status(403)
        .json({ message: "User not authorized to comment on this client." });
    }

    const comment = {
      author: userId,
      text: text.trim(),
    };

    potentialClient.commentaires.push(comment);
    await potentialClient.save();

    const populatedClient = await PotentialClient.findById(potentialClient._id)
      .populate("manager", "firstName lastName email")
      .populate("assistant", "firstName lastName email")
      .populate("commentaires.author", "firstName lastName email");

    res.status(200).json(populatedClient);
  } catch (error) {
    next(error);
  }
};

// 4. Update Status
export const updateStatus = async (req, res, next) => {
  const { id: clientId } = req.params;
  const { status } = req.body;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(clientId)) {
    return res.status(400).json({ message: "Invalid client ID format." });
  }

  // Validate status value against the schema enum
  const allowedStatuses = PotentialClient.schema.path("status").enumValues;
  if (!status || !allowedStatuses.includes(status)) {
    return res.status(400).json({
      message: `Invalid status value. Allowed values are: ${allowedStatuses.join(
        ", "
      )}.`,
    });
  }

  try {
    const potentialClient = await PotentialClient.findById(clientId);

    if (!potentialClient) {
      return res.status(404).json({ message: "Potential client not found." });
    }

    const isManager = potentialClient.manager.equals(userId);
    const isAssistant =
      potentialClient.assistant && potentialClient.assistant.equals(userId);

    if (!isManager && !isAssistant) {
      return res.status(403).json({
        message: "User not authorized to update status for this client.",
      });
    }

    potentialClient.status = status;
    await potentialClient.save();

    const populatedClient = await PotentialClient.findById(potentialClient._id)
      .populate("manager", "firstName lastName email")
      .populate("assistant", "firstName lastName email");

    res.status(200).json(populatedClient);
  } catch (error) {
    // Check for Mongoose validation errors (though status is pre-validated)
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
};

// 5. List Potential Clients
export const listPotentialClients = async (req, res, next) => {
  try {
    const clients = await PotentialClient.find({})
      .populate("manager", "firstName lastName email")
      .populate("assistant", "firstName lastName email")
      .populate("commentaires.author", "firstName lastName email")
      .sort({ createdAt: -1 }); // Optional: sort by creation date

    res.status(200).json(clients);
  } catch (error) {
    next(error);
  }
};
export const getPotentialClientById = async (req, res, next) => {
  const { id: clientId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(clientId)) {
    return res.status(400).json({ message: "Invalid client ID format." });
  }

  try {
    const potentialClient = await PotentialClient.findById(clientId)
      .populate("manager", "firstName lastName email")
      .populate("assistant", "firstName lastName email")
      .populate("commentaires.author", "firstName lastName email");

    if (!potentialClient) {
      return res.status(404).json({ message: "Potential client not found." });
    }

    res.status(200).json(potentialClient);
  } catch (error) {
    next(error);
  }
};
