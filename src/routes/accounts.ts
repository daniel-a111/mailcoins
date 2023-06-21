import express from 'express';
import * as controllers from '../controllers';

export const router = express.Router();
router.get('/', controllers.accounts.list);
// router.get('/:id', controllers.actions.get);

// router.get('/view', controllers.actions.view);
// router.post('/submit', controllers.actions.submit);
// router.get('/slots/', controllers.rooms.listSlots);
// router.post('/', controllers.rooms.addRoom);
// router.post('/tag', controllers.rooms.tagRoom);


/**
 * @swagger
 * tags:
 *   name: Rooms
 *   description: The hotels indexing managing API
 */


/**
 * @swagger
 * components:
 *   schemas:
 *     Room:
 *       type: object
 *       required:
 *         - name
 *         - symbol
 *       properties:
 *         id:
 *           type: string
 *           description: The unique auto-gen identifier of a hotel
 *         name:
 *           type: string
 *           description: The name related to hotel
 *         symbol:
 *           type: string
 *           description: The unique chosen identifier of a hotel
 *         info:
 *           type: object
 *           description: Any additional info / data
 *       example:
 *         id: "223"
 *         name: Hotel The Vinci
 *         symbol: TVC
 *         info:
 *           Manager: contact@thevinci.it
 *           Support: support@thevinci.it
 *           
 * 
 */


/**
 * @swagger
 * components:
 *   schemas:
 *     New Room Form:
 *       type: object
 *       required:
 *         - hotelId
 *         - name
 *         - symbol
 *       properties:
 *         hotelId:
 *           type: string
 *           description: The id for hotel
 *         name:
 *           type: string
 *           description: The name related to hotel
 *         symbol:
 *           type: string
 *           description: The unique chosen identifier of a hotel
 *         info:
 *           type: object
 *           description: Any additional info / data
 *       example:
 *         name: Hotel The Vinci
 *         symbol: TVC
 *         info:
 *           Manager: contact@thevinci.it
 *           Support: support@thevinci.it
 *           
 * 
 */



/**
 * @swagger
 * components:
 *   schemas:
 *     Index Room Event:
 *       type: object
 *       properties:
 *         event:
 *           type: string
 *           description: The event title
 *         hotel:
 *           - id: string
 *             description: ...
 *         id:
 *           type: string
 *           description: The name related to hotel
 *         name:
 *           type: string
 *           description: The name of the hotel
 *         symbol:
 *           type: string
 *           description: The unique chosen identifier of a hotel
 *         info:
 *           type: object
 *           description: Any additional info / data
 *       example:
 *         - event: Add Room
 *           hotel:
 *             id: "223"
 *           room:
 *             symbol: "111"
 *             info:
 *               images: [  ]
 *               airCondition: true
 *         - event: Remove Room 
 *           hotel:
 *             id: "223"
 *           room:
 *             symbol: "111"
 * 
 */


/**
 * @swagger
 * components:
 *   schemas:
 *     Tag Room Event:
 *       type: object
 *       properties:
 *         event:
 *           type: string
 *           description: The event title
 *         hotel:
 *           - id: string
 *             description: ...
 *         id:
 *           type: string
 *           description: The name related to hotel
 *         name:
 *           type: string
 *           description: The name of the hotel
 *         symbol:
 *           type: string
 *           description: The unique chosen identifier of a hotel
 *         info:
 *           type: object
 *           description: Any additional info / data
 *       example:
 *         - event: Tag Room
 *           id: "223"
 *           tags: ["#tag1", "#tag2"]
 *         - event: Untag Room 
 *           id: "223"
 *           tags: ["#tag2"]
 * 
 */


/**
 * @swagger
 * /api/rooms:
 *   get:
 *     summary: The list of all hotels
 *     tags: [Rooms]
 *     responses:
 *       200:
 *         description: Login (user)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Hotel'
 * 
 */



/**
 * @swagger
 * /api/rooms:
 *   get:
 *     summary: The list of affecting events
 *     tags: [Rooms]
 *     responses:
 *       200:
 *         description: Login (user)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Index Hotel Event'
 * 
 */

/**
 * @swagger
 * /api/hotels/{id}/rooms:
 *   post:
 *     summary: Create new hotel
 *     tags: [Rooms,Hotels]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/New Room Form'
 *     responses:
 *       200:
 *         description: Login (user)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Hotel'
 * 
 */


/**
 * @swagger
 * /api/hotels/{id}/rooms/{symbol}/unlist:
 *   put:
 *     summary: Unlist an exists hotel
 *     tags: [Hotels, Rooms]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The hotel symbol
 *     responses:
 *       200:
 *         description: Login (user)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Hotel'
 * 
 */

/**
 * @swagger
 * /api/hotels/{id}/rooms/{id}/list:
 *   put:
 *     summary: List an exists hotel
 *     tags: [Rooms]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The hotel id
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/New Room Form'
 *     responses:
 *       200:
 *         description: Login (user)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Hotel'
 * 
 */



/**
 * @swagger
 * /api/rooms/{id}:
 *   delete:
 *     summary: Delete hotel
 *     tags: [Rooms]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The hotel id
 *     responses:
 *       200:
 *         description: Login (user)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Hotel'
 * 
 */




/**
 * @swagger
 * /api/rooms/{id}/products:
 *   get:
 *     summary: Delete hotel
 *     tags: [Rooms]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The hotel id
 *     responses:
 *       200:
 *         description: Login (user)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Hotel'
 * 
 */


/**
 * @swagger
 * /api/rooms/{id}/products:
 *   post:
 *     summary: Delete hotel
 *     tags: [Rooms]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The hotel id
 *     responses:
 *       200:
 *         description: Login (user)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Hotel'
 * 
 */




/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete hotel
 *     tags: [Rooms]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The hotel id
 *     responses:
 *       200:
 *         description: Login (user)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Hotel'
 * 
 */

