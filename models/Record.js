const mongoose = require('mongoose');

const { Schema } = mongoose;

const recordSchema = new mongoose.Schema(
  {
    city: { type: Schema.Types.ObjectId, ref: 'city' },
    weekly100: { type: Number },
    daily100: { type: Number },
    weeklyCount: { type: Number },
    dailyCount: { type: Number },
  },
  { timestamps: true }
);

const Record = mongoose.model('record', recordSchema);

module.exports = Record;
