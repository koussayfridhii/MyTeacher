import mongoose from 'mongoose';

const classSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String },
  cost:        { type: Number, required: true },
  recordingUrl:{ type: String, required: true }
}, { timestamps: true });

export default mongoose.model('Class', classSchema);
