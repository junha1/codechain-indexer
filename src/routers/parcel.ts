import { Router } from "express";
import { IndexerContext } from "../context";
import * as Exception from "../exception";

/**
 * @swagger
 * tags:
 *   name: Parcel
 *   description: Parcel management
 * definitions:
 *   Parcel:
 *     type: object
 *     required:
 *       - content
 *     properties:
 *       _id:
 *         type: string
 *         description: ObjectID
 *       content:
 *         type: string
 *         description: parcel example
 */
export function handle(_C: IndexerContext, router: Router) {
    /**
     * @swagger
     * /parcel:
     *   get:
     *     summary: Returns parcels (Not implemented)
     *     tags: [Parcel]
     *     parameters:
     *       - name: address
     *         description: sender receiver filter by address
     *         in: formData
     *         required: false
     *         type: string
     *       - name: page
     *         description: page for the pagination
     *         in: formData
     *         required: false
     *         type: number
     *       - name: itemsPerPage
     *         description: items per page for the pagination
     *         in: formData
     *         required: false
     *         type: number
     *       - name: onlyConfirmed
     *         description: returns only confirmed component
     *         in: formData
     *         required: false
     *         type: boolean
     *       - name: confirmThreshold
     *         description: confirm threshold
     *         in: formData
     *         required: false
     *         type: number
     *     responses:
     *       200:
     *         description: latest parcels
     *         schema:
     *           type: array
     *           items:
     *             $ref: '#/definitions/Parcel'
     */
    router.get("/parcel", async (_A, _B, next) => {
        try {
            throw Exception.NotImplmeneted;
        } catch (e) {
            next(e);
        }
    });

    /**
     * @swagger
     * /parcel/count:
     *   get:
     *     summary: Returns count of parcels (Not implemented)
     *     tags: [Parcel]
     *     parameters:
     *       - name: address
     *         description: sender receiver filter by address
     *         in: formData
     *         required: false
     *         type: string
     *       - name: onlyConfirmed
     *         description: returns only confirmed component
     *         in: formData
     *         required: false
     *         type: boolean
     *       - name: confirmThreshold
     *         description: confirm threshold
     *         in: formData
     *         required: false
     *         type: number
     *     responses:
     *       200:
     *         description: count of parcels
     *         schema:
     *           type: number
     *           example: 12
     */
    router.get("/parcel/count", async (_A, _B, next) => {
        try {
            throw Exception.NotImplmeneted;
        } catch (e) {
            next(e);
        }
    });

    /**
     * @swagger
     * /parcels:
     *   get:
     *     summary: Returns a specific parcel (Not implemented)
     *     tags: [Parcel]
     *     responses:
     *       200:
     *         description: pecific parcel
     *         schema:
     *           type: object
     *           $ref: '#/definitions/Parcel'
     */
    router.get("/parcel/:hash", async (_A, _B, next) => {
        try {
            throw Exception.NotImplmeneted;
        } catch (e) {
            next(e);
        }
    });

    /**
     * @swagger
     * /pending-parcel:
     *   get:
     *     summary: Returns current pending parcels (Not implemented)
     *     tags: [Parcel]
     *     parameters:
     *       - name: address
     *         description: sender receiver filter by address
     *         in: formData
     *         required: false
     *         type: string
     *     responses:
     *       200:
     *         description: current pending parcels
     *         schema:
     *           type: array
     *           items:
     *             $ref: '#/definitions/Parcel'
     */
    router.get("/pending-parcel", async (_A, _B, next) => {
        try {
            throw Exception.NotImplmeneted;
        } catch (e) {
            next(e);
        }
    });

    /**
     * @swagger
     * /pending-parcel/count:
     *   get:
     *     summary: Returns total count of the pending parcels (Not implemented)
     *     tags: [Parcel]
     *     responses:
     *       200:
     *         description: total count of the pending parcels
     *         schema:
     *           type: number
     *           example: 12
     */
    router.get("/pending-parcel/count", async (_A, _B, next) => {
        try {
            throw Exception.NotImplmeneted;
        } catch (e) {
            next(e);
        }
    });

    /**
     * @swagger
     * /pending-parcel/:hash:
     *   get:
     *     summary: Returns the specific pending parcel (Not implemented)
     *     tags: [Parcel]
     *     responses:
     *       200:
     *         description: specific pending parcel
     *         schema:
     *           type: object
     *           $ref: '#/definitions/Parcel'
     */
    router.get("/pending-parcel/:hash", async (_A, _B, next) => {
        try {
            throw Exception.NotImplmeneted;
        } catch (e) {
            next(e);
        }
    });
}