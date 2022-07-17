import * as https from "http";
import * as fs from "fs";
import * as path from "path";

const hostname = "127.0.0.1";
const port = 3000;

let imgPath = "";
let outLabelPath = "";
const config = JSON.parse(fs.readFileSync("../config.json", "utf8"));
console.log(config);
const inPath = config.in_path;
const outPath = config.out_path;
console.assert(fs.existsSync(inPath), "in_path does not exist.");
const fileNames = fs.readdirSync(inPath);
if (config.lastEdited === "" || config.lastEdited === undefined) {
  config.lastEdited = fileNames[0];
}
console.log(`Found ${fileNames.length} in input directory.`);
if (!fs.existsSync(outPath)) {
  fs.mkdirSync(outPath);
  console.log(`Created output directory ${outPath}`);
}
const server = https.createServer((req, res) => {
  console.log(`URL: ${req.url}`);
  if (req.url.includes("$init$")) {
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Max-Age": 2592000, // 30 days
      "Content-Type": "text/json",
    };
    res.writeHead(200, headers);
    res.end(JSON.stringify({ lastEdited: config.lastEdited, fileNames }));
  } else if (req.url.includes("$getImg$")) {
    imgPath = path.join(inPath, req.url.split("$getImg$")[1]);
    outLabelPath = path.join(
      outPath,
      path.basename(imgPath).slice(0, -4) + ".json"
    );

    console.assert(fs.existsSync(imgPath), "Img file not found");
    // saves in the current folder imgPath
    config.lastEdited = path.basename(imgPath);
    fs.writeFileSync("../config.json", JSON.stringify(config));
    const stat = fs.statSync(imgPath);
    res.writeHead(200, {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "img/png",
      "Content-Length": stat.size,
    });

    const readStream = fs.createReadStream(imgPath);
    // We replaced all the event handlers with a simple call to readStream.pipe()
    readStream.pipe(res);
  } else if (req.url.includes("$getLabel$")) {
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Max-Age": 2592000, // 30 days
      "Content-Type": "text/json",
    };
    res.writeHead(200, headers);
    const content = fs.existsSync(outLabelPath)
      ? fs.readFileSync(outLabelPath, "utf8")
      : "[]";
    res.end(content);
  } else if (req.url.includes("$save$")) {
    const toSave = req.url.split("$save$")[1];
    if (toSave !== "" && outLabelPath !== "") {
      const labels = JSON.parse(toSave);

      console.log(`Saving labels to ${outLabelPath}`);

      fs.writeFileSync(outLabelPath, JSON.stringify(labels));
      res.writeHead(200, {
        "Access-Control-Allow-Origin": "*",
      });
    }
    res.end("saved successfully");
  }
});

server.listen(port, hostname, () => {
  console.log(`Server listening on port http://${hostname}:${port}/`);
});
