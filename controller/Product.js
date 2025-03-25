const config = require("../config/db");
const sql = require('mssql');
const path = require('path')
// Get all products

async function getProducts() {
  try {
      let pool = await sql.connect(config);
      let result = await pool.request().query(`
        SELECT * FROM Tablet
        UNION ALL
        SELECT * FROM Powder
        UNION ALL
        SELECT * FROM Capsule
      `);
      return result.recordset; 
  } catch (error) {
      res.status(500).json({ error: err.message });
  }
}

async function getPowder() {
  try {
      let pool = await sql.connect(config);
      let result = await pool.request().query(`
        SELECT * FROM Powder
      `);
      return result.recordset; 
  } catch (error) {
      res.status(500).json({ error: err.message });
  }
}

async function getTablet() {
  try {
      let pool = await sql.connect(config);
      let result = await pool.request().query(`
        SELECT * FROM Tablet
      `);
      return result.recordset; 
  } catch (error) {
      res.status(500).json({ error: err.message });
  }
}

async function getCapsule() {
  try {
      let pool = await sql.connect(config);
      let result = await pool.request().query(`
        SELECT * FROM Capsule
      `);
      return result.recordset; 
  } catch (error) {
      res.status(500).json({ error: err.message });
  }
}

async function CreateProduct(productDetails, images) {
  let pool;
  try {
    pool = await sql.connect(config);

    // Insert product
    const productResult = await pool
      .request()
      .input("CategoryId", sql.Int, productDetails.CategoryId)
      .input("Product_Name", sql.VarChar(50), productDetails.Product_Name)
      .input("Product_Image", sql.VarChar(200), productDetails.Product_Image)
      .input("Description", sql.VarChar(250), productDetails.Description)
      .input("Regular_Price", sql.Decimal(7, 3), productDetails.Regular_Price)
      .input("Sale_Price", sql.Decimal(7, 3), productDetails.Sale_Price)
      .input("Tax_Status", sql.VarChar(20), productDetails.Tax_Status)
      .input("Stock_Status", sql.TinyInt, productDetails.Stock_Status)
      .input("Weight", sql.Decimal(5, 2), productDetails.Weight)
      .input("Length", sql.Decimal(5, 2), productDetails.Length)
      .input("Width", sql.Decimal(5, 2), productDetails.Width)
      .input("Height", sql.Decimal(5, 2), productDetails.Height)
      .input("Short_Desc", sql.VarChar(200), productDetails.Short_Desc)
      .execute("usp_CreateProduct");

    const productId = productResult.recordset[0].Id; // Get inserted Product ID

    if (!productId) {
      throw new Error("Failed to retrieve Product ID");
    }

    console.log("Product inserted with ID:", productId);

    // Prepare image paths as a table-valued parameter
    const imageTable = new sql.Table("ProductImageTableType");
    imageTable.columns.add("Image_Path", sql.VarChar(255));

    images.forEach(image => {
      imageTable.rows.add(image.path);
    });

    // Insert multiple images in one call
    await pool
      .request()
      .input("CategoryId", sql.Int, productDetails.CategoryId)
      .input("ProductId", sql.Int, productId)
      .input("Images", imageTable)
      .execute("usp_InsertProductImages");

    return { message: "Product and images added successfully" };
  } catch (error) {
    console.error("Error adding product:", error);
    throw new Error(error.message);
  } finally {
    if (pool) pool.close();
  }
}

async function UpdateProduct(productDetails, images = []) {
  let pool;
  try {
    pool = await sql.connect(config);

    // Update product details
    const productResult = await pool
      .request()
      .input("ProductId", sql.Int, productDetails.ProductId)
      .input("CategoryId", sql.Int, productDetails.CategoryId)
      .input("Product_Name", sql.VarChar(50), productDetails.Product_Name)
      .input("Product_Image", sql.VarChar(200), productDetails.Product_Image || null)
      .input("Description", sql.VarChar(250), productDetails.Description)
      .input("Regular_Price", sql.Decimal(7, 3), productDetails.Regular_Price)
      .input("Sale_Price", sql.Decimal(7, 3), productDetails.Sale_Price)
      .input("Tax_Status", sql.VarChar(20), productDetails.Tax_Status)
      .input("Stock_Status", sql.TinyInt, productDetails.Stock_Status)
      .input("Weight", sql.Decimal(5, 2), productDetails.Weight)
      .input("Length", sql.Decimal(5, 2), productDetails.Length)
      .input("Width", sql.Decimal(5, 2), productDetails.Width)
      .input("Height", sql.Decimal(5, 2), productDetails.Height)
      .input("Short_Desc", sql.VarChar(200), productDetails.Short_Desc)
      .execute("usp_UpdateProduct");

    console.log("Product updated successfully.");

    // If images are provided, update them
    if (images.length > 0) {
      const imageTable = new sql.Table("ProductImageTableType");
      imageTable.columns.add("Image_Path", sql.VarChar(255));

      images.forEach(image => {
        imageTable.rows.add(image.path);
      });

      await pool
        .request()
        .input("CategoryId", sql.Int, productDetails.CategoryId)
        .input("ProductId", sql.Int, productDetails.ProductId)
        .input("Images", imageTable)
        .execute("usp_UpdateProductImages");

      console.log("Product images updated successfully.");
    }

    return { message: "Product updated successfully." };
  } catch (error) {
    console.error("Error updating product:", error);
    throw new Error(error.message);
  } finally {
    if (pool) pool.close();
  }
}

async function DeleteProduct(productId, categoryId) {
  let pool;
  try {
    pool = await sql.connect(config);

    await pool
      .request()
      .input("categoryId", sql.Int, categoryId)
      .input("ProductId", sql.Int, productId)
      .execute("usp_DeleteProductImages");

    const deleteProduct = await pool
      .request()
      .input("ProductId", sql.Int, productId)
      .input("CategoryId", sql.Int, categoryId)
      .execute("usp_DeleteProduct");

    return { message: "Product deleted successfully" ,deleteProduct};
  } catch (error) {
    console.error("Error deleting product:", error);
    throw new Error(error.message);
  } finally {
    if (pool) await pool.close();
  }
}


async function getProductImages(categoryId, productId) {
  try {
    let pool = await sql.connect(config);
    let result = await pool
      .request()
      .input("CategoryId", sql.Int, categoryId)
      .input("ProductId", sql.Int, productId)
      .execute("usp_GetProductImages");

    return result.recordset; // Returns an array of image paths
  } catch (error) {
    console.error("Error fetching product images:", error);
    throw new Error(error.message);
  }
}



module.exports={
  getProducts,
  getPowder,
  getTablet,
  getCapsule,
  CreateProduct,
  getProductImages,
  UpdateProduct,
  DeleteProduct
}