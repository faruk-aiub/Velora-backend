"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.firebaseAuth = void 0;
const app_1 = require("firebase-admin/app");
const auth_1 = require("firebase-admin/auth");
if (!(0, app_1.getApps)().length) {
    try {
        (0, app_1.initializeApp)({
            credential: (0, app_1.applicationDefault)(),
        });
    }
    catch (error) {
        console.warn('Firebase Admin initialization failed. Ensure GOOGLE_APPLICATION_CREDENTIALS is set.', error);
    }
}
exports.firebaseAuth = (0, auth_1.getAuth)();
//# sourceMappingURL=firebase.config.js.map