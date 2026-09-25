const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username : { type: String, required: true, unique: true, trim: true },
  password : { type: String, required: true, minlength: 12 },
  name     : { type: String, default: 'Admin' },
  role     : { type: String, enum: ['admin', 'staff'], default: 'admin' },
  isActive : { type: Boolean, default: true },
}, { timestamps: true });

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeObject = function () {
  const { password, __v, ...rest } = this.toObject();
  return rest;
};

module.exports = mongoose.model('User', userSchema);
