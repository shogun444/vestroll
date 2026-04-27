"use client";

import React, { useState, useMemo } from "react";
import TableContent from "./TableContent";
import TableFilterHeader from "./TableFilterHeader";
import TableHeader, { TableColumn } from "./TableHeader";
import Pagination from "@/components/ui/Pagination";

interface TableProps<T = any> {
  data: T[];
  columns: TableColumn[];
  search: string;
  setSearch: (value: string) => void;
  showModal: () => void;

  // Table configuration
  selectedTab?: string;
  searchPlaceholder?: string;
  showCheckbox?: boolean;
  showFilterHeader?: boolean;
  showSearch?: boolean;
  seeAllHref?: string;

  // Pagination
  showPagination?: boolean;
  itemsPerPage?: number;
  showResultsPerPage?: boolean;
  resultsPerPageOptions?: number[];
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;

  // Selection functionality
  selectedItems?: string[];
  onSelectItem?: (id: string, checked: boolean) => void;
  onSelectAll?: (checked: boolean) => void;

  // Interaction
  onRowClick?: (item: T) => void;
  renderCell: (item: T, column: TableColumn) => React.ReactNode;
  renderMobileCell: (item: T) => React.ReactNode;

  // Empty state customization
  emptyTitle?: string;
  emptyDescription?: string;
  getItemId?: (item: T) => string;

  // Filter header props
  SearchIcon?: React.ComponentType;
  FilterIcon?: React.ComponentType;
}

const Table = <T extends Record<string, any>>({
  data,
  columns,
  search,
  setSearch,
  showModal,
  selectedTab = "Data",
  searchPlaceholder = "Search...",
  showCheckbox = true,
  showFilterHeader = true,
  showSearch = true,
  seeAllHref,
  showPagination = false,
  itemsPerPage: initialItemsPerPage = 10,
  showResultsPerPage = false,
  resultsPerPageOptions = [10, 25, 50, 100],
  currentPage: controlledCurrentPage,
  totalPages: controlledTotalPages,
  totalItems,
  onPageChange,
  onItemsPerPageChange,
  selectedItems = [],
  onSelectItem,
  onSelectAll,
  onRowClick,
  renderCell,
  renderMobileCell,
  emptyTitle,
  emptyDescription,
  getItemId,
  SearchIcon,
  FilterIcon,
}: TableProps<T>) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);
  const isPaginationControlled =
    controlledCurrentPage !== undefined &&
    controlledTotalPages !== undefined &&
    totalItems !== undefined &&
    onPageChange !== undefined;
  const activeCurrentPage = controlledCurrentPage ?? currentPage;
  const activeTotalPages =
    controlledTotalPages ?? Math.ceil(data.length / itemsPerPage);
  const activeTotalItems = totalItems ?? data.length;

  // Calculate pagination values
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
    onItemsPerPageChange?.(newItemsPerPage);
  };
  const startIndex = (activeCurrentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = useMemo(
    () => (isPaginationControlled ? data : data.slice(startIndex, endIndex)),
    [data, endIndex, isPaginationControlled, startIndex],
  );

  const allSelected =
    paginatedData.length > 0 &&
    paginatedData.every((item) => {
      const itemId = getItemId
        ? getItemId(item)
        : item.id || item._id || String(Math.random());
      return selectedItems.includes(itemId);
    });
  const isAllDataSelected =
    data.length > 0 && selectedItems.length === data.length;

  const handlePageChange = (page: number) => {
    onPageChange?.(page);
    setCurrentPage(page);
  };

  const handleSelectAll = (checked: boolean) => {
    if (showPagination) {
      const currentPageIds = paginatedData.map((item) =>
        getItemId
          ? getItemId(item)
          : item.id || item._id || String(Math.random()),
      );

      if (checked) {
        // Add current page items to selection
        currentPageIds.forEach((id) => {
          if (!selectedItems.includes(id)) {
            onSelectItem?.(id, true);
          }
        });
      } else {
        // Remove current page items from selection
        currentPageIds.forEach((id) => {
          if (selectedItems.includes(id)) {
            onSelectItem?.(id, false);
          }
        });
      }
    } else {
      // For non-paginated tables, select all items
      onSelectAll?.(checked);
    }
  };

  return (
    <div>
      <div className="pb-4">
        {showFilterHeader && (
          <div className="">
            <TableFilterHeader
              selectedTab={selectedTab}
              search={search}
              setSearch={setSearch}
              showModal={showModal}
              searchPlaceholder={searchPlaceholder}
              showSearch={showSearch}
              seeAllHref={seeAllHref}
              SearchIcon={SearchIcon}
              FilterIcon={FilterIcon}
            />
          </div>
        )}
      </div>
      <div className="md:overflow-x-auto bg-white p-4 rounded-lg custom-scrollbar dark:bg-gray-900">
        <TableHeader
          columns={columns}
          showCheckbox={showCheckbox}
          onSelectAll={handleSelectAll}
          allSelected={showPagination ? allSelected : isAllDataSelected}
        />
        <TableContent
          data={paginatedData}
          columns={columns}
          search={search}
          showCheckbox={showCheckbox}
          selectedItems={selectedItems}
          onSelectItem={onSelectItem}
          onRowClick={onRowClick}
          renderCell={renderCell}
          emptyTitle={emptyTitle}
          emptyDescription={emptyDescription}
          getItemId={getItemId}
          renderMobileCell={renderMobileCell}
        />
      </div>

      {showPagination && activeTotalPages > 1 && (
        <Pagination
          currentPage={activeCurrentPage}
          totalPages={activeTotalPages}
          onPageChange={handlePageChange}
          itemsPerPage={itemsPerPage}
          totalItems={activeTotalItems}
          showInfo={true}
          showResultsPerPage={showResultsPerPage}
          onItemsPerPageChange={handleItemsPerPageChange}
          resultsPerPageOptions={resultsPerPageOptions}
        />
      )}
    </div>
  );
};

export default Table;
