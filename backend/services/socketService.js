const { Server } = require('socket.io');
const User = require('../models/User')
const Message = require('../models/Message')

//Map to store online users => userId, socketId
const onlineUsers = new Map();

//Map to track typing status -> userId -> [conversation]: boolean
const typingUsers = new Map();


const initializeSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL,
            credentials: true, // for head and cookies
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        },
        pingTimeout: 60000, //Disconnect inactive user or socket after 60 seconds
    });


    //when a new socket connection is establish
    io.on("connection", (socket) => {
        console.log(`User connected: ${socket.id}`)
        let userId = null;

        //handle user connection and mark them online in db

        socket.on("user_connected", async (connectingUserId) => {
            try {
                userId = connectingUserId
                onlineUsers.set(userId, socket.id);
                socket.join(userId) //join a personal room for direct emits

                //update user status in db
                await User.findByIdAndUpdate(userId, {
                    isOnline: true,
                    lastSeen: new Date(),
                });

                //notify all users that this user is now online
                io.emit("user_status", { userId, isOnline: true });

            } catch (error) {
                console.error("Error handling user connection", error)
            }
        })


        //Retrun online status of requested user

        socket.on("get_user_status", (requstedUserId, callback) => {
            const isOnline = onlineUsers.has(requstedUserId)
            callback({
                userId: requstedUserId,
                isOnline,
                lastSeen: isOnline ? new Date() : null,
            })
        })

        //forword message to receiver if online

        socket.on("send_message", async (message) => {
            try {
                const receiverSocketId = onlineUsers.get(message.receiver?._id);
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit("receive_message", message)
                }
            } catch (error) {
                console.log("Error sending message", error)
                socket.emit("message_error", { error: "Failed to send message" })
            }
        })

        // update message as read and notify sender
        socket.on("message_read", async ({ messageIds, senderId }) => {
            try {
                await Message.updateMany(
                    { _id: { $in: messageIds } },
                    { $set: { messageStatus: "read" } }
                )

                const senderSocketId = onlineUsers.get(senderId);
                if (senderSocketId) {
                    messageIds.forEach((messageId) => {
                        io.to(senderSocketId).emit("message_status_update", {
                            messageId,
                            messageStatus: "read"
                        })
                    })
                }
            } catch (error) {
                console.error("Error updating message read status", error)
            }
        })

        //handle typing start event and auto-stop after 3s
        socket.on("typing_start", ({ conversationId, receiverId }) => {
            if (!userId || !conversationId || !receiverId) return;

            if (!typingUsers.has(userId)) typingUsers.set(userId, {});

            const userTyping = typingUsers.get(userId)

            userTyping[conversationId] = true;

            //clear any exiting timeout
            if (userTyping[`${conversationId}_timeout`]) {
                clearTimeout(userTyping[`${conversationId}_timeout`])
            }

            // auto-stop after 3s
            userTyping[`${conversationId}_timeout`] = setTimeout(() => {
                userTyping[conversationId] = false;
                socket.to(receiverId).emit("user_typing", {
                    userId,
                    conversationId,
                    isTyping: false
                })
            }, 3000)

            //Notify receiver
            socket.to(receiverId).emit("user_typing", {
                userId,
                conversationId,
                isTyping: true
            })
        })

        socket.on("typing_stop", ({ conversationId, receiverId }) => {
            if (!userId || !conversationId || !receiverId) return;

            if (!typingUsers.has(userId)) {
                const userTyping = typingUsers.get(userId);
                userTyping[conversationId] = false

                if (userTyping[`${conversationId}_timeout`]) {
                    clearTimeout(userTyping[`${conversationId}_timeout`])
                    delete userTyping[`${conversationId}_timeout`]
                }
            };


            socket.to(receiverId).emit("user_typing", {
                userId,
                conversationId,
                isTyping: false
            })
        })


        // Add or update reaction on message
        socket.on("add_reaction", async ({ messageId, emoji, userId, reactionUserId }) => {
            try {
                const message = await Message.findById(messageId);
                if (!message) return;

                const exitingIndex = message.reactions.findIndex(
                    (r) => r.user.toString() === reactionUserId
                )

                if (exitingIndex > -1) {
                    const exiting = message.reactions(exitingIndex)
                    if (exiting.emoji === emoji) {
                        // remove same reaction
                        message.reactions.slice(exitingIndex, 1)
                    } else {
                        message.reactions[exitingIndex].emoji = emoji;
                    }
                } else {
                    //add new reaction
                    message.reactions.push({ user: reactionUserId, emoji })
                }

                await message.save();

                const populateMessage = await Message.findOne(message?._id)
                    .populate("sender", "username profilePicture")
                    .populate("receiver", "username profilePicture")
                    .populate("reactions.user", "username")

                    const reactionUpdated = {
                        messageId,
                        reactions:populateMessage.reactions
                    }

                    const senderSocket = onlineUsers.get(populateMessage.sender._id.toString());
                    const receiverSocket = onlineUsers.get(populateMessage.receiver?._id.toString());

                    if(senderSocket) io.to(senderSocket).emit("reaction_update", reactionUpdated)

                    if(receiverSocket) io.to(receiverSocket).emit("reaction_update", reactionUpdated)
            } catch (error) {
                console.error("Error handling reaction", error)
            }
        });



    //handle disconnection and mark user offline

    const handleDisconnected = async () => {
        if(!userId) return;

        try {
            onlineUsers.delete(userId);

            // clear all typing timeout
            if(typingUsers.has(userId)){
                const userTyping = typingUsers.get(userId);
                Object.keys(userTyping).forEach((key) => {
                    if(key.endsWith('_timeout')) clearTimeout(userTyping[key])
                })

                typingUsers.delete(userId)
            }

            await User.findByIdAndUpdate(userId, {
                isOnline: false,
                lastSeen: new Date(),
            })

            io.emit("user_status",{
                userId, isOnline: false,
                lastSeen: new Date(),
            })

            socket.leave(userId),
            console.log(`user ${userId} disconnected`)
        } catch (error) {
            console.error("Error handling disconnection", error)
        }
    }

    // disconnect event
    socket.on("disconnect", handleDisconnected)
    });

    // attach the online user map to the coket server for external user
    io.socketUserMap = onlineUsers;

    return io;

};

module.exports = initializeSocket;