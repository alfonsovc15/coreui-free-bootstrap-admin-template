// Mock the @google-cloud/bigquery library
const mockBigQuery = jest.fn();
jest.mock('@google-cloud/bigquery', () => ({
  BigQuery: mockBigQuery,
}));

// Import the function to test
const { getBigQueryClient } = require('../utils/bigquery_client');

describe('BigQuery Client', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules(); // Most important - it clears the cache
    process.env = { ...OLD_ENV }; // Make a copy
    mockBigQuery.mockClear(); // Clear any previous calls to the mock
  });

  afterAll(() => {
    process.env = OLD_ENV; // Restore old environment
  });

  test('should initialize BigQuery with correct project ID and credentials path', () => {
    // Set up environment variables for the test
    process.env.GCP_PROJECT_ID = 'test-project-id';
    process.env.GOOGLE_APPLICATION_CREDENTIALS = '/path/to/fake/credentials.json';

    // Call the function
    getBigQueryClient();

    // Check if BigQuery was called with the correct options
    expect(mockBigQuery).toHaveBeenCalledTimes(1);
    expect(mockBigQuery).toHaveBeenCalledWith({
      projectId: 'test-project-id',
      keyFilename: '/path/to/fake/credentials.json',
    });
  });

  test('should throw error if GCP_PROJECT_ID is not set', () => {
    delete process.env.GCP_PROJECT_ID;
    process.env.GOOGLE_APPLICATION_CREDENTIALS = '/path/to/fake/credentials.json';

    expect(() => {
      getBigQueryClient();
    }).toThrow('GCP_PROJECT_ID environment variable is not set.');
    expect(mockBigQuery).not.toHaveBeenCalled();
  });

  test('should throw error if GOOGLE_APPLICATION_CREDENTIALS is not set', () => {
    process.env.GCP_PROJECT_ID = 'test-project-id';
    delete process.env.GOOGLE_APPLICATION_CREDENTIALS;

    expect(() => {
      getBigQueryClient();
    }).toThrow('GOOGLE_APPLICATION_CREDENTIALS environment variable is not set.');
    expect(mockBigQuery).not.toHaveBeenCalled();
  });
});
