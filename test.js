import fs from "fs";
import { requestMessage } from "./index.js";

// 读取所有问题（新结构，分类对象）
const questionsObj = JSON.parse(fs.readFileSync("./questions.json", "utf-8"));

const categoryKeys = Object.keys(questionsObj);
const randomCategory =
  categoryKeys[Math.floor(Math.random() * categoryKeys.length)];
const selectedCategoryQuestions = questionsObj[randomCategory];

// 随机选取6~15个问题
const getRandomQuestions = (arr, n) => {
  const result = [];
  const used = new Set();
  while (result.length < n && used.size < arr.length) {
    const idx = Math.floor(Math.random() * arr.length);
    if (!used.has(idx)) {
      used.add(idx);
      result.push(arr[idx]);
    }
  }
  return result;
};

const num = 8 + Math.floor(Math.random() * 10); // 6~15
const randomQuestions = getRandomQuestions(selectedCategoryQuestions, num);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// 日志目录和文件名
const logDir = "./log";
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}
const logFile = `${logDir}/${new Date().toISOString().slice(0, 10)}.log`;

const appendLog = (msg) => {
  fs.appendFileSync(logFile, msg + "\n");
};

const run = async () => {
  for (const q of randomQuestions) {
    const logMsg = `[${new Date().toLocaleString()}] 提问：${q}`;
    console.log(logMsg);
    appendLog(logMsg);
    await requestMessage(q);
    // 随机等待 1分钟~2分钟（60000~120000ms）
    await sleep(60000 + Math.random() * 60000);
  }
};

run();
