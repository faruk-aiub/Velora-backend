"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.firebaseAuth = void 0;
const app_1 = require("firebase-admin/app");
const auth_1 = require("firebase-admin/auth");
if (!(0, app_1.getApps)().length) {
    try {
        (0, app_1.initializeApp)({
            credential: (0, app_1.applicationDefault)(),
            projectId: 'velora-b50eb',
        });
    }
    catch (error) {
        console.warn('Firebase Admin credentials not found. Initializing with projectId only for verifyIdToken.');
        (0, app_1.initializeApp)({
            projectId: 'velora-b50eb',
        });
    }
}
exports.firebaseAuth = (0, auth_1.getAuth)();
//# sourceMappingURL=firebase.config.js.map