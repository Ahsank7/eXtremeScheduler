/**
 * Calculate age from birth date
 * @param {string} birthDate - Birth date in YYYY-MM-DD format
 * @returns {number|null} - Calculated age or null if invalid
 */
export const calculateAge = (birthDate) => {
  if (!birthDate || birthDate === '') return null;
  
  try {
    const today = new Date();
    const birth = new Date(birthDate);
    
    // Check if the date is valid
    if (isNaN(birth.getTime())) return null;
    
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  } catch (error) {
    console.error('Error calculating age:', error);
    return null;
  }
};

/**
 * Format age with "Years" text
 * @param {number|null} age - Age number or null
 * @returns {string} - Formatted age string
 */
export const formatAge = (age) => {
  if (age === null || age === undefined) return 'Not specified';
  if (age === 1) return '1 Year';
  return `${age} Years`;
}; 