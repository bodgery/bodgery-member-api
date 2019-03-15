module.exports = {
    versions: function( req, res ) {
        res
            .status(200)
            .json([ '/v1' ]);
    }
};
