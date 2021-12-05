const router = require("express").Router();
const {
  getAllCategory,
  createCategory,
  deleteCategory,
  getSingleCategory
} = require("../controllers/category");

router.route("/").get(getAllCategory).post(createCategory);
router.route("/:id").get(getSingleCategory).delete(deleteCategory);

module.exports = router;
