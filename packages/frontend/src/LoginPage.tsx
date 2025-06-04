import React, { useActionState } from "react";
import "./LoginPage.css";
import { Link, useNavigate } from "react-router";

interface ILoginPage {
    isRegistering: boolean;
    setAuthToken: (token: string) => void;
}

async function submitRegistration(url: string, username: string, password: string): Promise<{type: string, message: string, token?: string}> {
    try {
        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({username: username, password: password})
        });

        if (res.ok) {
            const token = await res.text();
            return {
                type: "success",
                message: `You have successfully ${url.includes("register") ? "registered" : "logged in"}!`,
                token: token
            };
        }
        else {
            return {
                type: "error",
                message: `${url.includes("register") ? "Registration" : "Login"} failed. Incorrect username or password.`
            };
        }
    }
    catch {
        return {
            type: "error",
            message: `${url.includes("register") ? "Registration" : "Login"} failed. Network error.`
        };
    }
}

export function LoginPage(props: ILoginPage) {
    const usernameInputId = React.useId();
    const passwordInputId = React.useId();
    const navigate = useNavigate();
    
    const [result, submitAction, isPending] = useActionState(
        async (_previousState: unknown, formData: FormData) => {
            const username = formData.get("username") as string;
            const password = formData.get("password") as string;

            if (!username || !password) {
                return {
                    type: "error",
                    message: "Please fill in your username and password.",
                };
            }

            if (props.isRegistering) {
                const result = await submitRegistration("/auth/register", username, password);
                if (result.type === "success") {
                    console.log("Successfully registered!");
                    console.log(`Auth token: ${result.token}`);
                    if (result.token) {
                        props.setAuthToken(result.token);
                        navigate('/');
                    }
                }
                return result;
            }
            else {
                const result = await submitRegistration("/auth/login", username, password);
                if (result.type === "success") {
                    console.log(`Auth token: ${result.token}`);
                    if (result.token) {
                        props.setAuthToken(result.token);
                        navigate('/');
                    }
                }
                return result;
            }
        },
        null
    );

    return (
        <>
            {props.isRegistering ? <h2>Register a new account</h2> : <h2>Login</h2>}
            <form className="LoginPage-form" action={submitAction}>
                <label htmlFor={usernameInputId}>Username</label>
                <input id={usernameInputId} required name="username" disabled={isPending} />

                <label htmlFor={passwordInputId}>Password</label>
                <input id={passwordInputId} type="password" name="password" required disabled={isPending} />

                <input type="submit" value="Submit" disabled={isPending} />
                {result?.type === "error" && <p className="submit-error" aria-live="polite">{result.message}</p>}
            </form>
            {!props.isRegistering && <p>Don't have an account? <Link to="/register">Register here</Link></p>}
        </>
    );
}
