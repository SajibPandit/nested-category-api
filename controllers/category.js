const Category = require("../models/Category");
const slugify = require("slugify");
const {
  getFormattedSingleCategory,
  // createFormattedCategory,
  deleteSubCategory,
} = require("../helpers/categoryHelper");

// exports.getAllCategory = (req, res) => {
//   Category.find({}).exec((error, categories) => {
//     if (error) {
//       res.status(400).json({ error: error.message });
//     }
//     if (categories.length === 0) {
//       return res.status(404).json({ error: "No categories found" });
//     }
//     if (categories) {
//       const categoryList = createFormattedCategory(categories);
//       return res.status(200).json(categoryList);
//     }
//   });
// };

exports.allCategories = (req, res, next) => {
  Category.find({}).then((category) => {
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "No category found" });
    }
    res.json({ success: true, total: category.length, data: category });
  }).catch((err)=>{
    res.status(400).json({ success: false, message: err.message})
  })
};

exports.getAllRootCategories = (req, res, next) => {
  try {
    Category.find({}).then((category) => {
      if (category) {
        let roots = category.filter((cat) => cat.parentId == undefined);
        if (roots.length === 0) {
          return res
            .status(404)
            .json({ success: false, message: "No root category found" });
        }
        
        res.json({
          success: true,
          total: roots.length,
          data: roots,
        });
      }
    });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

exports.createCategory = async (req, res, next) => {
  try {
    const categoryObj = {
      name: req.body.name,
      slug: slugify(req.body.name, {
        lower: true,
        trim: true,
      }),
    };

    if (req.body.parentId) {
      const sisters = await Category.find({ parentId: req.body.parentId });
      for (sis of sisters) {
        if (sis.slug == categoryObj.slug) {
          return res.status(400).json({
            success: false,
            message: "Duplicate category name under same parent",
          });
        }
      }
    }

    if (req.body.parentId) {
      categoryObj.parentId = req.body.parentId;
    }

    const category = new Category(categoryObj);
    category.save((err, category) => {
      if (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
      if (category) {
        res.status(201).json({
          success: true,
          message: "Category created successfully",
          category,
        });
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById({ _id: req.params.id });
    if (category) {
      await deleteSubCategory(category);
      await Category.findByIdAndDelete({ _id: req.params.id });
      return res
        .status(200)
        .send({ success: true, message: "Category deleted successfully" });
    } else {
      res.status(404).send({ success: false, error: "Category not found" });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getSingleCategory = (req, res, next) => {
  try {
    Category.find({ _id: req.params.id }).then((category) => {
      if (category.length === 0) {
        return res.json({ success: false, error: "Category not found" });
      }
      Category.find({}).exec((error, categories) => {
        if (error) {
          res.status(400).json({ success: false, error: error.message });
        }
        if (categories) {
          const categoryList = getFormattedSingleCategory(
            req.params.id,
            categories,
            res
          );
          return res.status(200).json({
            success: true,
            data: categoryList,
          });
        }
      });
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
