import mongoose from "mongoose";

const NoteSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true, minlength: 3 },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    emailVerified: { type: Boolean, default: false },
    emailVerificationCode: { type: String, default: null },
    emailVerificationExpires: { type: Date, default: null },
    is2FAEnabled: { type: Boolean, default: false },
    twoFactorCode: { type: String, default: null },
    twoFactorAttempts: { type: Number, default: 0 },
    twoFactorLockedUntil: { type: Date, default: null },
    sessionVersion: { type: Number, default: 0 },
    passwordResetRequired: { type: Boolean, default: false },
    securityResetTokenHash: { type: String, default: null },
    securityResetExpires: { type: Date, default: null },
    passwordResetTokenHash: { type: String, default: null },
    passwordResetExpires: { type: Date, default: null },
    emailLoginCodeHash: { type: String, default: null },
    emailLoginExpires: { type: Date, default: null },
    emailLoginAttempts: { type: Number, default: 0 },
    emailLoginLockedUntil: { type: Date, default: null },
    emailRollbackPrevious: { type: String, default: null },
    emailRollbackTokenHash: { type: String, default: null },
    emailRollbackExpires: { type: Date, default: null },
    notes: { type: [NoteSchema], default: [] }
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
