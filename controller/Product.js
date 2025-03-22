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
      .execute("usp_CreateProduct");

    const productId = productResult.recordset[0].Id; // Get inserted Product ID

    if (!productId) {
      throw new Error("Failed to retrieve Product ID");
    }

    console.log("Product inserted with ID:", productId);

    // Insert images
    for (const image of images) {
      console.log("Inserting Image:", image.path);
      await pool
        .request()
        .input("CategoryId", sql.Int, productDetails.CategoryId)
        .input("ProductId", sql.Int, productId)
        .input("Image_Path", sql.VarChar(255), image.path)
        .execute("usp_InsertProductImage");
    }

    return { message: "Product and images added successfully" };
  } catch (error) {
    console.error("Error adding product:", error);
    throw new Error(error.message);
  } finally {
    if (pool) pool.close();
  }
}

async function UpdateProduct(productId, productDetails, images) {
  let pool;
  try {
    pool = await sql.connect(config);

    // Update product details
    await pool
      .request()
      .input("ProductId", sql.Int, productId)
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
      .execute("usp_UpdateProduct");

    console.log("Product updated:", productId);

    // Update images if provided
    if (images.length > 0) {
      // Delete existing images
      await pool
        .request()
        .input("ProductId", sql.Int, productId)
        .execute("usp_DeleteProductImages");

      // Insert new images
      for (const image of images) {
        console.log("Inserting Image:", image.path);
        await pool
          .request()
          .input("ProductId", sql.Int, productId)
          .input("Image_Path", sql.VarChar(255), image.path)
          .execute("usp_InsertProductImage");
      }
    }

    return { message: "Product updated successfully" };
  } catch (error) {
    console.error("Error updating product:", error);
    throw new Error(error.message);
  } finally {
    if (pool) pool.close();
  }
}

async function DeleteProduct(productId) {
  let pool;
  try {
    pool = await sql.connect(config);

    // Delete product images first
    await pool
      .request()
      .input("ProductId", sql.Int, productId)
      .execute("usp_DeleteProductImages");

    // Delete the product
    await pool
      .request()
      .input("ProductId", sql.Int, productId)
      .execute("usp_DeleteProduct");

    return { message: "Product deleted successfully" };
  } catch (error) {
    console.error("Error deleting product:", error);
    throw new Error(error.message);
  } finally {
    if (pool) pool.close();
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