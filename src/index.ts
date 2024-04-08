import * as url from "url";
import express, { Express, Request, Response } from "express";
import cors from "cors";
import got from 'got';

const issueId: string = "66130f845b7028e14683c632";
const implementationId: number = 1;
const blockchainRpcUrl: string = "https://blockchain-sim-116ad6544f58.herokuapp.com";

let subscribed = async function(userId: string): Promise<boolean> {
    let url: string = `${blockchainRpcUrl}/eval_subscribed?issueId=${issueId}&implementationId=${implementationId}&userId=${userId}`;

    console.log('Got: ' + url);
    const data = await got(url).json();
    return data as boolean;
}


const nonPaywalls = [
    "ft.com",
    "chronicle.com",
    "reuters.com",
    "wsj.com",
    "wired.com",
    `nytimes.com`,
    "bloomberg.com",
    "forbes.com",
    "economist.com"
];


const isNonPaywall = (webUrl: string): boolean => {
    const parsed = url.parse(webUrl);
    if (parsed == null || parsed.host == null) {
        return false;
    }
    return nonPaywalls.findIndex((nonPaywall) => parsed.host?.endsWith(nonPaywall)) > -1;
}

const payPassUrl = (webUrl: string): string => {
    return "http://archive.md/timegate/" + webUrl;
}

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(cors());

app.get("/", (req: Request, res: Response) => {
    res.send("Express + TypeScript Server");
});

app.get("/validate/:userId/:url", async (req: Request, res: Response) => {
    const userId = req.params.userId;
    console.log("Hello, " + userId);

    let isSubscribed = await subscribed(userId);
    console.log('Are you subscribed to this implementation: ' + isSubscribed);

    if (!isSubscribed) {
        return res.status(402).json({
            nonPaywall: false,
            passUrl: ""
        })
    }

    const webUrl = req.params.url;
    let result = {
        "nonPaywall": isNonPaywall(req.params.url),
        "passUrl": payPassUrl(req.params.url)
    }
    res.json(result);
});

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});