import crypto from 'crypto';
import bCrypt from 'bcrypt-nodejs';
import bcrypt from 'bcrypt';

export default {
    generateRandomToken() {
        return new Promise((resolve, reject) => {
            // generate reset token
            crypto.randomBytes(20, (err, buf) => {
                if (err) {
                    return reject(err);
                }
                const token = buf.toString('hex');
                resolve(token);
            });
        });
    },
    // createPasswordHash(password) {
    //     return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
    // }
    createPasswordHash(password) {
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);
        // return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
        return hash;
    },
};