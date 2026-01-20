const express = require("express");
const mssql = require("mssql");
const cors = require("cors");

const app = express();
const port = 2000;

app.use(express.json()); // Parse JSON requests
app.use(cors());

const config = {
  user: "sample",
  password: "12345678",
  server: "localhost",
  database: "YJKERP",

  options: {
    trustServerCertificate: true,
    encrypt: false,
  },
};
app.get("/city", async (req, res) => {
  let pool;
  try {
    pool = await mssql.connect(config);
    const result = await pool.query(
      "EXEC sp_attribute_Info 'F','city','',' ', ' ' , NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL"
    );

    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  } finally {
    if (pool) {
      await pool.close();
    }
  }
});
app.get("/country", async (req, res) => {
  let pool;
  try {
    pool = await mssql.connect(config);
    const result = await pool.query(
      "EXEC sp_attribute_Info 'F','country','',' ', ' ' , NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL"
    );

    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  } finally {
    if (pool) {
      await pool.close();
    }
  }
});
app.get("/state", async (req, res) => {
  let pool;
  try {
    pool = await mssql.connect(config);
    const result = await pool.query(
      "EXEC sp_attribute_Info 'F','state','',' ', ' ' , NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL"
    );

    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  } finally {
    if (pool) {
      await pool.close();
    }
  }
});
app.get("/status", async (req, res) => {
  let pool;
  try {
    pool = await mssql.connect(config);
    const result = await pool.query(
      "EXEC sp_attribute_Info 'F','status','',' ', ' ' , NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL"
    );

    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  } finally {
    if (pool) {
      await pool.close();
    }
  }
});

app.post("/add", async (req, res) => {
  const {
    company_no,
    company_name,
    short_name,
    address1,
    address2,
    address3,
    city,
    state,
    pincode,
    country,
    email_id,
    status,
    foundedDate,
    websiteURL,
   // company_logo,
    contact_no,
    annualReportURL,
    enduserid,
    tempstr1,
    tempstr2,
    tempstr3,
    tempstr4,
    datetime1,
    datetime2,
    datetime3,
    datetime4
  } = req.body;
  let pool; 
  try {
    pool = await mssql.connect(config);
    const result = await pool.request()
    .input("mode", mssql.NVarChar, "I") // Insert mode
    .input("company_no", mssql.NVarChar, company_no)
    .input("company_name", mssql.NVarChar, company_name)
    .input("short_name", mssql.NVarChar, short_name)
    .input("address1", mssql.NVarChar, address1)
    .input("address2", mssql.NVarChar, address2)
    .input("address3", mssql.NVarChar, address3)
    .input("city", mssql.NVarChar, city)
    .input("state", mssql.NVarChar, state)
    .input("pincode", mssql.NVarChar, pincode)
    .input("country", mssql.NVarChar, country)
    .input("email_id", mssql.NVarChar, email_id)
    .input("status", mssql.NVarChar, status)
    .input("foundedDate", mssql.NVarChar, foundedDate)
    .input("websiteURL", mssql.NVarChar, websiteURL)
    //.input("company_logo", mssql.VarBinary, company_logo)
    .input("contact_no", mssql.NVarChar, contact_no)
    .input("annualReportURL", mssql.NVarChar, annualReportURL)
    .input("enduserid", mssql.NVarChar, enduserid)
   .input("tempstr1", mssql.NVarChar, tempstr1)
    .input("tempstr2", mssql.NVarChar, tempstr2)
    .input("tempstr3", mssql.NVarChar, tempstr3)
    .input("tempstr4", mssql.NVarChar, tempstr4)
    .input("datetime1", mssql.NVarChar, datetime1)
    .input("datetime2", mssql.NVarChar, datetime2)
    .input("datetime3", mssql.NVarChar, datetime3)
    .input("datetime4", mssql.NVarChar, datetime4)
    .query(
      `EXEC sp_companyinfo @mode, @company_no, @company_name, @short_name, @address1, @address2, @address3, @city, @state, @pincode, @country, @email_id, 
      @status, @foundedDate, @websiteURL, @contact_no, @annualReportURL, @enduserid , 
       @tempstr1, @tempstr2, @tempstr3, @tempstr4, 
      @datetime1, @datetime2, @datetime3, @datetime4`
    );

    res.json({ success: true, message: "Data inserted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  } finally {
    if (pool) {
      await pool.close();
    }
  }
});

app.get("/", async (req, res) => {
  const company_no=req.params.company_no; 
  let pool;
  try {
    pool = await mssql.connect(config);
    const result = await pool.request()
    .query(
      //`EXEC sp_companyinfo 'S', @company_no, '', '', '', '', '', '', '', '', '', '', '', '', '', null, '', '', '', '', '', '', '', '', '', '', ''`
      //`EXEC sp_companyinfo 'A', '', '', '', '', '', '', '', '', '', '', '', '', '', '', null, '', '', '', '', '', '', '', '', '', '', ''`
   `select * from tbl_companyinfo_hdr`
      );

    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  } finally {
    if (pool) {
      await pool.close();
    }
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
/*
app.get("/:company_no", async (req, res) => {
    const company_no=req.params.company_no; 
    let pool;
    try {
      pool = await mssql.connect(config);
      const result = await pool.request()
      .input("company_no", mssql.NVarChar, company_no) // Use company_no
      .query(
        `EXEC sp_companyinfo 'S', @company_no, '', '', '', '', '', '', '', '', '', '', '', '', '', null, '', '', '', '', '', '', '', '', '', '', ''`
     
        );
  
      res.json(result.recordset);
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
    } finally {
      if (pool) {
        await pool.close();
      }
    }
  });





  app.get("/", async (req, res) => {
  const company_no=req.params.company_no; 
  let pool;
  try {
    pool = await mssql.connect(config);
    const result = await pool.request()
    .query(
      `EXEC sp_companyinfo 'A', '', '', '', '', '', '', '', '', '', '', '', '', '', '', null, '', '', '', '', '', '', '', '', '', '', ''`
   
      );

    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  } finally {
    if (pool) {
      await pool.close();
    }
  }
});

*/