// controllers/dataController.js
const sql = require("mssql");
const connection = require("../connection/connection");
const transporter = require("../mailer");
const { generateOTP } = require("../utils");
const dbConfig = require("../config/dbConfig");
const multer = require('multer')
const CryptoJS = require('crypto-js');
const upload = multer({ storage: multer.memoryStorage() });//add in top of the datacontroller page
const path = require("path");
const fs = require("fs");
const otpStorage = {};
const AdmZip = require("adm-zip");
const archiver = require("archiver");


const uploadImages = async (req, res) => {
  try {
    let fileUrl;

    // Case 1: File uploaded via multer
    if (req.file) {
      fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    }
    // Case 2: Base64 image in request body
    else if (req.body && req.body.base64 && req.body.filename) {
      const { base64, filename } = req.body;

      // Remove metadata prefix if exists
      const base64Data = base64.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");

      // Save file to uploads folder
      const savePath = path.join(__dirname, "../uploads", filename);
      fs.writeFileSync(savePath, buffer);

      fileUrl = `${req.protocol}://${req.get("host")}/uploads/${filename}`;
    }
    else {
      return res.status(400).json({ error: "No file or base64 data provided" });
    }

    res.json({ url: fileUrl });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const sendOTP = async (email, otp) => {
  const mailOptions = {
    from: "alert@yjktechnologies.com",
    to: email,
    subject: "Login OTP",
    text: `Your OTP is: ${otp}`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error("Error sending OTP:", err);
    throw new Error("Error sending OTP");
  }
};

const VerifyCustomer = async (req, res) => {
  const { customer_email_id } = req.body;

  try {
    const pool = await connection.connectToDatabase();

    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "VC")
      .input("customer_email_id", sql.NVarChar, customer_email_id)
      .query(`EXEC sp_customer_details_info_test 'VC','','','','','','','','','','','','',
      '','','','',@customer_email_id,0,'','','',NULL,'','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    if (result.recordset.length > 0) {
      const customerData = result.recordset[0]; // 👈 fetched data

      const otp = generateOTP();
      await sendOTP(customer_email_id, otp);

      otpStorage[customer_email_id] = otp;

      res.status(200).json({
        message: "OTP sent successfully",
        customer: customerData, // 👈 send data to frontend
      });
    } else {
      res.status(401).json({ message: "Email not found" });
    }

  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({
      message: error.message || "Internal Server Error",
    });
  }
};

const signUp = async (req, res) => {
  const { name, email } = req.body;

  try {
    // Check if the user already exists in the database
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("Email", sql.NVarChar, email)
      .query("SELECT * FROM yjk_users WHERE Ymail = @Email");

    if (result.recordset.length === 0) {
      // If user does not exist, generate and send OTP
      const otp = generateOTP();
      await sendOTP(email, otp);

      // Store OTP temporarily for verification
      otpStorage[email] = otp;

      // Proceed with adding user to the database
      await pool
        .request()
        .input("Name", sql.NVarChar, name)
        .input("Email", sql.NVarChar, email)
        .query("INSERT INTO yjk_users (Name, Ymail) VALUES (@Name, @Email)");

      res.status(200).json({ message: "OTP sent successfully" });
    } else {
      res.status(401).json({ message: "Existing User" });
    }
  } catch (err) {
    console.error("Error during signup:", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const verifyOtp = (req, res) => {
  const { customer_email_id, enteredOtp } = req.body;

  try {
    const storedOtp = otpStorage[customer_email_id];
    if (storedOtp && storedOtp === enteredOtp) {
      // If OTP is valid, clear the OTP storage
      delete otpStorage[customer_email_id];
      res.status(200).json({ message: "OTP verified successfully" });
    } else {
      res.status(401).json({ message: "Invalid OTP" });
    }
  } catch (err) {
    console.error("Error verifying OTP:", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const getvariant = async (req, res) => {
  const { company_code } = req.body;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("company_code", sql.NVarChar, company_code)
      .query(
        "EXEC sp_attribute_Info 'F',@company_code,'Item_variant','','', '','','', NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL"
      );
    res.json(result.recordset);
  } catch (err) {
    console.error("Error during update:", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const getAllItemBrandData = async (req, res) => {
  const { company_code } = req.body;
  try {
    // Connect to the database
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "A")
      .input("company_code", sql.NVarChar, company_code)
      .query(`EXEC sp_item_brand_info  @mode,@company_code,'','','',0,'','','',0,0,0,0,'','','','','','','','','','','',0,0,'','',0,0,'','',
        NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset);
    } else {
      res.status(404).json("Data not found");
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};

const addCustomerDetData = async (req, res) => {
  const {
    customer_code,
    company_code,
    customer_addr_1,
    customer_addr_2,
    customer_addr_3,
    customer_addr_4,
    customer_area,
    customer_state,
    customer_country,
    customer_office_no,
    customer_resi_no,
    customer_mobile_no,
    customer_email_id,
    customer_credit_limit,
    customer_salesman_code,
    contact_person,
    office_type,
    default_customer,
    created_by,
    customer_name
  } = req.body;

  let pool;
  try {
    pool = await sql.connect(dbConfig);

    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "I") // Insert mode
      .input("customer_code", sql.VarChar, customer_code)
      .input("company_code", sql.NVarChar, company_code)
      .input("customer_name", sql.NVarChar, customer_name)
      .input("customer_addr_1", sql.VarChar, customer_addr_1)
      .input("customer_addr_2", sql.VarChar, customer_addr_2)
      .input("customer_addr_3", sql.VarChar, customer_addr_3)
      .input("customer_addr_4", sql.VarChar, customer_addr_4)
      .input("customer_area", sql.VarChar, customer_area)
      .input("customer_state", sql.VarChar, customer_state)
      .input("customer_country", sql.VarChar, customer_country)
      .input("customer_office_no", sql.NVarChar, customer_office_no)
      .input("customer_resi_no", sql.NVarChar, customer_resi_no)
      .input("customer_mobile_no", sql.NVarChar, customer_mobile_no)
      .input("customer_email_id", sql.NVarChar, customer_email_id)
      .input("customer_credit_limit", sql.Decimal(14, 3), customer_credit_limit)
      .input("customer_salesman_code", sql.NVarChar, customer_salesman_code)
      .input("contact_person", sql.NVarChar, contact_person)
      .input("office_type", sql.NVarChar, office_type)
      .input("default_customer", sql.NVarChar, default_customer)
      .input("created_by", sql.NVarChar, created_by)
      .query(
        `EXEC sp_customer_details_info_Test @mode,@customer_code,@company_code,@customer_name, '', '', '', @customer_addr_1, @customer_addr_2, @customer_addr_3, @customer_addr_4,@customer_area,
        @customer_state, @customer_country, @customer_office_no, @customer_resi_no, @customer_mobile_no,@customer_email_id, 
         @customer_credit_limit,@customer_salesman_code,@contact_person,@office_type,@default_customer,'',@created_by,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`
      );


    // Return success response
    if (result.rowsAffected && result.rowsAffected[0] > 0) {
      return res.status(200).json({ success: true, message: 'Data inserted successfully' });
    }
  } catch (err) {
    {
      // Handle unexpected errors
      res.status(500).json({ message: err.message || 'Internal Server Error' });
    }
  }
};

const getItemVariant = async (req, res) => {
  const { company_code, Item_variant } = req.body;

  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "IVV")
      .input("company_code", sql.NVarChar, company_code)
      .input("Item_variant", sql.NVarChar, Item_variant)
      .query(`EXEC sp_item_brand_info @mode,@company_code,'',@Item_variant,'',0,'','','',0,0,0, 0,'','','','','','','','','','','',0,0,'',
        '',0,0,'','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset);
    } else {
      res.status(404).json("Data not found");
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const getPay = async (req, res) => {
  const { company_code } = req.body;

  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "FA")
      .input("company_code", sql.NVarChar, company_code)
      .query(`EXEC sp_attribute_Info 'FA',@company_code,'Payment','','', '','','', NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL
`);
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset);
    } else {
      res.status(404).json("Data not found");
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const addSalesOrderHdr = async (req, res) => {
  const { company_code, bill_date, bill_no, warehouse_code, sales_type, customer_code, sale_amt, net_amt, roff_amt, othr_amt, bill_amt, tax_amount, total_item, pay_type, sman_code,
    payment_mode, customer_name, order_type,
    sales_mode, paid_amount, return_amount, created_by } = req.body;
  let pool;
  try {
    pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "I") // Insert mode
      .input("company_code", sql.NVarChar, company_code)
      .input("bill_date", sql.Date, bill_date)
      .input("bill_no", sql.NVarChar, bill_no)
      .input("warehouse_code", sql.NVarChar, warehouse_code)
      .input("sales_type", sql.NVarChar, sales_type)
      .input("customer_code", sql.NVarChar, customer_code)
      .input("sale_amt", sql.Decimal(14, 2), sale_amt)
      .input("net_amt", sql.Decimal(14, 2), net_amt)
      .input("roff_amt", sql.Decimal(14, 2), roff_amt)
      .input("othr_amt", sql.Decimal(14, 2), othr_amt)
      .input("bill_amt", sql.Decimal(14, 2), bill_amt)
      .input("tax_amount", sql.Decimal(14, 2), tax_amount)
      .input("total_item", sql.Int, total_item)
      .input("pay_type", sql.NVarChar, pay_type)
      .input("sman_code", sql.NVarChar, sman_code)
      .input("payment_mode", sql.NVarChar, payment_mode)
      .input("customer_name", sql.NVarChar, customer_name)
      .input("order_type", sql.NVarChar, order_type)
      .input("sales_mode", sql.VarChar, sales_mode)
      .input("paid_amount", sql.Decimal(14, 2), paid_amount)
      .input("return_amount", sql.Decimal(14, 2), return_amount)
      .input("created_by", sql.NVarChar, created_by)
      .query(`EXEC sp_sales_order_hdr @mode,@company_code,@bill_date,@bill_no,@warehouse_code,@sales_type,@customer_code,@sale_amt,@net_amt,@roff_amt,@othr_amt,@bill_amt,@tax_amount,@total_item,@pay_type,@sman_code,@payment_mode,@customer_name,
        @order_type,'','',@sales_mode,@paid_amount,@return_amount,@created_by,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset);
    } else {
      res.status(404).json({ message: "Data not found" });
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const addSalesOrderDetail = async (req, res) => {
  const { company_code, bill_date, bill_no, warehouse_code, customer_code, item_code, ItemSNo, item_name,
    bill_qty, bill_rate, item_amt, weight, total_weight, pay_type, sales_type, sman_code, customer_name,
    order_type, hsn, tax_amt, discount, discount_amount, created_by, } = req.body;
  let pool;
  try {
    pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "I")
      .input("company_code", sql.NVarChar, company_code)
      .input("bill_date", sql.Date, bill_date)
      .input("bill_no", sql.NVarChar, bill_no)
      .input("warehouse_code", sql.NVarChar, warehouse_code)
      .input("customer_code", sql.NVarChar, customer_code)
      .input("item_code", sql.NVarChar, item_code)
      .input("ItemSNo", sql.BigInt, ItemSNo)
      .input("item_name", sql.NVarChar, item_name)
      .input("bill_qty", sql.Decimal(10, 2), bill_qty)
      .input("bill_rate", sql.Decimal(10, 2), bill_rate)
      .input("item_amt", sql.Decimal(10, 2), item_amt)
      .input("weight", sql.Decimal(8, 3), weight)
      .input("total_weight", sql.Decimal(10, 2), total_weight)
      .input("pay_type", sql.NVarChar, pay_type)
      .input("sales_type", sql.NVarChar, sales_type)
      .input("sman_code", sql.NVarChar, sman_code)
      .input("customer_name", sql.NVarChar, customer_name)
      .input("order_type", sql.NVarChar, order_type)
      .input("hsn", sql.NVarChar, hsn)
      .input("tax_amt", sql.Decimal(14, 2), tax_amt)
      .input("discount", sql.Decimal(5, 2), discount)
      .input("discount_amount", sql.Decimal(14, 2), discount_amount)
      .input("created_by", sql.NVarChar, created_by)
      .query(`EXEC sp_sales_order_details @mode, @company_code,@bill_date,@bill_no,@warehouse_code,@customer_code,@item_code,@ItemSNo,@item_name,@bill_qty,
        @bill_rate,@item_amt,@weight,@total_weight,@pay_type,@sales_type,@sman_code,@customer_name,@order_type,@hsn,@tax_amt,'','',@discount,@discount_amount,@created_by,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);
    res.json({ success: true, message: "Data inserted successfully" });
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const getCategoriesMaster = async (req, res) => {
  const { company_code } = req.body;

  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "ICF")
      .input("company_code", sql.NVarChar, company_code)
      .query(`EXEC sp_Item_Category_Master @mode,'','','','   ','','','',0,0,0,0,'','','','','',@company_code,'','','',''`);
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset);
    } else {
      res.status(404).json("Data not found");
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const Recenty_ViewedInsert = async (req, res) => {
  const { Date, Customer_code, Item_code, company_code, Created_by, } = req.body;

  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("mode", sql.NVarChar, "I")
      .input("Date", sql.DateTime, Date)
      .input("Customer_code", sql.NVarChar, Customer_code)
      .input("Item_code", sql.NVarChar, Item_code)
      .input("company_code", sql.NVarChar, company_code)
      .input("Created_by", sql.NVarChar, Created_by)
      .query(`EXEC sp_Recenty_Viewed @mode, @Date, @Customer_code, @Item_code, @company_code,'', @Created_by, '', '', ''`);

    res.status(200).json({ success: true, message: "Recenty_Viewed insertd successfully" });
  } catch (err) {
    console.error("Error during Recenty_Viewed insert:", err);
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};

const Recenty_ViewedUpdate = async (req, res) => {
  const { Date, Customer_code, Item_code, company_code, Keyfield, Created_by, modified_by, created_date, modifie_date } = req.body;

  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("mode", sql.NVarChar, "U")
      .input("Date", sql.DateTime, Date)
      .input("Customer_code", sql.NVarChar, Customer_code)
      .input("Item_code", sql.NVarChar, Item_code)
      .input("company_code", sql.NVarChar, company_code)
      .input("Keyfield", sql.NVarChar, Keyfield)
      .input("Created_by", sql.NVarChar, Created_by)
      .input("modified_by", sql.NVarChar, modified_by)
      .input("created_date", sql.DateTime, created_date)
      .input("modifie_date", sql.DateTime, modifie_date)
      .query(`EXEC sp_Recenty_Viewed @mode, @Date, @Customer_code, @Item_code, @company_code, @Keyfield, @Created_by, @modified_by, @created_date, @modifie_date`);

    res.status(200).json({ success: true, message: "Recenty_Viewed updated successfully" });
  } catch (err) {
    console.error("Error during Recenty_Viewed update:", err);
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};

const Recenty_ViewedDelete = async (req, res) => {
  const { Customer_code, Item_code, company_code } = req.body;

  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("mode", sql.NVarChar, "D")
      .input("Customer_code", sql.NVarChar, Customer_code)
      .input("Item_code", sql.NVarChar, Item_code)
      .input("company_code", sql.NVarChar, company_code)

      .query(`EXEC sp_Recenty_Viewed @mode,'', @Customer_code, @Item_code, @company_code, '', '', '', '', ''`);

    res.status(200).json({ success: true, message: "Recenty_Viewed deleted successfully" });
  } catch (err) {
    console.error("Error during Recenty_Viewed delete:", err);
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};

const getCategories = async (req, res) => {
  const { Customer_code } = req.body;

  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "FA")
      .input("Customer_code", sql.NVarChar, Customer_code)
      .query(`EXEC sp_Recenty_Viewed @mode, '', @Customer_code, '', '','', '', '', '', ''`);
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset);
    } else {
      res.status(404).json("Data not found");
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

const getSalesOrder = async (req, res) => {
  const { company_code, customer_code } = req.body;

  try {
    const pool = await connection.connectToDatabase();

    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "SO")
      .input("company_code", sql.NVarChar, company_code)
      .input("customer_code", sql.NVarChar, customer_code)
      .query(`EXEC sp_sales_order_hdr @mode,@company_code,'','','','',@customer_code,0,0,0,0,0,0,0,0,'','','','','','','',0,0,'','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset);
    } else {
      res.status(404).json("Data not found");
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  VerifyCustomer,
  signUp,
  verifyOtp,
  getvariant,
  getAllItemBrandData,
  addCustomerDetData,
  uploadImages,
  getItemVariant,
  getPay,
  addSalesOrderHdr,
  addSalesOrderDetail,
  getCategoriesMaster,
  Recenty_ViewedInsert,
  Recenty_ViewedUpdate,
  Recenty_ViewedDelete,
  getCategories,
  getSalesOrder
};