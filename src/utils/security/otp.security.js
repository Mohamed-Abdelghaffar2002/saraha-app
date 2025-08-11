export const generateOtp = ({expireTime=15} = {}) => {
    return{otp: Math.floor(100000 + Math.random() * 900000),
        otpExpireDate: new Date(Date.now() + expireTime * 60 * 1000),
    };
}