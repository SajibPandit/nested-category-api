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

const getParentCategories = async (parentId, parentCategories = null) => {
  const category = await Category.find({ id: parentId });
  if (category) {
    parentCategories = [category[0], ...parentCategories];
    if (category.parentId) {
      getParentCategories(category.parentId, parentCategories);
    }
  }
  console.log(parentCategories);
  return parentCategories;
};

const getChildCategories = async (id) => {
  try {
    const cat = await Category.find({ parentId: id }).then((categories) => {
      if (categories) {
        console.log(categories);
        return categories;
      }
    });
  } catch (error) {}
};

exports.getSingleCategory = async (req, res, next) => {
  try {
    Category.findById(req.params.id)
      .then((category) => {
        if (!category) {
          return res.status(404).json({ message: "Category not found" });
        } else {
          let formattedCategory = {
            id: category.id,
            name: category.name,
            slug: category.slug,
            parentId: category.parentId,
          };
          formattedCategory.childrens = getChildCategories(category.id);
          let parentCategories = [];
          formattedCategory.parents = getParentCategories(
            category.parentId,
            parentCategories
          );

          return res.status(200).json(formattedCategory);
        }
      })
      .catch((err) => {
        return res.status(404).json(err.message);
      });
  } catch (error) {}
};

// exports.getSingleCategory = async (req, res, next) => {
//   try {
//     const category = await Category.findById(req.params.id);

//     if (category) {
//       let categoryList = [];
//       const childrens = getChildCategories(category.id);
//       console.log(childrens);
//       categoryList.push({
//         id: category._id,
//         name: category.name,
//         slug: category.slug,
//         parentId: category.parentId,
//         // parents: getParentCategories(category),
//         // childrens: getChildCategories(category.id),
//       });
//       // const childCategories = await Category.find({
//       //   parentId: category.parentId,
//       // });
//       // let parentCategories = [];
//       // if (category.parentId != null) {
//       //   parentCategories = await getParentCategories(
//       //     category.parentId,
//       //     parentCategories
//       //   );
//       // }
//       // console.log(parentCategories, childCategories);

//       return res.status(200).json(categoryList);
//     } else {
//       return res.status(404).json({ error: "No category found" });
//     }
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
