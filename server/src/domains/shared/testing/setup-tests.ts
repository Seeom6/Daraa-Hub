/**
 * Global Test Setup
 * This file is loaded before all tests via Jest setupFilesAfterEnv
 */

// Set test timeout
jest.setTimeout(30000);

// Global beforeAll
beforeAll(() => {
  // Suppress console logs during tests (optional)
  // jest.spyOn(console, 'log').mockImplementation(() => {});
  // jest.spyOn(console, 'warn').mockImplementation(() => {});
});

// Global afterAll
afterAll(() => {
  // Cleanup global mocks
  jest.clearAllMocks();
});

// Global afterEach - runs after each test
afterEach(() => {
  // Clear all mocks to ensure test isolation
  jest.clearAllMocks();
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});
