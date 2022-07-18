import * as https from "http";
import * as fs from "fs";
import * as path from "path";

const hostname = "127.0.0.1";
const port = 3000;

let imgPath = "";
let outLabelPath = "";
const config = JSON.parse(
  fs.readFileSync(path.join("..", "config.json"), "utf8")
);
console.log(config);
const inPath = config.in_path;
const outPath = config.out_path;
console.assert(fs.existsSync(inPath), "in_path does not exist.");
const fileNames = fs.readdirSync(inPath);
if (config.lastEdited === "" || config.lastEdited === undefined) {
  config.lastEdited = fileNames[0];
}
if (!fs.existsSync(path.join(outPath, config.lastEdited))) {
  fs.writeFileSync(path.join(outPath, config.lastEdited), "[]");
}
console.log(`Found ${fileNames.length} in input directory.`);
if (!fs.existsSync(outPath)) {
  fs.mkdirSync(outPath);
  console.log(`Created output directory ${outPath}`);
}
const server = https.createServer((req, res) => {
  console.log(`\n\nTIME:${new Date().getTime()} URL: ${req.url}`);
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
      "Content-Type": "text/json",
    };
    res.writeHead(200, headers);
    let content = [];
    if (fs.existsSync(outLabelPath)) {
      console.log(`Found label file: ${outLabelPath}`);
      content = fs.readFileSync(outLabelPath, "utf8").toString();
      const parsed = JSON.parse(content);
      console.log(`Content: ${content}`);
    } else {
      console.log(`Label file not found: ${outLabelPath}`);
      content = "[]";
    }
    res.end(content);
  } else if (req.url.includes("$save$")) {
    const toSave = req.url.split("$save$")[1];
    res.writeHead(200, {
      "Access-Control-Allow-Origin": "*",
    });
    if (toSave !== "" && outLabelPath !== "") {
      const labels = JSON.parse(toSave);
      console.log(`Received labels (count = ${labels.length}):`);
      console.log(labels);
      const invalidLabels = labels.filter((el) => {
        const uba = el.filter((subel) => {
          return subel === null || subel === undefined;
        });
        return uba.length > 0;
      });
      if (invalidLabels.length === 0) {
        const reallyValidLabels = labels.filter(
          (el) => el[0] >= 0 && el[1] >= 0 && el[0] <= 292 && el[1] <= 292
        );
        if (reallyValidLabels.length !== labels.length) {
          console.log("Too large or too small labels found. Ignoring them.");
        }
        console.log(`Saving labels to ${outLabelPath}`);
        if (reallyValidLabels.length > 0) {
          fs.writeFileSync(outLabelPath, JSON.stringify(reallyValidLabels));
        }
      } else {
        console.log(`Found some invalid labels.`);
        console.log(invalidLabels);
      }
    }
    res.end("saved successfully");
  }
});

server.listen(port, hostname, () => {
  console.log(`Server listening on port http://${hostname}:${port}/`);
});
