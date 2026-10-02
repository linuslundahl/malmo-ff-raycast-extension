import { Color, Icon, List } from "@raycast/api";
import { useFetch } from "@raycast/utils";
import { useMemo, useState } from "react";
import type { Data, Game, ScheduleData, Team } from "../types";
import { formatDate, formatShortDate } from "../utils";
import { isSchedule } from "./Schedule";

const LEAGUE_TITLES = new Set(["Allsvenskan", "Damallsvenskan"]);
const MALMO_FF_SLUGS = new Set(["mff", "malmo-ff"]);

const outcomeColor: Record<NonNullable<Game["gameOutcome"]>, Color> = {
  win: Color.Green,
  loss: Color.Red,
  tie: Color.Orange,
};

const outcomeLabel: Record<NonNullable<Game["gameOutcome"]>, string> = {
  win: "W",
  loss: "L",
  tie: "D",
};

const gameKey = (game: Game) => `${game.date}-${game.homeSlug}-${game.awaySlug}`;

/** A team's played (most recent last) and upcoming games. */
type TeamGames = { played: Game[]; upcoming: Game[] };

const ResultRow = ({ game }: { game: Game }) => {
  const score =
    game.homeTeamScore !== null && game.awayTeamScore !== null ? ` ${game.homeTeamScore} - ${game.awayTeamScore}` : "";
  const outcome = game.gameOutcome !== null ? outcomeLabel[game.gameOutcome] : "·";

  return (
    <List.Item.Detail.Metadata.Label
      title={`${game.homeTeam}${score} ${game.awayTeam} (${formatShortDate(game.timestamp)} - ${game.competition})`}
      text={outcome}
      icon={{
        source: Icon.CircleFilled,
        tintColor: game.gameOutcome !== null ? outcomeColor[game.gameOutcome] : Color.SecondaryText,
      }}
    />
  );
};

const FixtureRow = ({ game }: { game: Game }) => (
  <List.Item.Detail.Metadata.Label
    title={`${game.homeTeam} - ${game.awayTeam} (${game.competition})`}
    text={formatDate(game.timestamp)}
  />
);

const TeamDetail = ({ team, teamGames }: { team: Team; teamGames?: TeamGames }) => {
  const played = teamGames?.played ?? [];
  const upcoming = teamGames?.upcoming ?? [];

  return (
    <List.Item.Detail
      metadata={
        <List.Item.Detail.Metadata>
          <List.Item.Detail.Metadata.Label title="Team" text={team.teamName} />
          <List.Item.Detail.Metadata.Label title="Played" text={team.stats.gp} />
          <List.Item.Detail.Metadata.Label title="Won" text={team.stats.w} />
          <List.Item.Detail.Metadata.Label title="Drawn" text={team.stats.d} />
          <List.Item.Detail.Metadata.Label title="Lost" text={team.stats.l} />
          <List.Item.Detail.Metadata.Separator />
          <List.Item.Detail.Metadata.Label title="Goals For" text={team.stats.gf} />
          <List.Item.Detail.Metadata.Label title="Goals Against" text={team.stats.ga} />
          <List.Item.Detail.Metadata.Label title="Goal Difference" text={team.stats.gd} />

          {played.length > 0 && (
            <>
              <List.Item.Detail.Metadata.Separator />
              <List.Item.Detail.Metadata.Label title="Recent Results" text="" />
              {played.map((game) => (
                <ResultRow key={gameKey(game)} game={game} />
              ))}
            </>
          )}

          {upcoming.length > 0 && (
            <>
              <List.Item.Detail.Metadata.Separator />
              <List.Item.Detail.Metadata.Label title="Upcoming Fixtures" text="" />
              {upcoming.map((game) => (
                <FixtureRow key={gameKey(game)} game={game} />
              ))}
            </>
          )}
        </List.Item.Detail.Metadata>
      }
    />
  );
};

const TeamRow = ({ team, teamGames }: { team: Team; teamGames?: TeamGames }) => {
  const mff = MALMO_FF_SLUGS.has(team.teamSlug);

  return (
    <List.Item
      id={team.teamSlug}
      title={team.rank.toString()}
      subtitle={team.teamName}
      accessories={[
        {
          text: { value: team.stats.pts, color: mff ? Color.Blue : Color.PrimaryText },
          tooltip: "Points",
        },
      ]}
      detail={<TeamDetail team={team} teamGames={teamGames} />}
    />
  );
};

export default function Table({ gender }: { gender?: string }) {
  const base = `https://api.unwi.se/sport/mff/${gender !== undefined ? `${gender}/` : ""}`;
  const { isLoading: standingsLoading, data: standings } = useFetch<Data>(`${base}standings`, {
    keepPreviousData: true,
  });
  const { data: schedule } = useFetch<ScheduleData>(`${base}schedule`, { keepPreviousData: true });

  const [selectedTeam, setSelectedTeam] = useState<string>();

  const isLoading = standingsLoading;

  const leagues = useMemo(
    () => (standings === undefined ? [] : Object.values(standings).filter((league) => LEAGUE_TITLES.has(league.title))),
    [standings],
  );

  // Group games by team slug once, so each row gets its own slice via O(1)
  // lookup instead of every row filtering the whole list on every render.
  const gamesByTeam = useMemo(() => {
    const map = new Map<string, TeamGames>();
    if (!isSchedule(schedule)) {
      return map;
    }

    for (const game of [...schedule.played, ...schedule.unplayed]) {
      for (const slug of [game.homeSlug, game.awaySlug]) {
        const entry = map.get(slug) ?? { played: [], upcoming: [] };
        if (game.played) {
          entry.played.push(game);
        } else {
          entry.upcoming.push(game);
        }
        map.set(slug, entry);
      }
    }

    // Played games arrive oldest-first; keep the most recent 5. Upcoming
    // arrive soonest-first; keep the next 5.
    for (const entry of map.values()) {
      entry.played = entry.played.slice(-5).reverse();
      entry.upcoming = entry.upcoming.slice(0, 5);
    }

    return map;
  }, [schedule]);

  // Default the selection to Malmö FF, computed once per data load.
  const defaultSelection = useMemo(
    () => leagues[0]?.table.find((team) => MALMO_FF_SLUGS.has(team.teamSlug))?.teamSlug,
    [leagues],
  );

  if (isLoading || standings === undefined) {
    return (
      <List navigationTitle="Table" isLoading={isLoading}>
        <List.EmptyView icon={Icon.SoccerBall} title={isLoading ? "Loading…" : "Unable to load table"} />
      </List>
    );
  }

  return (
    <List
      filtering={false}
      navigationTitle="Table"
      isLoading={isLoading}
      isShowingDetail
      selectedItemId={selectedTeam ?? defaultSelection}
      onSelectionChange={(id) => setSelectedTeam(id ?? undefined)}
    >
      {leagues.map((league) => (
        <List.Section key={league.title} title={league.title}>
          {league.table.map((team) => (
            <TeamRow key={team.teamSlug} team={team} teamGames={gamesByTeam.get(team.teamSlug)} />
          ))}
        </List.Section>
      ))}
    </List>
  );
}
