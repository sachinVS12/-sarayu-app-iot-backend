const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require('crypto');

const managerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phonenumber: {
      type: String,
      required: false,
    },
    topics: {
      type: [String],
      default: [],
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    favorites: {
      type: [String],
      default: [],
    },
    graphwl: {
      type: [String],
      default: [],
    },
    password: {
      type: String,
      select: false,
      required: [true, "Password is required"],
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    layout: {
      type: String,
      default: "layout1",
    },
    assignedDigitalMeters: {
      type: [
        {
          topic: String,
          meterType: String,
          minValue: Number,
          maxValue: Number,
          ticks: Number,
          label : String
        },
      ],
      default: [],
    },
    role: {
      type: String,
      default: "manager",
    },
    headerOne: {
      type: String,
    },
    headerTwo: {
      type: String,
    },
    tagnames: [
      {
        type: String,
      },
    ],
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Pre-save middleware to hash the password before saving to database
managerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// method to generate the jwt token for the loggedin or signedup users
managerSchema.methods.getToken = function () {
  return jwt.sign(
    {
      id: this._id,
      name: this.name,
      email: this.email,
      role: this.role,
      assignedDigitalMeters: this.assignedDigitalMeters,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "3d",
    }
  );
};

//method to verify the user entered password with the existing password in the database
managerSchema.methods.verifyPass = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password reset token
managerSchema.methods.getResetPasswordToken = function () {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire (10 minutes)
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// Add a virtual field to reverse populate supervisors under the manager
managerSchema.virtual("supervisors", {
  ref: "Supervisor",
  localField: "_id",
  foreignField: "manager",
});

// Enable text search on name and email
managerSchema.index({ name: 'text', email: 'text' });

const Manager = mongoose.model("Manager", managerSchema);

module.exports = Manager;
