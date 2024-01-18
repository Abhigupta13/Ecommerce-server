const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  items: { type: [mongoose.Schema.Types.Mixed], required: true },
  totalAmount: { type: Number },
  totalItems: { type: Number },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  //TODO:  we can add enum types
  paymentMethod: { type: String, required: true },
  paymentStatus: {type:String, default:'pending'},
  status: { type: String, default: 'pending' },
  selectedAddress: { type: mongoose.Schema.Types.Mixed, required: true },
});

const virtual = orderSchema.virtual('id');
virtual.get(function () {
  return this._id;
});
orderSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

exports.Order = mongoose.model('Order', orderSchema);