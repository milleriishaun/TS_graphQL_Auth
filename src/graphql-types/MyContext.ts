import { Request, Response } from "express";

// Get the request and response from express, and put in in context object
// req and res are used in index.ts upon initializing the Apollo resolver
export interface MyContext {
  req: Request;
  res: Response;
}
