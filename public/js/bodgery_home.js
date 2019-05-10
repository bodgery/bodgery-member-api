'use strict';
const e = React.createElement;


class BodgeryHome extends React.Component
{
    render()
    {
        return e( 'h1', {}, 'Hello, react' );
    }
}


const dom = document.querySelector( '#bodgery_home' );
ReactDOM.render( e(BodgeryHome), dom );
