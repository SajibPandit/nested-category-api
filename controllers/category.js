const Category = require("../models/Category");
const slugify = require("slugify");

const createFormattedCategory = (categories, parentId = null) => {
  const categoryList = [];
  let category;
  if (parentId == null) {
    category = categories.filter((cat) => cat.parentId == undefined);
  } else {
    category = categories.filter((cat) => cat.parentId == parentId);
  }
  for (cate of category) {
    categoryList.push({
      _id: cate._id,
      name: cate.name,
      slug: cate.slug,
      children: createFormattedCategory(categories, cate._id),
    });
  }

  return categoryList;
};

exports.getAllCategory = (req, res) => {
  Category.find({}).exec((error, categories) => {
    if (error) {
      res.status(400).json({ error: error.message });
    }
    if (categories) {
      const categoryList = createFormattedCategory(categories);
      return res.status(200).json(categoryList);
    }
  });
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
