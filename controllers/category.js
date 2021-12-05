const Category = require("../models/Category");
const slugify = require("slugify");

exports.getAllCategory = async (req, res, next) => {
  try {
    const categories = await Category.find({});
    if (categories) {
      return res.status(200).json(categories);
    } else {
      return res.status(404).json({ error: "Error Occured!" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
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
    const categoryExists = await Category.findOne({ slug: categoryObj.slug });
    if (categoryExists) {
      res.status(500).json({ message: "Category must need to be unique" });
    } else {
      if (req.body.parentId) {
        categoryObj.parentId = req.body.parentId;
      }

      const category = new Category(categoryObj);
      category.save((err, category) => {
        if (err) {
          return res.status(500).json({ err });
        }
        if (category) {
          res
            .status(201)
            .json({ message: "Category created successfully", category });
        }
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById({ _id: req.params.id });
    if (category) {
      await deleteSubCategory(category);
      await Category.findByIdAndDelete({ _id: req.params.id });
      return res.status(200).send({ message: "Category deleted successfully" });
    } else {
      res.status(404).send({ message: "Category not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteSubCategory = async (category) => {
  const cat = await Category.find({ parentId: category._id }).then((cat) => {
    if (cat.length > 0) {
      cat.map((c) => deleteSubCategory(c));
    }
  });
  return await Category.findByIdAndDelete({ _id: category._id });
};

exports.getSingleCategory = async (req, res, next) => {
  try {
    const category = await Category.findOne({ _id: req.params.id });
    if (category) {
      return res.status(200).json(category);
    } else {
      return res.status(404).json({ error: "No category found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
