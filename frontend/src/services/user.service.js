import axiosInstance from "./url.service"


export const sendOtp = async(email) => {
    try {
        const response = await axiosInstance.post('/auth/send-otp', {email});
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error.message;
    }
}


export const verifyOtp = async(otp, email) => {
    try {
        const response = await axiosInstance.post('/auth/verify-otp', {otp, email});
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error.message;
    }
}


export const updateUserProfile = async(updateData) => {
    try {
        const response = await axiosInstance.put('/auth/update-profile', updateData);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error.message;
    }
}

export const checkUserAuth = async(updateData) => {
    try {
        const response = await axiosInstance.get('/auth/check-auth');
        if (response.data.status === 'success') {
            return {isAuthenticated: true, user:response?.data?.data}
        }else if(response.data.status === "error"){
            return {isAuthenticated: false}
        }
    } catch (error) {
        throw error.response ? error.response.data : error.message;
    }
}


export const logOutUser = async(updateData) => {
    try {
        const response = await axiosInstance.get('/auth/logout');
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error.message;
    }
}

export const getAllUsers = async(updateData) => {
    try {
        const response = await axiosInstance.get('/auth/users');
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error.message;
    }
}