import { exec } from "child_process";

// 判断是否为周末
function isWeekend(date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

// 判断是否为节假日（可根据需要补充节假日列表，以下为示例）
const holidays = [
  "2025-02-01", // 示例：春节（请根据实际节假日补充）
  // 可继续添加
];
function isHoliday(date) {
  const ymd = date.toISOString().slice(0, 10);
  return holidays.includes(ymd);
}

// 计算下次10~12点之间的随机时间（单位：ms），排除周末和节假日
function getNextRunDelay() {
  const now = new Date();
  let next = new Date(now);
  next.setDate(now.getDate() + 1);
  next.setHours(10, 0, 0, 0);

  // 找到下一个非周末且非节假日的日期
  while (isWeekend(next) || isHoliday(next)) {
    next.setDate(next.getDate() + 1);
  }

  // 随机偏移0~2小时（单位：ms）
  const offset = Math.floor(Math.random() * 2 * 60 * 60 * 1000);
  const nextRun = next.getTime() + offset;
  return nextRun - now.getTime();
}

function runTest() {
  exec("node ./test.js", (error, stdout, stderr) => {
    if (error) {
      console.error(`执行出错: ${error}`);
      return;
    }
    if (stdout) console.log(`输出: ${stdout}`);
    if (stderr) console.error(`错误: ${stderr}`);
  });
}

function scheduleNext() {
  const delay = getNextRunDelay();
  setTimeout(() => {
    runTest();
    scheduleNext();
  }, delay);
}

// 服务常驻
console.log("服务已启动，将在每天10~12点之间自动运行 test.js");
scheduleNext();
