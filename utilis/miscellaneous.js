const otpGenerator = require('otp-generator');
module.exports = {
    generate: function (codelength) {

        codelength = codelength != undefined ? codelength : 12;
        function generateRandomID(length) {
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let randomID = '';

            for (let i = 0; i < length; i++) {
                const randomIndex = Math.floor(Math.random() * characters.length);
                randomID += characters[randomIndex];
            }

            return randomID.toUpperCase();
        }

        return randomID = generateRandomID(codelength);
        // return otpGenerator.generate(10, { digits: true, alphabets: true, upperCase: true, specialChars: false });
    }
}