const neo4j = require('neo4j-driver');
require('dotenv').config();

const driver = neo4j.driver(
  process.env.COGNODB_URI,
  neo4j.auth.basic('cognodb', process.env.COGNODB_PASSWORD)
);

driver.verifyConnectivity()
  .then(() => console.log('Connected to CognoDB'))
  .catch(err => console.error('CognoDB connection failed:', err.message));

module.exports = driver;