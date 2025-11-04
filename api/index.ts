// Single API entry point for the React Native app
// - Exposes configured axios client
// - Exposes endpoints registry
// - Exposes userDetails helper

import api, { userDetails } from './http';
import endpoints from './endpoint';

export { endpoints, userDetails };
export default api;


