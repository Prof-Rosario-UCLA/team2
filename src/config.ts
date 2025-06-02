const isProduction = true; 

export const API_BASE_URL = isProduction 
  ? 'http://restaurantapp-backend-service:1919'
  : 'http://localhost:1919'; 