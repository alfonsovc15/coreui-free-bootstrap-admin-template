// This file will contain the BigQuery client connection logic.
const { BigQuery } = require('@google-cloud/bigquery');

/**
 * Creates a BigQuery client instance.
 *
 * The function uses environment variables for configuration:
 * - GCP_PROJECT_ID: The Google Cloud Project ID.
 * - GOOGLE_APPLICATION_CREDENTIALS: The path to the service account key file.
 *
 * @returns {BigQuery} A BigQuery client instance.
 * @throws {Error} If required environment variables are not set.
 */
function getBigQueryClient() {
  const projectId = process.env.GCP_PROJECT_ID;
  const keyFilename = process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (!projectId) {
    throw new Error('GCP_PROJECT_ID environment variable is not set.');
  }

  if (!keyFilename) {
    throw new Error('GOOGLE_APPLICATION_CREDENTIALS environment variable is not set.');
  }

  return new BigQuery({
    projectId,
    keyFilename,
  });
}

module.exports = { getBigQueryClient };
