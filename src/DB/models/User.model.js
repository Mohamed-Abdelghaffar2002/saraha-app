import mongoose from "mongoose";

export let genderEnum = { male: "male", female: "female" };
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
      unique: true,
      required: function () {
        if (this.phone) {
          return false;
        }
        return true;
      },
    },
    password: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      enum: Object.values(genderEnum),
      default: "male",
    },
    phone: {
      type: String,
      trim: true,
      unique: true,
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
    confirmEmail: {
      type: Date,
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
    this.set({ firstName: fullName[0], lastName: fullName[-1] });
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
