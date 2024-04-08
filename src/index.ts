import * as url from "url";
import express, { Express, Request, Response } from "express";
import fs from "fs";
import cors from "cors";

type PaymentInfo = {
    endTime: number;
    value: number;
    duration?: 3600;
}

type PaymentInfos = {
    [key: string]: PaymentInfo
}

let paymentInfos: PaymentInfos = {};

if (fs.existsSync("./payments.json")) {
    console.log("File exists, let's read it");
    let opened = fs.openSync("./payments.json", "rs+");
    var file = fs.readFileSync(opened);
    console.log(file.toString());
    paymentInfos = JSON.parse(file.toString()) as PaymentInfos;
    fs.closeSync(opened);
} else {
    console.log("File don't exist, let's create it");
    paymentInfos = {"no_user": {
            endTime: 123,
            value: 5,
            duration: 3600
    }};

    fs.writeFileSync("./payments.json", JSON.stringify(paymentInfos));
}

console.log("Opened file", paymentInfos);

function getRandomInt(max: number) {
    return Math.floor(Math.random() * max);
}

// 5.
// define message passing between implementation and Maydan:
// account.identify() -> sign the account
// account.paymentRequired() -> ask user to pay
// ??? how to identify the bot: we pass the impl and issue every time. to the client.
// we also have an implementation that tests the implementation.

// 1
// in the constructor, we have a message system that sends an error to the client.
// if message "402" received, then SenSever appears next to the web page.
// he asks for the payment and then creates a transaction.
// the created transaction is added to the file.

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

app.get("/pay/:user", (req: Request, res: Response) => {
    const user = req.params.user;
    console.log("Hello, paying customer " + user);

    const now = Math.floor(new Date().getTime() / 1000);
    const paymentInfo: PaymentInfo = {
        endTime: now + 300, // pay every 5 minutes
        value: 5.6,
    }

    paymentInfos[user] = paymentInfo;

    fs.writeFileSync("./payments.json", JSON.stringify(paymentInfos));

    res.json(paymentInfo);
});

app.get("/validate/:user/:url", async (req: Request, res: Response) => {
    const user = req.params.user;
    console.log("Hello, " + user);

    const now = Math.floor(new Date().getTime() / 1000);

    if (!paymentInfos.hasOwnProperty(user) || paymentInfos[user].endTime <= now) {
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