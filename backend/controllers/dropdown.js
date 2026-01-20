const sql = require("mssql");
const connection = require("../connection/connection");

const getType = async (req, res) => {
    try {
      await connection.connectToDatabase();
      const result = await sql.query(
        "exec spexpensetype"
      );
  
      res.json(result.recordset);
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
    } finally {
      connection.closeDatabaseConnection();
    }
  };
  
  module.exports={
    getType,
  }
  