import mongoose from "mongoose";

export let genderEnum = { male: "male", female: "female" };
export let userAgentEnum = { local: "local", google: "google" };
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      minLength: 2,
      maxLength: 20,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      minLength: 2,
      maxLength: 20,
    },
    email: {
      type: String,
      trim: true,
      // unique: true,
      required: function () {
        if (this.phone) {
          return false;
        }
        return true;
      },
    },
    password: {
      type: String,
      required: function () {
        if (this.userAgent === "google") {
          return false;
        }
        return true;
      },
    },
    gender: {
      type: String,
      enum: Object.values(genderEnum),
      default: "male",
      required: true,
    },
    phone: {
      type: String,
      trim: true,
      // unique: true,
      required: function () {
        if (this.email) {
          return false;
        }
        return true;
      },
    },
    DOB: {
      type: Date,
    },
    userAgent: {
      type: String,
      enum: Object.values(userAgentEnum),
      default: "local",
      required: true,
    },
    otp: {
      type: Number,
      default: undefined,
    },
    otpExpireDate: {
      type: Date,
      default: undefined,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toObject: {
      virtuals: true,
    },
    toJSON: {
      virtuals: true,
    },
  }
);

userSchema
  .virtual("fullName")
  .set(function (value) {
    const fullName = value?.split(" ") || [];
    this.set({ firstName: fullName[0], lastName: fullName[1] });
  })
  .get(function () {
    return `${this.firstName} ${this.lastName}`;
  });
userSchema.virtual("age").get(function () {
  return new Date().getFullYear() - new Date(this.DOB).getFullYear();
});
export const UserModel =
  mongoose.model.User || mongoose.model("User", userSchema);
UserModel.syncIndexes();
