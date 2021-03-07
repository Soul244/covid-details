const Record = require('../models/Record');

exports.index = async (req, res) => {
  const records = await Record.find().populate('city');
  console.log(records);
  res.render('home', {
    title: 'Home',
    records,
  });
};
