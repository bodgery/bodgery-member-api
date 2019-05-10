'use strict';
const e = React.createElement;


class Login extends React.Component
{
    render()
    {
        return (
            <h1>Hello, jsx</h1>
        );
    }
}


const dom = document.querySelector( '#login' );
ReactDOM.render( e(Login), dom );
