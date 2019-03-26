let db;

module.exports = {
    set_db: (new_db) => { db = new_db }

    ,get_versions: function( req, res ) {
        res
            .status(200)
            .json([ '/v1' ]);
    }

    ,post_members: function( req, res ) {
        // TODO validate params
        var body = res.body;

        // TODO add with an async callback
        db.add_member( body );

        res
            .status( 204 )
            .end();
    }

    ,get_members: function( req, res ) {
        // TODO validate params
        let body = req.body || {};
        let id = body['id'];
        let limit = body['limit'];
        let skip = body['skip'];

        let members = db.get_members();
        if( id ) {
            members = members.filter( function (member) {
                return member.id == id;
            });
        }
        if( skip ) {
            members = members.filter( function (member, index) {
                return index >= skip;
            });
        }
        if( limit ) {
            members = members.filter( function (member, index) {
                return index < limit;
            });
        }

        res
            .status( 200 )
            .send( members );
    }
};
