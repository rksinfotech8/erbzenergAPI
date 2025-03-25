const express = require("express");
const router = express.Router();
const product = require("../controller/Product");
const upload = require("../config/multerConfig");

router.get('/product/all', async (req, res) => {
    try {
        const data = await product.getProducts();
        if(Object.keys(data) && Object.keys(data).length > 0)
        {
            res.json(data);
        }
        else{
            res.status(404).json({ message: 'No product found.' });
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
});

router.get('/powder/all', async (req, res) => {
  try {
      const data = await product.getPowder();
      if(Object.keys(data) && Object.keys(data).length > 0)
      {
          res.json(data);
      }
      else{
          res.status(404).json({ message: 'No product found.' });
      }
  } catch (error) {
      res.status(500).send(error.message);
  }
});

router.get('/tablet/all', async (req, res) => {
  try {
      const data = await product.getTablet();
      if(Object.keys(data) && Object.keys(data).length > 0)
      {
          res.json(data);
      }
      else{
          res.status(404).json({ message: 'No product found.' });
      }
  } catch (error) {
      res.status(500).send(error.message);
  }
});


router.get('/capsule/all', async (req, res) => {
  try {
      const data = await product.getCapsule();
      if(Object.keys(data) && Object.keys(data).length > 0)
      {
          res.json(data);
      }
      else{
          res.status(404).json({ message: 'No product found.' });
      }
  } catch (error) {
      res.status(500).send(error.message);
  }
});

router.post("/product/create", upload.array("images", 6), async (req, res) => {
  try {
    console.log("Request body:", req.body); // Debugging line
    console.log("Uploaded files:", req.files); // Debugging line

    const productDetails = req.body;
    const images = req.files.map(file => ({ path: file.path })); // Extract file paths

    const result = await product.CreateProduct(productDetails, images);

    res.status(200).json(result);
  } catch (error) {
    console.error("Error handling request:", error);
    res.status(500).json({ error: error.message });
  }
});

router.put("/product/update/:id", upload.array("images", 6), async (req, res) => {
  try {
    console.log("Request body:", req.body);
    console.log("Uploaded files:", req.files);

    const productId = parseInt(req.params.id, 10);
    if (isNaN(productId)) {
      return res.status(400).json({ error: "Invalid product ID" });
    }

    // Extract and parse product details
    const productDetails = {
      ProductId: productId,
      CategoryId: parseInt(req.body.CategoryId, 10) || null,
      Product_Name: req.body.Product_Name,
      Product_Image: req.body.Product_Image || null, // Image is optional
      Description: req.body.Description,
      Regular_Price: parseFloat(req.body.Regular_Price) || 0,
      Sale_Price: parseFloat(req.body.Sale_Price) || 0,
      Tax_Status: req.body.Tax_Status,
      Stock_Status: parseInt(req.body.Stock_Status, 10) || 0,
      Weight: parseFloat(req.body.Weight) || 0,
      Length: parseFloat(req.body.Length) || 0,
      Width: parseFloat(req.body.Width) || 0,
      Height: parseFloat(req.body.Height) || 0,
      Short_Desc: req.body.Short_Desc,
    };

    // Handle optional images correctly
    const images = req.files && req.files.length > 0 ? req.files.map(file => ({ path: file.path })) : [];

    // Call service to update product
    const result = await product.UpdateProduct(productDetails, images);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error updating product:", error);
    return res.status(500).json({ error: error.message });
  }
});

router.delete("/product/delete/:productId/:categoryId", async (req, res) => {
  try {
    const { productId, categoryId } = req.params;
    const result = await product.DeleteProduct(parseInt(productId), parseInt(categoryId));
    res.status(200).json(result);
  } catch (error) {
    console.error("Error handling delete request:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/product/images/:categoryId/:productId", async (req, res) => {
  try {
    const { categoryId, productId } = req.params;

    const images = await product.getProductImages(categoryId, productId);

    if (images.length > 0) {
      res.json(images);
    } else {
      res.status(404).json({ message: "No images found for this product." });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;