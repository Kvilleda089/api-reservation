// Se ejecuta una vez antes de todos los tests: fija la zona horaria.
module.exports = async () => {
  process.env.TZ = 'UTC';
};
