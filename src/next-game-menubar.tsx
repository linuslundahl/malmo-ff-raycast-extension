import { Icon, MenuBarExtra } from "@raycast/api";
import { useFetch } from "@raycast/utils";
import { ScheduleData } from "./types";
import { formatGame } from "./utils";

export default function Command() {
  const { isLoading, data } = useFetch<ScheduleData>(`https://api.unwi.se/sport/mff/schedule`, {
    keepPreviousData: true,
  });

  if (data === undefined) {
    return null;
  }

  return (
    <MenuBarExtra
      icon={Icon.SoccerBall}
      title={formatGame(data.unplayed[0]).full}
      tooltip="Malmö FF - Next game"
      isLoading={isLoading}
    >
      {[...data.played, ...data.unplayed].map((game, i) => {
        const nextGame = formatGame(game);
        return <MenuBarExtra.Item title={nextGame.teams} subtitle={nextGame.date} key={i} />;
      })}
    </MenuBarExtra>
  );
}
