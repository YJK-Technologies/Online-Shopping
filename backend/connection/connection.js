// connection.js

const sql = require("mssql");
const dbConfig = require("../config/dbConfig");
//const dbConfig = require("../config/erpconfig");

const connectToDatabase = async () => {
  try {
    return await sql.connect(dbConfig);
   
  } catch (error) {
    console.error("Error connecting to the database:", error);
    throw error;
  }
};

const closeDatabaseConnection = () => {
  sql.close();
};

module.exports = {
  connectToDatabase,
  closeDatabaseConnection,
};
/*
const sql = require("mssql");
const config = require("../config/dbConfig");

const connectToDatabase = async () => {
  try {
    return await sql.connect(config);
  } catch (error) {
    console.error("Error connecting to the database:", error);
    throw error;
  }
};

const closeDatabaseConnection = () => {
  sql.close();
};

module.exports = {
  connectToDatabase,
  closeDatabaseConnection,
};
 */