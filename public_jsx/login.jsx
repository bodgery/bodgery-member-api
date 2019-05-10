class LoginForm extends React.Component
{
    render()
    {
        return (
            <form method="POST" action="/login">
                <div className="user">
                    <label for="user">Username</label>
                    <input
                        className="form-control"
                        type="text"
                        name="user" />
                </div>
                <div className="pass">
                    <label for="pass">Password</label>
                    <input
                        className="form-control"
                        type="password"
                        name="pass" />
                </div>
                <div className="submit">
                    <input
                        className="btn btn-primary"
                        type="submit"
                        value="Login" />
                </div>
            </form>
        );
    }
}

class Login extends React.Component
{
    render()
    {
        return (
            <div className="login-component">
                <h1>Login</h1>
                <div className="login-form">
                    <LoginForm />
                </div>
            </div>
        );
    }
}


ReactDOM.render(
    <Login />,
    document.getElementById( 'login' )
);
