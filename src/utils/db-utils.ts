import { FindOptionsWhereProperty, ILike } from 'typeorm';
import { QueryStringOptions } from '../controllers/params/query-options';

export function makeStringWhere(query?: QueryStringOptions) {
  if (!query) {
    return undefined;
  }

  const { is, startsWith, endsWith } = query;
  let where: FindOptionsWhereProperty<string>;

  if (is) {
    where = is;
  } else {
    let ilike = '';

    if (startsWith) {
      ilike += startsWith;
    }

    ilike += '%';

    if (endsWith) {
      ilike += endsWith;
    }

    where = ILike(ilike);
  }

  return where;
}
