import React, { useState } from 'react';
import { MultiSelect, Button, Group, Text, Loader } from '@mantine/core';

const PaginatedMultiSelect = ({
  label,
  placeholder,
  data,
  loading,
  hasMore,
  onLoadMore,
  value,
  onChange,
  required = false,
  isInitialized = false,
  ...props
}) => {
  const [searchValue, setSearchValue] = useState('');

  const filteredData = data.filter(item =>
    item.label.toLowerCase().includes(searchValue.toLowerCase())
  );

  const handleLoadMore = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onLoadMore) {
      onLoadMore();
    }
  };

  const getPlaceholder = () => {
    if (!isInitialized) {
      return "Please select start and end date/time first";
    }
    return placeholder;
  };

  return (
    <div>
      <MultiSelect
        label={label}
        placeholder={getPlaceholder()}
        data={filteredData}
        value={value}
        onChange={onChange}
        required={required}
        searchable={isInitialized}
        onSearchChange={setSearchValue}
        searchValue={searchValue}
        maxDropdownHeight={300}
        dropdownComponent="div"
        disabled={!isInitialized}
        {...props}
        rightSection={
          <Group spacing="xs">
            {loading && <Loader size="xs" />}
            {hasMore && !loading && isInitialized && (
              <Button
                size="xs"
                variant="subtle"
                onClick={handleLoadMore}
                style={{ fontSize: '12px', padding: '2px 6px' }}
              >
                Load More
              </Button>
            )}
          </Group>
        }
        styles={{
          rightSection: {
            pointerEvents: 'auto',
          }
        }}
      />
      {isInitialized && hasMore && (
        <Text size="xs" color="dimmed" mt={4}>
          Showing {data.length} of {data.length > 0 ? 'many' : '0'} service providers
        </Text>
      )}
      {!isInitialized && (
        <Text size="xs" color="orange" mt={4}>
          Select start and end date/time to load available service providers
        </Text>
      )}
    </div>
  );
};

export default PaginatedMultiSelect;