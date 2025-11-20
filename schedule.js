import { exec } from "child_process";


// 判断是否为节假日（根据需要补充）
const holidays = [
];
function isHoliday(date) {
  const ymd = date.toISOString().slice(0, 10);
  return holidays.includes(ymd);
}

// 执行脚本
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

// 获取指定日期（当天）的 10:00 和 12:00 时间戳
function getDayWindow(date) {
  const dayStart = new Date(date);
  dayStart.setHours(10, 0, 0, 0); // 10:00

  const dayEnd = new Date(date);
  dayEnd.setHours(12, 0, 0, 0); // 12:00

  return { start: dayStart.getTime(), end: dayEnd.getTime() };
}

// 生成当天 1~2 个随机执行时间（时间戳数组，已按照从小到大排序）
function generateTodayRunTimes(now = new Date()) {
  const today = new Date(now);
  const y = today.getFullYear();
  const m = today.getMonth();
  const d = today.getDate();
  const baseDate = new Date(y, m, d);

  // 如果今天是周末或节假日，直接返回空数组，今天不跑
  if (isHoliday(baseDate)) {
    return [];
  }

  const { start, end } = getDayWindow(baseDate);
  const windowLength = end - start;

  // 随机决定今天跑几次：1 或 2 次
  const timesCount = Math.random() < 0.5 ? 1 : 2;

  const timestamps = [];
  for (let i = 0; i < timesCount; i++) {
    const offset = Math.floor(Math.random() * windowLength);
    timestamps.push(start + offset);
  }

  // 排序，保证从早到晚
  timestamps.sort((a, b) => a - b);

  return timestamps;
}

// 计算下次要执行的时间（基于今天计划和当前时间）
let todayRunTimes = []; // 当天的计划执行时间戳数组
let todayDateStr = "";  // 记录计划对应的日期字符串

function refreshTodayPlanIfNeeded() {
  const now = new Date();
  const ymd = now.toISOString().slice(0, 10);

  if (ymd !== todayDateStr) {
    // 跨天了，重新生成 “今天” 的执行计划
    todayDateStr = ymd;
    todayRunTimes = generateTodayRunTimes(now);
    console.log("新的每日计划：", new Date(), todayRunTimes.map(t => new Date(t).toLocaleString()));
  }
}

// 获取下一次运行的 delay（ms）
// 如果今天没有计划，或者今天剩余没有执行的时间，则算到 明天 0 点 的时间
function getNextRunDelay() {
  const now = new Date().getTime();

  // 先确保今天计划是最新的
  refreshTodayPlanIfNeeded();

  // 找今天中 “还没执行、且时间在当前时间之后” 的最近一次
  let nextTime = null;
  for (const t of todayRunTimes) {
    if (t > now) {
      nextTime = t;
      break;
    }
  }

  if (nextTime !== null) {
    // 今天还有要执行的，就排这个
    return nextTime - now;
  }

  // 今天没有要执行的了，或者今天是周末/节假日
  // -> 计算到“明天 0 点”的时间，明天 0 点会重建计划
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow.getTime() - now;
}

// 调度逻辑
function scheduleNext() {
  const delay = getNextRunDelay();

  console.log(
    "下一次执行将在",
    Math.round(delay / 1000),
    "秒后"
  );

  setTimeout(() => {
    const now = new Date();

    // 确保当天计划是对的
    refreshTodayPlanIfNeeded();

    // 检查当前时间是否在今天计划列表中（允许一定误差，比如 5 秒）
    const nowTs = now.getTime();
    const tolerance = 5000;

    let index = todayRunTimes.findIndex(
      t => Math.abs(t - nowTs) <= tolerance
    );

    if (index !== -1) {
      console.log("开始执行 test.js，时间：", now.toLocaleString());
      runTest();

      // 执行后，把这个时间从计划表中移除
      todayRunTimes.splice(index, 1);
    } else {
      // 可能是刚跨天等边界情况，直接略过
      console.log("当前时间不在计划执行时间内，跳过：", now.toLocaleString());
    }

    // 继续计划下一次
    scheduleNext();
  }, delay);
}

// 服务常驻
console.log("服务已启动，将在每天 10~12 点之间随机运行 test.js（每天 1~2 次，排除周末/节假日）");
refreshTodayPlanIfNeeded();
scheduleNext();
