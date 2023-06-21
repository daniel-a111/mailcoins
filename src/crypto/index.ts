
const crypto = require('crypto');

const encryption = 'sha256';
const secretKey = 'abcdefg';
const iv = crypto.randomBytes(16);

export const encrypted = (text: string) => {

    return text;
    const cipher = crypto.createCipheriv(encryption, secretKey, iv);

    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

    return {
        iv: iv.toString('hex'),
        content: encrypted.toString('hex')
    };
};

export const decrypted = (hash: any) => {

    return hash;
    const decipher = crypto.createDecipheriv(encryption, secretKey, Buffer.from(hash.iv, 'hex'));

    const decrpyted = Buffer.concat([decipher.update(Buffer.from(hash.content, 'hex')), decipher.final()]);

    return decrpyted.toString();
};

// export const encrypt = (text: string) => {

// }

// export const decrypt = (cyper: string) => {

// }