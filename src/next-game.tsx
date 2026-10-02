import { LaunchType, environment, launchCommand, updateCommandMetadata } from "@raycast/api";
import { isSchedule } from "./components/Schedule";
import { formatGame } from "./utils";
import { ScheduleData } from "./types";

export default async function Command() {
  try {
    const response = await fetch("https://api.unwi.se/sport/mff/schedule");
    const data = (await response.json()) as unknown as ScheduleData;

    if (isSchedule(data) && data.unplayed.length > 0) {
      const nextGame = formatGame(data.unplayed[0]);
      await updateCommandMetadata({ subtitle: nextGame.full });
    }
  } catch {
    // Background refresh failures are non-fatal; keep the previous subtitle.
  }

  if (environment.launchType === LaunchType.UserInitiated) {
    await launchCommand({ name: "index", type: LaunchType.UserInitiated });
  }
}
