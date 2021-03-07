const mongoose = require('mongoose');

const citySchema = new mongoose.Schema(
  {
    name: { type: String, unique: true, required: true },
    population: { type: Number, required: true },
    population100: { type: Number },
  },
  { timestamps: true }
);

const City = mongoose.model('city', citySchema);

module.exports = City;
