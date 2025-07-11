const { uploadFileToCloudinary } = require("../conifg/cloudinaryConfig");
const Status = require("../models/Status");
const response = require("../utils/responseHandler");
const Message = require('../models/Message')

exports.createStatus = async (req, res) => {
    try {
        const { content, contentType } = req.body;
        const userId = req.user.userId;
        const file = req.file;

        let mediaUrl = null;
        let finalContentType = contentType || 'text';
        //handle file upload
        if (file) {
            const uploadFile = await uploadFileToCloudinary(file);

            if (!uploadFile?.secure_url) {
                return response(res, 400, 'Failed to upload media')
            };
            mediaUrl = uploadFile?.secure_url;

            if (file.mimetype.startwith('image')) {
                finalContentType = 'image'
            } else if (file.mimetype.startwith('video')) {
                finalContentType = 'video'
            } else {
                return response(res, 400, 'Unsupported file type')
            }
        } else if (content?.trim()) {
            finalContentType = 'text';
        } else {
            return response(res, 400, "Message Content is required")
        }

        const expiryAt = new Date();
        expiryAt.setHours(expiryAt.getHours() + 24)

        const status = new Status({
            user: userId,
            content: mediaUrl || content,
            contentType: finalContentType,
            imageOrVideoUrl,
            messageStatus
        });

        await status.save();


        const populateStatus = await Status.findOne(status?._id)
            .populate("user", "username profilePicture")
            .populate("viewers", "username profilePicture")


        return response(res, 201, "status created successfully", populateStatus);
    } catch (error) {
        console.error(error);
        return response(res, 500, 'Internal server error')
    }
};


exports.getStatus = async (req, res) => {
    try {
        const statuses = await Status.find({
            expiryAt: { $gt: new Date() }
        })
        .populate("user", "username profilePicture")
        .populate("viewers", "username profilePicture")
        .sort({ createdAt: -1 })

        return response(res, 200, 'status retrieved successfully', statuses)
    } catch (error) {
        console.error(error);
        return response(res, 500, 'Internal server error')
    }
}


exports.viewStatus = async(req, res) => {
    const {statusId} = req.params;
    const userId = req.user.userId;
    try {
        const status = await Status.findById(statusId);
        if(!status){
            return response(res, 404, 'Status not found')
        }
        if(!status.viewers.includes(userId)){
            status.viewers.push(userId);
            await status.save();

            const updatedStatus = await Status.findById(statusId)
                .populate("user", "username profilePicture")
                .populate("viewers", "username profilePicture")
        }else{
            console.log('user already viewd the status')
        }

        return response(res, 200, 'status viewed successfully')
    } catch (error) {
        console.error(error);
        return response(res, 500, 'Internal server error')
    }
}


exports.deleteStatus = async(req, res) => {
    const { statusId } = req.params;
    const userId = req.user.userId;
    try {
        const status = await Status.findById(statusId);
        if (!status){
            return response(res, 404, 'status not found');
        }
        if(status.user.toString() !== userId){
            return response(res, 404, 'Not authorized to delete this status')
        }

        await status.deleteOne();

        return response(res, 200, "Status deleted successfully")
    } catch (error) {
        console.error(error);
        return response(res, 500, 'Internal server error')
    }
}