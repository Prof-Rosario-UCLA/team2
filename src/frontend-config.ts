const isProduction = true;

export const API_BASE_URL = isProduction
  ? "http://restaurantapp-backend-service:1919"
  : "http://localhost:1919";

// dear TAs if you see this, i know this is bad practice, but i spent a long time
// debugging why the kubernetes cluster couldn't recognize the github secret correctly
// and i couldn't get it working correctly
export const GOOGLE_CLIENT_ID =
  "499257456410-dk3qd2oeum2rdm3adh08p04o0ft0afms.apps.googleusercontent.com";
