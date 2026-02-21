import chalk from "chalk";
import boxen from "boxen";
import ora from "ora";

export const success = (message: string) => {
  console.log(chalk.green("✓"), message);
};

export const error = (message: string) => {
  console.log(chalk.red("✗"), message);
};

export const warning = (message: string) => {
  console.log(chalk.yellow("⚠"), message);
};

export const info = (message: string) => {
  console.log(chalk.blue("ℹ"), message);
};

export const header = (title: string) => {
  console.log(
    boxen(chalk.bold.cyan(title), {
      padding: 1,
      margin: 1,
      borderStyle: "round",
      borderColor: "cyan",
    }),
  );
};

export const spinner = (text: string) => {
  return ora({
    text,
    color: "cyan",
  }).start();
};

export const table = (data: Record<string, string>[]) => {
  if (data.length === 0) return;

  const keys = Object.keys(data[0]);
  const maxLengths = keys.map((key) =>
    Math.max(key.length, ...data.map((row) => String(row[key]).length)),
  );

  // Header
  console.log(
    chalk.bold(keys.map((key, i) => key.padEnd(maxLengths[i])).join("  ")),
  );
  console.log(
    chalk.gray(keys.map((_, i) => "─".repeat(maxLengths[i])).join("  ")),
  );

  // Rows
  data.forEach((row) => {
    console.log(
      keys.map((key, i) => String(row[key]).padEnd(maxLengths[i])).join("  "),
    );
  });
};
