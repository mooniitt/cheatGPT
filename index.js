import axios from "axios";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

export const requestMessage = async (question) => {
  try {
    const res = await axios.post(
      "https://api.hailidoctor.com/admin/hdai/chat/generalDialogueFluxV1",
      {
        generateScene: 1,
        dialogueCode: process.env.dialogueCode,
        userInputRequest: question,
        strategyCode: "Deepseek-v3",
        fileConvertCodeList: [],
        needSearch: false,
      },
      {
        headers: {
          accept: "*/*",
          "accept-language": "zh-CN,zh;q=0.9",
          authorization: process.env.TOKEN,
          "cache-control": "no-cache",
          "content-type": "application/json",
          pragma: "no-cache",
          priority: "u=1, i",
          "sec-ch-ua":
            '"Google Chrome";v="135", "Not-A.Brand";v="8", "Chromium";v="135"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"macOS"',
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "cross-site",
          timestamp: "1750744487120",
          versionday: "20250623",
          Referer: "https://xunshan.xinglianhealth.com/",
          "Referrer-Policy": "strict-origin-when-cross-origin",
        },
      }
    );

    // if (res?.data?.code !== 200) {
    //   console.error("请求失败:", res.data);
    //   return;
    // }
    // console.log(res.data);
    return res.data;
  } catch (err) {
    console.error("请求失败:", err.message);
  }
};

const questionsObj = JSON.parse(fs.readFileSync("./questions.json", "utf-8"));

// 获取当天的类目（按 Object.keys 顺序，循环分配）
const categories = Object.keys(questionsObj);
const today = new Date();
const dayIndex = Math.floor(today.getTime() / (24 * 60 * 60 * 1000));
const category = categories[dayIndex % categories.length];
const allQuestions = questionsObj[category];

if (
  import.meta.url === process.argv[1] ||
  import.meta.url === `file://${process.argv[1]}`
) {
  const run = async () => {
    for (const q of allQuestions) {
      await requestMessage(q);
    }
  };
  run();
}
