import { Color, Icon, List } from "@raycast/api";
import { useFetch } from "@raycast/utils";
import { useMemo } from "react";
import type { Data, Team } from "../types";

const LEAGUE_TITLES = new Set(["Allsvenskan", "Damallsvenskan"]);
const MALMO_FF_SLUGS = new Set(["mff", "malmo-ff"]);

const ACCESSORY_TOOLTIPS = [
  ["gp", "Games Played"],
  ["w", "Wins"],
  ["d", "Draws"],
  ["l", "Losses"],
  ["gf", "Goals For"],
  ["ga", "Goals Against"],
  ["gd", "Goal Difference"],
  ["pts", "Points"],
] as const;

const TeamRow = ({ team }: { team: Team }) => {
  const isMalmoFF = MALMO_FF_SLUGS.has(team.teamSlug);

  return (
    <List.Item
      title={`${team.rank}. ${team.teamName}`}
      accessories={ACCESSORY_TOOLTIPS.map(([key, tooltip]) => ({
        text: isMalmoFF ? { value: team.stats[key], color: Color.Blue } : { value: team.stats[key] },
        tooltip,
      }))}
    />
  );
};

export default function Table({ gender }: { gender?: string }) {
  const { isLoading, data } = useFetch<Data>(
    `https://api.unwi.se/sport/mff/${gender !== undefined ? `${gender}/` : ""}standings`,
    { keepPreviousData: true },
  );

  const leagues = useMemo(
    () => (data === undefined ? [] : Object.values(data).filter((league) => LEAGUE_TITLES.has(league.title))),
    [data],
  );

  if (isLoading || data === undefined) {
    return (
      <List navigationTitle="Table" isLoading={isLoading}>
        <List.EmptyView icon={Icon.SoccerBall} title={isLoading ? "Loading…" : "Unable to load table"} />
      </List>
    );
  }

  return (
    <List filtering={false} navigationTitle="Table" isLoading={isLoading}>
      {leagues.map((league) => (
        <List.Section key={league.title} title={league.title}>
          {league.table.map((team) => (
            <TeamRow key={team.teamSlug} team={team} />
          ))}
        </List.Section>
      ))}
    </List>
  );
}
