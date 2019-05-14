var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import React from 'react';
import { Button } from 'reactstrap';

var LoginForm = function (_React$Component) {
    _inherits(LoginForm, _React$Component);

    function LoginForm() {
        _classCallCheck(this, LoginForm);

        return _possibleConstructorReturn(this, (LoginForm.__proto__ || Object.getPrototypeOf(LoginForm)).apply(this, arguments));
    }

    _createClass(LoginForm, [{
        key: 'render',
        value: function render() {
            return React.createElement(
                'form',
                { method: 'POST', action: '/login' },
                React.createElement(
                    'div',
                    { className: 'user' },
                    React.createElement(
                        'label',
                        { 'for': 'user' },
                        'Username'
                    ),
                    React.createElement('input', {
                        className: 'form-control',
                        type: 'text',
                        name: 'user' })
                ),
                React.createElement(
                    'div',
                    { className: 'pass' },
                    React.createElement(
                        'label',
                        { 'for': 'pass' },
                        'Password'
                    ),
                    React.createElement('input', {
                        className: 'form-control',
                        type: 'password',
                        name: 'pass' })
                ),
                React.createElement(
                    'div',
                    { className: 'submit' },
                    React.createElement(
                        Button,
                        null,
                        'Login'
                    ),
                    React.createElement('input', {
                        className: 'btn btn-primary',
                        type: 'submit',
                        value: 'Login' })
                )
            );
        }
    }]);

    return LoginForm;
}(React.Component);

var Login = function (_React$Component2) {
    _inherits(Login, _React$Component2);

    function Login() {
        _classCallCheck(this, Login);

        return _possibleConstructorReturn(this, (Login.__proto__ || Object.getPrototypeOf(Login)).apply(this, arguments));
    }

    _createClass(Login, [{
        key: 'render',
        value: function render() {
            return React.createElement(
                'div',
                { className: 'login-component' },
                React.createElement(
                    'h1',
                    null,
                    'Login'
                ),
                React.createElement(
                    'div',
                    { className: 'login-form' },
                    React.createElement(LoginForm, null)
                )
            );
        }
    }]);

    return Login;
}(React.Component);

ReactDOM.render(React.createElement(Login, null), document.getElementById('login'));