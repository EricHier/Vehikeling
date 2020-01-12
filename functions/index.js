const functions = require('firebase-functions');
const firestore = require('@google-cloud/firestore');
const client = new firestore.v1.FirestoreAdminClient();

// Replace BUCKET_NAME
const bucket = 'gs://backup-firestore-vehikeling';

exports.scheduledFirestoreExport = functions.pubsub
  .schedule('0 2 */1 * *')
  .onRun((context) => {
    const databaseName =
      client.databasePath(process.env.GCP_PROJECT, '(default)');

    return client.exportDocuments({
      name: databaseName,
      outputUriPrefix: bucket,
      // Leave collectionIds empty to export all collections
      // or set to a list of collection IDs to export,
      // collectionIds: ['users', 'posts']
      collectionIds: []
    })
      .then(responses => {
        const response = responses[0];
        console.log(`Operation Name: ${response['name']}`);
        return response;
      })
      .catch(err => {
        console.error(err);
        throw new Error('Export operation failed');
      });
  });
