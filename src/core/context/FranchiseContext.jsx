import React, { createContext, useContext, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { franchiseService, localStoreService } from 'core/services';

const FranchiseContext = createContext();

export const useFranchise = () => {
  const context = useContext(FranchiseContext);
  if (!context) {
    throw new Error('useFranchise must be used within a FranchiseProvider');
  }
  return context;
};

export const FranchiseProvider = ({ children }) => {
  const { franchiseName } = useParams();
  const [currentFranchiseId, setCurrentFranchiseId] = useState(null);
  const [currentFranchise, setCurrentFranchise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadFranchiseId = async () => {
      if (!franchiseName) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const userId = localStoreService.getUserID();
        const organizationId = localStoreService.getOrganizationID();

        // Fetch all franchises for the user
        const franchises = await franchiseService.getFranchiseList(organizationId, userId);

        if (franchises && Array.isArray(franchises)) {
          // Find the franchise that matches the URL franchise name
          // Remove spaces from franchise names for comparison
          const normalizedFranchiseName = franchiseName.toLowerCase().replace(/\s+/g, '');
          
          const franchise = franchises.find(f => {
            const normalized = f.name.toLowerCase().replace(/\s+/g, '');
            return normalized === normalizedFranchiseName;
          });

          if (franchise) {
            setCurrentFranchiseId(franchise.id);
            setCurrentFranchise(franchise);
            console.log('Current franchise set:', franchise.name, franchise.id);
          } else {
            console.error('Franchise not found:', franchiseName);
            setError('Franchise not found');
          }
        }
      } catch (err) {
        console.error('Error loading franchise ID:', err);
        setError(err.message || 'Failed to load franchise');
      } finally {
        setLoading(false);
      }
    };

    loadFranchiseId();
  }, [franchiseName]);

  const value = {
    franchiseId: currentFranchiseId,
    franchise: currentFranchise,
    franchiseName,
    loading,
    error
  };

  return (
    <FranchiseContext.Provider value={value}>
      {children}
    </FranchiseContext.Provider>
  );
};

