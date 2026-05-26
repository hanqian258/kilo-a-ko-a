import admin from 'firebase-admin';

const REVIEWER_ROLES = new Set(['ADMIN', 'SCIENTIST']);

export const json = (statusCode, body) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(body),
});

export const getAdminApp = () => {
  if (admin.apps.length) return admin.app();

  const rawServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!rawServiceAccount) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is not configured.');
  }

  const serviceAccount = JSON.parse(rawServiceAccount);
  if (serviceAccount.private_key) {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
  }

  return admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_ADMIN_STORAGE_BUCKET,
  });
};

export const getAdminServices = () => {
  const app = getAdminApp();
  return {
    app,
    auth: admin.auth(app),
    db: admin.firestore(app),
    bucket: admin.storage(app).bucket(process.env.FIREBASE_ADMIN_STORAGE_BUCKET),
  };
};

export const requireUser = async (event) => {
  const authHeader = event.headers.authorization || event.headers.Authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : '';
  if (!token) {
    const error = new Error('Missing authorization token.');
    error.statusCode = 401;
    throw error;
  }

  const { auth, db } = getAdminServices();
  const decoded = await auth.verifyIdToken(token);
  const userSnap = await db.collection('users').doc(decoded.uid).get();
  const userData = userSnap.exists ? userSnap.data() : {};

  return {
    uid: decoded.uid,
    email: decoded.email || userData?.email || '',
    role: userData?.role || 'DONOR',
    name: userData?.name || decoded.name || decoded.email || 'User',
  };
};

export const requireReviewer = async (event) => {
  const user = await requireUser(event);
  if (!REVIEWER_ROLES.has(user.role)) {
    const error = new Error('Admin or scientist access is required.');
    error.statusCode = 403;
    throw error;
  }
  return user;
};

export const handleFunctionError = (error) => {
  console.error(error);
  return json(error.statusCode || 500, {
    error: error.message || 'Unexpected server error.',
  });
};
