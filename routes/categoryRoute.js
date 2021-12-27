const router = require("express").Router();
const {
  createCategory,
  deleteCategory,
  getSingleCategory,
  getAllRootCategories,
} = require("../controllers/category");

router.route("/").get(getAllRootCategories).post(createCategory);
router.route("/:id").get(getSingleCategory).delete(deleteCategory);

module.exports = router;
