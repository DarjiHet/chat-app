const express = require('express');
const statusController = require('../controllers/statusController');
const authMiddleware = require('../middleware/authMiddlerware');
const { multerMiddleware } = require('../conifg/cloudinaryConfig');

const router = express.Router();

//protected route

router.post('/', authMiddleware, multerMiddleware, statusController.createStatus)
router.get('/', authMiddleware, statusController.getStatus)


router.put('/:statusId/view', authMiddleware, statusController.viewStatus)


router.delete('/:statusId', authMiddleware, statusController.deleteStatus)

module.exports = router;