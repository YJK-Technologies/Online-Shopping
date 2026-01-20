

// app.js
const express = require("express");
const cors = require("cors");
const dataRoutes = require("./routes/dataRoutes");
const app = express();
const PORT = 5567;

app.use(cors());
app.use(express.json({limit:'50mb'}));
app.use(express.urlencoded({ limit: "50mb", extended: true })); 
app.get("/heartbeat", (req, res) => {
  res.send("I am alive");
});

app.use("/", dataRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});






















/*




const express = require("express");
const sql = require("mssql");
const cors = require("cors");

const app = express();
const PORT = 5500;

app.use(cors());
app.use(express.json()); // Parse JSON requests

const config = {
  user: "sample",
  password: "12345678",
  server: "localhost",
  database: "sample",
  options: {
    selfsignedCertificate: true,
    encrypt: false,
  },
};

app.get("/", async (req, res) => {
  try {
    await sql.connect(config);
    const result = await sql.query("SELECT * FROM emptab");
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  } finally {
    sql.close();
  }
});
app.post('/add', async (req, res) => {
  const { empno,ename, job,mgr, hiredate,  salary, comm, deptno } = req.body;

  try {
    const pool = await sql.connect(config);
    await pool
      .request()
      .input('empno', sql.Int,empno)
      .input('ename', sql.NVarChar, ename)
      .input('job', sql.NVarChar,job)
      .input('mgr', sql.Int, mgr)
      .input('hiredate', sql.Date, hiredate)
      .input('salary', sql.Int, salary)
      .input('comm', sql.Int, comm)
      .input('deptno', sql.Int, deptno)
      .query('INSERT INTO emptab (empno,ename,job,mgr,hiredate, salary, comm, deptno) VALUES (@empno,@ename,@job,@mgr,@hiredate, @salary,@comm, @deptno)');

    res.status(201).send('Data inserted successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.post("/saveEditedData", async (req, res) => {
  const editedData = req.body.editedData;

  if (!editedData || !editedData.length) {
    res.status(400).send("Invalid or empty editedData array.");
    return;
  }

  try {
    const pool = await sql.connect(config);

    for (const updatedRow of editedData) {
      await pool.request().query`
        UPDATE emptab
        SET
          ename = ${updatedRow.ename},
          job = ${updatedRow.job},
          mgr = ${updatedRow.mgr},
          hiredate = ${updatedRow.hiredate},
          salary = ${updatedRow.salary},
          comm = ${updatedRow.comm},
          deptno = ${updatedRow.deptno}
        WHERE empno = ${updatedRow.empno}
      `;
    }

    res.status(200).send("Edited data saved successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/delete", async (req, res) => {
  const empnosToDelete = req.body.empnos;

  if (!empnosToDelete || !empnosToDelete.length) {
    res.status(400).send("Invalid or empty empnos array.");
    return;
  }

  try {
    const pool = await sql.connect(config);

    const deleteQuery = `
      DELETE FROM emptab
      WHERE empno IN (${empnosToDelete.join(",")})
    `;

    await pool.request().query(deleteQuery);

    res.status(200).send("Rows deleted successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


app.post('/', async (req, res) => {
  try {
    const { empno, ename, job, mgr, hiredate, salary, comm, deptno } = req.body;
    await sql.connect(config);
    await sql.query`
      INSERT INTO emptab (empno, ename, job, mgr, hiredate, salary, comm, deptno)
      VALUES (${empno}, ${ename}, ${job}, ${mgr}, ${hiredate}, ${salary}, ${comm}, ${deptno});
    `;
    res.send('Data inserted successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  } finally {
    sql.close();
  }
});


app.delete('/delete/:empno', async (req, res) => {
  try {
    const empno = req.params.empno;
    await sql.connect(config);
    await sql.query`DELETE FROM emptab WHERE empno = ${empno}`;
    res.send('Data deleted successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  } finally {
    sql.close();
  }
});


app.post("/up", async (req, res) => {
  const updatedRow = req.body;

  try {
    await sql.connect(config);
    await sql.query`
      UPDATE emptab
      SET
        empno = ${updatedRow.empno},
        ename = ${updatedRow.ename},
        job = ${updatedRow.job},
        mgr = ${updatedRow.mgr},
        hiredate = ${updatedRow.hiredate},
        salary = ${updatedRow.salary},
        comm = ${updatedRow.comm},
        deptno = ${updatedRow.deptno}
      WHERE empno = ${updatedRow.empno}
    `;

    res.send("Data updated successfully!");
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  } finally {
    sql.close();
  }
});
*/