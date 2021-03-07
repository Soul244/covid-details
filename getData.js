const cheerio = require('cheerio');
const axios = require('axios');
const City = require('./models/City');
const Record = require('./models/Record');

async function getLatestData() {
  try {
    const cities = await City.find();
    const result = await axios('https://covid19.saglik.gov.tr/');
    const $ = cheerio.load(result.data);
    const records = [];

    $('#turkiye > g').each(function (index, _) {
      if (cities[index]) {
        const { _id, population100 } = cities[index];

        const weekly100 = parseFloat($(this).find('text').html().replace(',', '.'));
        const weeklyCount = Math.round(population100 * weekly100);
        const daily100 = parseFloat((weekly100 / 7).toFixed(2));
        const dailyCount = Math.round(population100 * daily100);

        const newRecord = {
          city: _id,
          weekly100,
          daily100,
          weeklyCount,
          dailyCount,
        };
        records.push(newRecord);
      }
    });
    await Record.insertMany(records);
  } catch (err) {
    console.log(err);
  }
}

module.exports = {
  getLatestData,
};
