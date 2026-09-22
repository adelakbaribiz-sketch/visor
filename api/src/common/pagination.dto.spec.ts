import { describe, expect, it } from 'vitest';
import { MAX_PAGE_SIZE, resolvePagination } from './pagination.dto.js';

describe('resolvePagination', () => {
  it('preserves the previous hardcoded behavior when no params are given', () => {
    expect(resolvePagination({})).toEqual({ take: 200 });
  });

  it('computes skip/take from page + pageSize', () => {
    expect(resolvePagination({ page: 3, pageSize: 20 })).toEqual({ skip: 40, take: 20 });
  });

  it('defaults page to 1 when only pageSize is given', () => {
    expect(resolvePagination({ pageSize: 10 })).toEqual({ skip: 0, take: 10 });
  });

  it('caps pageSize at MAX_PAGE_SIZE even if a larger value slips through', () => {
    expect(resolvePagination({ page: 1, pageSize: 9999 })).toEqual({ skip: 0, take: MAX_PAGE_SIZE });
  });

  it('defaults pageSize to MAX_PAGE_SIZE when only page is given', () => {
    expect(resolvePagination({ page: 2 })).toEqual({ skip: MAX_PAGE_SIZE, take: MAX_PAGE_SIZE });
  });
});
