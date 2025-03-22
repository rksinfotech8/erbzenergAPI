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

router.put("/product/update/:id", upload.array("images", 6), async (req, res) => {
  try {
    console.log("Request body:", req.body);
    console.log("Uploaded files:", req.files);

    const productId = parseInt(req.params.id);
    const productDetails = req.body;
    const images = req.files.map(file => ({ path: file.path }));

    const result = await product.UpdateProduct(productId, productDetails, images);

    res.status(200).json(result);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: error.message });
  }
});

router.delete("/product/delete/:id", async (req, res) => {
  try {
    const productId = parseInt(req.params.id);

    const result = await product.DeleteProduct(productId);

    res.status(200).json(result);
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;