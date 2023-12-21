import { LaunchType, environment, launchCommand, updateCommandMetadata } from "@raycast/api";
import { isSchedule } from "./components/Schedule";
import fetch from "node-fetch";
import { formatGame } from "./utils";
import { ScheduleData } from "./types";

export default async function Command() {
  const response = await fetch(`https://api.unwi.se/sport/mff/schedule`);
  const data = (await response.json()) as unknown as ScheduleData;

  if (isSchedule(data) && data?.unplayed.length !== 0) {
    const nextGame = formatGame(data?.unplayed[0]);
    updateCommandMetadata({ subtitle: nextGame?.full ?? "Loading next game..." });
  }

  if (environment.launchType === LaunchType.UserInitiated) {
    await launchCommand({ name: "index", type: LaunchType.UserInitiated });
  }
}
