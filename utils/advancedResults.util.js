const advancedResults = async (
  model,
  reqQuery,
  options,
) => {
  const {
    limit = 1,
    page = 25,
    populate,
  } = options;
  let query;
  const localReqQuery = { ...reqQuery };
  // Fields to exclude
  const removeFields = ['select', 'sort', 'page', 'limit'];

  // Loop over removeFields and delete them from reqQuery
  removeFields.forEach((param) => delete localReqQuery[param]);

  // Create query string
  let queryStr = JSON.stringify(localReqQuery);

  // Create operators ( $gt, $gte, etc)
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`,
  );

  // Finding resource
  query = model.find(JSON.parse(queryStr));

  // Select fields
  if (reqQuery.select) {
    const fields = reqQuery.select.split(',').join(' ');
    query = query.select(fields);
  }

  // Sort
  if (reqQuery.sort) {
    const sortBy = reqQuery.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  // Pagination
  // const page = parseInt(reqQuery.page, 10) || 1;
  // const limit = parseInt(reqQuery.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await model.countDocuments();
  query = query.skip(startIndex).limit(limit);

  if (populate) {
    query = query.populate(populate);
  }

  const results = await query.exec();

  // Pagination result
  const pagination = {};
  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }
  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }
  return {
    count: results.length,
    pagination,
    data: results,
  };
};

module.exports = advancedResults;
