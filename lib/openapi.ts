import { createOpenAPI } from 'fumadocs-openapi/server';

// Reads the spec that `npm run predev` / `npm run prebuild` copies in from
// the backend's own generator (backend/services/api-gateway/openapi.json).
// Never hand-edited - see package.json's predev/prebuild scripts.
export const openapi = createOpenAPI({
  input: ['./public/openapi/openapi.json'],
});
