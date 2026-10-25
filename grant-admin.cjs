const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

async function main() {
  const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!keyPath) throw new Error('Set GOOGLE_APPLICATION_CREDENTIALS to your service-account JSON path.');

  initializeApp({ credential: cert(require(keyPath)) });

  const auth = getAuth();
  const user = await auth.getUserByEmail('jakkaswetha2555@gmail.com');

  await auth.setCustomUserClaims(user.uid, {
    ...user.customClaims,
    admin: true
  });

  console.log('Admin claim granted. Sign out and back in to refresh it.');
}

main().catch(error => {
  console.error('Could not grant admin access:', error.message);
  process.exitCode = 1;
});