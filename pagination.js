function CheckTypeItems(items, start, end) {
  if (Array.isArray(items)) {
    return items.slice(start, end);
  } else {
    return items.slice(start, end);
  }
}

function Pagination(items, page, limit_page) {
  const total = items.length;
  const total_page = Math.ceil(total / limit_page);
  const list_items = { limit: limit_page, total: total, page: page, totalPage: total_page };

  if (total == 0) {
    return;
  } else if (total == limit_page) {
    const serializer = items
    const has_next_page = false;
    const has_prev_page = false;
    list_items['items'] = serializer;
    list_items['hasNextPage'] = has_next_page;
    list_items['hasPrevPage'] = has_prev_page;
    return list_items;
  } else if (total < limit_page) {
    const has_next_page = false;
    const has_prev_page = false;
    list_items['items'] = items;
    list_items['hasNextPage'] = has_next_page;
    list_items['hasPrevPage'] = has_prev_page;
    return list_items;
  } else {
    if (page == 1) {
      const serializer = CheckTypeItems(items, 0, limit_page);
      const has_next_page = true;
      const has_prev_page = false;
      list_items['items'] = serializer;
      list_items['hasNextPage'] = has_next_page;
      list_items['hasPrevPage'] = has_prev_page;
      return list_items;
    } else if (total == total_page) {
      const serializer = CheckTypeItems(items, page * limit_page - 1, total);
      const has_next_page = false;
      const has_prev_page = true;
      list_items['items'] = serializer;
      list_items['hasNextPage'] = has_next_page;
      list_items['hasPrevPage'] = has_prev_page;
      return list_items;
    } else {
      const serializer = CheckTypeItems(items, (page - 1) * limit_page, page * limit_page);
      const has_next_page = true;
      const has_prev_page = true;
      list_items['items'] = serializer;
      list_items['hasNextPage'] = has_next_page;
      list_items['hasPrevPage'] = has_prev_page;
      return list_items;
    }
  }
}
export { Pagination };
