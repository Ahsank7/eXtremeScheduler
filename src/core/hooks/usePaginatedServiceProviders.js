import { useState, useCallback, useEffect } from 'react';
import { profileService } from 'core/services';

export const usePaginatedServiceProviders = (franchiseId, startDateTime, endDateTime, searchText = '', timeZone = 'Pakistan Standard Time') => {
  const [serviceProviders, setServiceProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const pageSize = 10;

  const loadServiceProviders = useCallback(async (page = 1, append = false) => {
    // Only load if we have both start and end date/time
    if (!franchiseId || !startDateTime || !endDateTime) {
      setServiceProviders([]);
      setHasMore(false);
      setTotalRecords(0);
      setIsInitialized(false);
      return;
    }

    setLoading(true);
    try {
      const request = {
        FranchiseId: franchiseId,
        StartDateTime: startDateTime.toISOString(),
        EndDateTime: endDateTime.toISOString(),
        SearchText: searchText,
        PageNumber: page,
        PageSize: pageSize,
        TimeZone: timeZone
      };

      const response = await profileService.getAvailableServiceProviders(request);
      
      if (response && response.response) {
        const newProviders = response.response.map(provider => ({
          value: provider.UserId,
          label: provider.Name
        }));

        if (append) {
          setServiceProviders(prev => [...prev, ...newProviders]);
        } else {
          setServiceProviders(newProviders);
        }

        setHasMore(response.totalRecords > (page * pageSize));
        setTotalRecords(response.totalRecords);
        setCurrentPage(page);
        setIsInitialized(true);
      }
    } catch (error) {
      console.error('Error loading service providers:', error);
    } finally {
      setLoading(false);
    }
  }, [franchiseId, startDateTime, endDateTime, searchText, timeZone, pageSize]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore && startDateTime && endDateTime) {
      loadServiceProviders(currentPage + 1, true);
    }
  }, [loading, hasMore, currentPage, loadServiceProviders, startDateTime, endDateTime]);

  const refresh = useCallback(() => {
    setServiceProviders([]);
    setCurrentPage(1);
    setHasMore(true);
    setIsInitialized(false);
    if (startDateTime && endDateTime) {
      loadServiceProviders(1, false);
    }
  }, [loadServiceProviders, startDateTime, endDateTime]);

  useEffect(() => {
    refresh();
  }, [franchiseId, startDateTime, endDateTime, searchText, timeZone]);

  return {
    serviceProviders,
    loading,
    hasMore,
    loadMore,
    refresh,
    totalRecords,
    isInitialized
  };
};

export default usePaginatedServiceProviders;