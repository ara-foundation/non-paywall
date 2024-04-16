To run:

```shell
npx tsx src/index.ts
```

# API

To validate:
```
http://localhost:3000/validate/medet/https%3A%2F%2Fwww.economist.com%2Fscience-and-technology%2F2024%2F04%2F02%2Fa-stealth-attack-came-close-to-compromising-the-worlds-computers
```

Use the `encodeURIComponent` on the validating page
```js
let url = `http://localhost:3000/`;
url += `${user}/`;
url += `${encodeURIComponent(webPage)}/`;
let res = await fetch(url);
```