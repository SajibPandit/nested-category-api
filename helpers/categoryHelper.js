const Category = require("../models/Category");

const getParentCategories = (id, categories, parents) => {
  const category = categories.filter((c) => c.id === id);
  for (cate of category) {
    parents.unshift({
      _id: cate._id,
      name: cate.name,
      slug: cate.slug,
      parentId: cate.parentId,
    });
    if (cate.parentId) {
      getParentCategories(cate.parentId, categories, parents);
    }
  }
  return parents;
};

const getChildCategories = (id, categories, childs) => {
  const childCategory = categories.filter((c) => c.parentId === id);
  let child2 = [];
  for (cate of childCategory) {
    childs.push({
      _id: cate.id,
      name: cate.name,
      slug: cate.slug,
      parentId: cate.parentId,
      childrens: getChildCategories(cate.id, categories, child2),
    });
  }
  return childs;
};

const getFormattedSingleCategory = (id, categories, res) => {
  const categoryList = {};
  const parents = [];
  const childs = [];
  let category = categories.filter((c) => c.id === id);
  for (cate of category) {
    categoryList._id = cate.id;
    categoryList.name = cate.name;
    categoryList.slug = cate.slug;
    categoryList.createdAt = cate.createdAt;
    categoryList.parentId = cate.parentId;
    categoryList.childrens = getChildCategories(cate.id, categories, childs);
    categoryList.url = getParentCategories(cate.parentId, categories, parents);
  }

  return categoryList;
};

// const createFormattedCategory = (categories, parentId = null) => {
//   const categoryList = [];
//   let category;
//   if (parentId == null) {
//     category = categories.filter((cat) => cat.parentId == undefined);
//   } else {
//     category = categories.filter((cat) => cat.parentId == parentId);
//   }
//   for (cate of category) {
//     categoryList.push({
//       _id: cate._id,
//       name: cate.name,
//       slug: cate.slug,
//       children: createFormattedCategory(categories, cate._id),
//     });
//   }

//   return categoryList;
// };

const deleteSubCategory = async (category) => {
  Category.find({ parentId: category._id }).then((cat) => {
    if (cat.length > 0) {
      cat.map((c) => deleteSubCategory(c));
    }
  });
  return await Category.findByIdAndDelete({ _id: category._id });
};

module.exports = {
  // createFormattedCategory,
  deleteSubCategory,
  getChildCategories,
  getFormattedSingleCategory,
};
