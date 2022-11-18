const advancedResults = async (
  model,
  filter,
  options,
) => {
  const {
    limit = 1,
    page = 25,
    populate,
    select,
    sort,
  } = options;
  let query;

  // Create query string
  let queryStr = JSON.stringify(filter);

  // Create operators ( $gt, $gte, etc)
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`,
  );

  // Finding resource
  query = model.find(JSON.parse(queryStr));

  // Select fields
  if (select) {
    const fields = select.split(',').join(' ');
    query = query.select(fields);
  }

  // Sort
  if (sort) {
    const sortBy = sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  // Pagination
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
