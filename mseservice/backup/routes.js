const express = require("express");
const mse = require("./mse");

const router = express.Router();

router.get("/playlists", async (req, res) => {
    try {
        const response = await mse.getPlaylists();

        res
            .status(response.statusCode)
            .type("application/atom+xml")
            .send(response.body);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.get("/elements", async (req, res) => {
    try {
        const response = await mse.getElements(req.query.path);

        res
            .status(response.statusCode)
            .type("application/atom+xml")
            .send(response.body);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.get("/element", async (req, res) => {
    try {
        const response = await mse.getElement(req.query.url);

        res
            .status(response.statusCode)
            .type("application/vnd.vizrt.payload+xml")
            .send(response.body);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.put("/activate/:uuid", async (req, res) => {
    try {
        const response = await mse.activatePlaylist(req.params.uuid);

        res
            .status(response.statusCode)
            .type("text/plain")
            .send(response.body);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.post("/take", async (req, res) => {
    try {
        const response = await mse.takeElement(req.body);

        res
            .status(response.statusCode)
            .type("text/plain")
            .send(response.body);

    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.post("/out", async (req, res) => {
    try {
        const response = await mse.takeOutElement(req.body);

        res
            .status(response.statusCode)
            .type("text/plain")
            .send(response.body);

    } catch (err) {
        res.status(500).send(err.message);
    }
});

module.exports = router;