const advancedResults = async (
  model,
  filter,
  options,
) => {
  const {
    limit = 25,
    page = 1,
    populate,
    select,
    sort,
    distinct,
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
  const total = await model.countDocuments(JSON.parse(queryStr));
  query = query.skip(startIndex).limit(limit);

  if (distinct) {
    query = query.distinct(distinct);
  }
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
  const totalCount = await model.find(JSON.parse(queryStr));
  return {
    totalCount: totalCount.length,
    countOnPage: results.length,
    pagination,
    data: results,
  };
};

module.exports = advancedResults;
