const { connectDB, sql } = require("../config/db");
const path = require("path");

// Get all products
async function getProducts() {
  try {
    const pool = await connectDB();
    const result = await pool.request().query(`
      SELECT * FROM Tablet
      UNION ALL
      SELECT * FROM Powder
      UNION ALL
      SELECT * FROM Capsule
    `);
    return result.recordset;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw new Error(error.message);
  }
}

async function getPowder() {
  try {
    const pool = await connectDB();
    const result = await pool.request().query("SELECT * FROM Powder");
    return result.recordset;
  } catch (error) {
    console.error("Error fetching powder products:", error);
    throw new Error(error.message);
  }
}

async function getPowderId(ProductId) {
  try {
    const pool = await connectDB();
    const result = await pool
      .request()
      .input("ProductId", sql.Int, ProductId)
      .query("SELECT * FROM Powder WHERE Id = @ProductId");

    return result.recordset;
  } catch (error) {
    console.error("Error fetching powder product by ID:", error);
    throw new Error(error.message);
  }
}

async function getTablet() {
  try {
    const pool = await connectDB();
    const result = await pool.request().query("SELECT * FROM Tablet");
    return result.recordset;
  } catch (error) {
    console.error("Error fetching tablets:", error);
    throw new Error(error.message);
  }
}

async function getTabletId(ProductId) {
  try {
    const pool = await connectDB();
    const result = await pool
      .request()
      .input("ProductId", sql.Int, ProductId)
      .query("SELECT * FROM Tablet WHERE Id = @ProductId");

    return result.recordset;
  } catch (error) {
    console.error("Error fetching tablet by ID:", error);
    throw new Error(error.message);
  }
}

async function getCapsule() {
  try {
    const pool = await connectDB();
    const result = await pool.request().query("SELECT * FROM Capsule");
    return result.recordset;
  } catch (error) {
    console.error("Error fetching capsules:", error);
    throw new Error(error.message);
  }
}

async function getCapsuleId(ProductId) {
  try {
    const pool = await connectDB();
    const result = await pool
      .request()
      .input("ProductId", sql.Int, ProductId)
      .query("SELECT * FROM Capsule WHERE Id = @ProductId");

    return result.recordset;
  } catch (error) {
    console.error("Error fetching capsule by ID:", error);
    throw new Error(error.message);
  }
}

async function CreateProduct(productDetails, images) {
  try {
    const pool = await connectDB();

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

    const productId = productResult.recordset[0]?.Id;

    if (!productId) {
      throw new Error("Failed to retrieve Product ID");
    }

    console.log("Product inserted with ID:", productId);

    const imageTable = new sql.Table("ProductImageTableType");
    imageTable.columns.add("Image_Path", sql.VarChar(255));

    images.forEach((image) => {
      imageTable.rows.add(image.path);
    });

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
  }
}

async function UpdateProduct(productDetails, images = []) {
  try {
    const pool = await connectDB();

    await pool
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

    if (images.length > 0) {
      const imageTable = new sql.Table("ProductImageTableType");
      imageTable.columns.add("Image_Path", sql.VarChar(255));

      images.forEach((image) => {
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
  }
}

async function DeleteProduct(productId, categoryId) {
  try {
    const pool = await connectDB();

    await pool
      .request()
      .input("CategoryId", sql.Int, categoryId)
      .input("ProductId", sql.Int, productId)
      .execute("usp_DeleteProductImages");

    await pool
      .request()
      .input("ProductId", sql.Int, productId)
      .input("CategoryId", sql.Int, categoryId)
      .execute("usp_DeleteProduct");

    return { message: "Product deleted successfully" };
  } catch (error) {
    console.error("Error deleting product:", error);
    throw new Error(error.message);
  }
}

module.exports = {
  getProducts,
  getPowder,
  getTablet,
  getCapsule,
  CreateProduct,
  UpdateProduct,
  DeleteProduct,
  getPowderId,
  getTabletId,
  getCapsuleId,
};
