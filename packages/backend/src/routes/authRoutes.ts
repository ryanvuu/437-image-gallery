import { CredentialsProvider } from "CredentialsProvider";
import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";

export interface IAuthTokenPayload {
  username: string;
}

function generateAuthToken(username: string, jwtSecret: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const payload: IAuthTokenPayload = {
      username
    };
    jwt.sign(
      payload,
      jwtSecret,
      { expiresIn: "1d" },
      (error, token) => {
          if (error) reject(error);
          else resolve(token as string);
      }
    );
  });
}

export function registerAuthRoutes(app: express.Application, credsProvider: CredentialsProvider) {
  
  // Register
  app.post("/auth/register", async (req: Request, res: Response): Promise<any> => {
    const { username, password } = req.body;

    if (typeof username !== "string" || typeof password !== "string") {
      return res.status(400).send({
        error: "Bad request",
        message: "Missing username or password"
      });
    }

    if (username === "" || password === "") {
      return res.status(400).send({
        error: "Bad request",
        message: "Username or password not of valid length"
      });
    }

    credsProvider.registerUser(username, password)
      .then(result => {
        if (!result) {  
          return res.status(409).send({
            error: "Request conflict",
            message: "Username already taken"
          });
        }

        generateAuthToken(username, req.app.locals.JWT_SECRET)
          .then(token => {
            console.log(`Successfully generated authentication token: ${token}`);
            return res.status(201).send(token);
          })
          .catch(error => {
            console.error("Failed to generate authentication token:", error);
            return res.status(500).send();
          });
      })
      .catch(error => {
        console.error("Failed to register user:", error);
        return res.status(500).send({
          error: "Server error"
        });
      });
  });

  // Login
  app.post("/auth/login", async (req: Request, res: Response): Promise<any> => {
    const { username, password } = req.body;

    if (typeof username !== "string" || typeof password !== "string") {
      return res.status(400).send({
        error: "Bad request",
        message: "Missing username or password"
      });
    }

    credsProvider.verifyPassword(username, password)
      .then(result => {
        if (!result) {
          return res.status(401).send({
            error: "Unauthorized",
            message: "Bad username or password"
          });
        }

        generateAuthToken(username, req.app.locals.JWT_SECRET)
          .then(token => {
            console.log(`Successfully generated authentication token: ${token}`);
            return res.status(200).send(token);
          })
          .catch(error => {
            console.error("Failed to generate authentication token:", error);
            return res.status(500).send();
          })
      })
      .catch(error => {
        console.error("Failed to login:", error);
        return res.status(500).send();
      })
  });
}