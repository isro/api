module.exports = async (req, res) => {
    try {
        res.send("<pre> ISRO API v0.1.0 </pre>");
    } catch (error) {
        res.status(500);
        const response = error.response || {};
        res.send({
            message: error.message,
            response,
        });
    }
};
