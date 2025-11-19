import mongoose from "mongoose";

const userMessageSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  receiver: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const UserMessage = mongoose.model("UserMessage", userMessageSchema);

export default UserMessage;