import mongoose from "mongoose";

const historyEntry = new mongoose.Schema(
  {
    oldBalance: { type: Number, required: true },
    newBalance: { type: Number, required: true },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reason: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const walletSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    balance: { type: Number, default: 0 },
    minimum: { type: Number, default: 0 },
    history: [historyEntry],
  },
  { timestamps: true }
);

/**
 * Pre-save hook to push balance changes into history.
 * Requires setting `_userMakingChange`, `_changeReason`, and `balance` on the instance before save.
 */
walletSchema.pre("save", function (next) {
  if (!this.isNew && this.isModified("balance")) {
    const old = this.get("balance", null, { getters: false });
    this.history.push({
      oldBalance: this._previousBalance != null ? this._previousBalance : old,
      newBalance: this.balance,
      changedBy: this._userMakingChange,
      reason: this._changeReason,
    });
  }
  next();
});

/**
 * Method to safely adjust balance and record who/why.
 */
walletSchema.methods.recordChange = async function ({
  newBalance,
  changedBy,
  reason,
}) {
  this._previousBalance = this.balance;
  this._userMakingChange = changedBy;
  this._changeReason = reason;
  this.balance = newBalance;
  return this.save();
};

export default mongoose.model("Wallet", walletSchema);
