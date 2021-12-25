const Category = require("../models/Category");

const getParentCategories = (id, categories, parents) => {
  console.log(id);
  const category = categories.filter((c) => c.id === id);
  for (cate of category) {
    parents.unshift({
      id: cate._id,
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
  for (cate of childCategory) {
    childs.push({
      id: cate.id,
      name: cate.name,
      slug: cate.slug,
      parentId: cate.parentId,
    });
  }
  return childs;
};

const getFormattedSingleCategory = (id, categories) => {
  const categoryList = [];
  const parents = [];
  const childs = [];
  let category = categories.filter((c) => c.id === id);
  for (cate of category) {
    categoryList.push({
      id: cate.id,
      name: cate.name,
      slug: cate.slug,
      parentId: cate.parentId,
      childrens: getChildCategories(cate.id, categories, childs),
      parents: getParentCategories(cate.parentId, categories, parents),
    });
  }
  return categoryList;
};

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

const deleteSubCategory = async (category) => {
  Category.find({ parentId: category._id }).then((cat) => {
    if (cat.length > 0) {
      cat.map((c) => deleteSubCategory(c));
    }
  });
  return await Category.findByIdAndDelete({ _id: category._id });
};

module.exports = {
  createFormattedCategory,
  deleteSubCategory,
  getFormattedSingleCategory
}
