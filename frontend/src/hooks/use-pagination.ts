import { useState, useMemo } from 'react';

export interface UsePaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
  defaultPageSize?: number;
}

export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface PaginationActions {
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setTotalItems: (total: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  reset: () => void;
}

export const usePagination = (options: UsePaginationOptions = {}) => {
  const {
    initialPage = 1,
    initialPageSize = 20,
    defaultPageSize = 20
  } = options;

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalItems, setTotalItems] = useState(0);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(totalItems / pageSize));
  }, [totalItems, pageSize]);

  const state: PaginationState = {
    currentPage,
    pageSize,
    totalItems,
    totalPages
  };

  const actions: PaginationActions = {
    setPage: (page: number) => {
      const clampedPage = Math.max(1, Math.min(page, totalPages));
      setCurrentPage(clampedPage);
    },
    setPageSize: (size: number) => {
      setPageSize(size);
      // 重新计算当前页，确保不会超出范围
      const newTotalPages = Math.ceil(totalItems / size);
      if (currentPage > newTotalPages) {
        setCurrentPage(Math.max(1, newTotalPages));
      }
    },
    setTotalItems: (total: number) => {
      setTotalItems(total);
      // 如果当前页超出了新的总页数，调整到最后一页
      const newTotalPages = Math.ceil(total / pageSize);
      if (currentPage > newTotalPages) {
        setCurrentPage(Math.max(1, newTotalPages));
      }
    },
    nextPage: () => {
      if (currentPage < totalPages) {
        setCurrentPage(currentPage + 1);
      }
    },
    prevPage: () => {
      if (currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    },
    reset: () => {
      setCurrentPage(initialPage);
      setPageSize(defaultPageSize);
      setTotalItems(0);
    }
  };

  // 获取当前页的数据切片
  const getPageData = <T>(data: T[]): T[] => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return data.slice(startIndex, endIndex);
  };

  // 获取分页信息摘要
  const getPaginationSummary = () => {
    if (totalItems === 0) {
      return '暂无数据';
    }
    
    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, totalItems);
    return `显示第 ${start}-${end} 条，共 ${totalItems} 条`;
  };

  return {
    ...state,
    ...actions,
    getPageData,
    getPaginationSummary
  };
};