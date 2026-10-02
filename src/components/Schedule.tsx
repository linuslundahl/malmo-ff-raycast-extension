import { Action, ActionPanel, Color, Icon, Keyboard, List } from "@raycast/api";
import { useFetch } from "@raycast/utils";
import { useCallback, useMemo, useState } from "react";
import type { Game, ScheduleData } from "../types";
import { formatDate, formatShortDate } from "../utils";

export const isSchedule = (item: unknown): item is ScheduleData =>
  typeof item === "object" && item !== null && "played" in item && "unplayed" in item;

const colorMapping: Record<NonNullable<Game["gameOutcome"]>, Color> = {
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

/** A slug pair identifying the two teams, independent of home/away order. */
const fixturePair = (game: Game) => [game.homeSlug, game.awaySlug].sort().join("|");

const scoreText = (game: Game): string | undefined =>
  game.homeTeamScore !== null && game.awayTeamScore !== null
    ? `${game.homeTeamScore} - ${game.awayTeamScore}`
    : undefined;

type HeadToHead = { played: Game[]; upcoming: Game[] };

const DetailRow = ({ title, text }: { title: string; text?: string }) => {
  if (text === undefined || text === "") {
    return null;
  }

  return <List.Item.Detail.Metadata.Label title={title} text={text} />;
};

const HeadToHeadRow = ({ game }: { game: Game }) => {
  const score = scoreText(game);
  const outcome = game.gameOutcome !== null ? outcomeLabel[game.gameOutcome] : "·";

  return (
    <List.Item.Detail.Metadata.Label
      title={`${game.homeTeam}${score !== undefined ? ` ${score} ` : " - "}${game.awayTeam} (${formatShortDate(game.timestamp)} - ${game.competition})`}
      text={outcome}
      icon={{
        source: Icon.CircleFilled,
        tintColor: game.gameOutcome !== null ? colorMapping[game.gameOutcome] : Color.SecondaryText,
      }}
    />
  );
};

const GameDetail = ({ game, headToHead }: { game: Game; headToHead?: HeadToHead }) => (
  <List.Item.Detail
    metadata={
      <List.Item.Detail.Metadata>
        <List.Item.Detail.Metadata.Label
          title={`${game.homeTeam} - ${game.awayTeam}`}
          text={game.played ? "Full Time" : formatDate(game.timestamp)}
          icon={Icon.SoccerBall}
        />
        <List.Item.Detail.Metadata.Separator />

        <DetailRow title="Competition" text={game.competition} />
        {game.played && <DetailRow title="Date" text={formatDate(game.timestamp)} />}
        <DetailRow title="Result" text={scoreText(game)} />
        <DetailRow title="Venue" text={game.venue} />
        <DetailRow title="Malmö FF" text={game.location === "home" ? "Home" : "Away"} />

        {headToHead !== undefined && headToHead.played.length > 0 && (
          <>
            <List.Item.Detail.Metadata.Separator />
            <List.Item.Detail.Metadata.Label title="Previous Meetings" text="" />
            {headToHead.played.map((other) => (
              <HeadToHeadRow key={gameKey(other)} game={other} />
            ))}
          </>
        )}

        {headToHead !== undefined && headToHead.upcoming.length > 0 && (
          <>
            <List.Item.Detail.Metadata.Separator />
            <List.Item.Detail.Metadata.Label title="Other Fixtures vs Same Opponent" text="" />
            {headToHead.upcoming.map((other) => (
              <List.Item.Detail.Metadata.Label
                key={gameKey(other)}
                title={`${other.homeTeam} - ${other.awayTeam}`}
                text={formatDate(other.timestamp)}
              />
            ))}
          </>
        )}
      </List.Item.Detail.Metadata>
    }
  />
);

const GameItem = ({
  game,
  headToHead,
  onToggleDetails,
}: {
  game: Game;
  headToHead?: HeadToHead;
  onToggleDetails: () => void;
}) => {
  const score = scoreText(game);

  return (
    <List.Item
      title={`${game.homeTeam}${score !== undefined ? ` ${score} ` : " - "}${game.awayTeam}`}
      subtitle={formatDate(game.timestamp)}
      accessories={
        game.gameOutcome !== null ? [{ tag: { value: game.gameOutcome, color: colorMapping[game.gameOutcome] } }] : []
      }
      detail={<GameDetail game={game} headToHead={headToHead} />}
      actions={
        <ActionPanel>
          <Action
            title="Toggle Details"
            icon={Icon.Sidebar}
            shortcut={Keyboard.Shortcut.Common.ToggleQuickLook}
            onAction={onToggleDetails}
          />
        </ActionPanel>
      }
    />
  );
};

const GamesList = ({
  title,
  games = [],
  headToHead,
  onToggleDetails,
}: {
  title: string;
  games: (Game | undefined)[];
  headToHead: Map<string, HeadToHead>;
  onToggleDetails: () => void;
}) => {
  const filtered = games.filter((game): game is Game => game !== undefined);

  if (filtered.length === 0) {
    return null;
  }

  return (
    <List.Section title={title}>
      {filtered.map((game) => (
        <GameItem
          key={gameKey(game)}
          game={game}
          headToHead={headToHead.get(gameKey(game))}
          onToggleDetails={onToggleDetails}
        />
      ))}
    </List.Section>
  );
};

export default function Schedule({ gender }: { gender?: string }) {
  const [showDetails, setShowDetails] = useState(false);
  const { isLoading, data } = useFetch<ScheduleData>(
    `https://api.unwi.se/sport/mff/${gender !== undefined ? `${gender}/` : ""}schedule`,
    { keepPreviousData: true },
  );

  const toggleDetails = useCallback(() => setShowDetails((value) => !value), []);

  const sections = useMemo(() => {
    if (!isSchedule(data)) {
      return null;
    }

    // Group every game by its two teams (order-independent) once, so each
    // game's head-to-head lookup is O(1) instead of re-filtering per render.
    const byPair = new Map<string, Game[]>();
    for (const game of [...data.played, ...data.unplayed]) {
      const pair = fixturePair(game);
      const list = byPair.get(pair);
      if (list === undefined) {
        byPair.set(pair, [game]);
      } else {
        list.push(game);
      }
    }

    const headToHead = new Map<string, HeadToHead>();
    for (const game of [...data.played, ...data.unplayed]) {
      const others = (byPair.get(fixturePair(game)) ?? [])
        .filter((other) => gameKey(other) !== gameKey(game))
        .sort((a, b) => b.timestamp - a.timestamp);
      headToHead.set(gameKey(game), {
        played: others.filter((other) => other.played),
        upcoming: others.filter((other) => !other.played),
      });
    }

    return {
      headToHead,
      nextGame: data.unplayed.slice(0, 1),
      lastGame: data.played.slice(-1),
      unplayed: data.unplayed.slice(1),
      played: data.played,
    };
  }, [data]);

  if (isLoading || sections === null) {
    return (
      <List navigationTitle="Schedule" isLoading={isLoading}>
        <List.EmptyView icon={Icon.SoccerBall} title={isLoading ? "Loading…" : "Unable to load schedule"} />
      </List>
    );
  }

  return (
    <List filtering={false} navigationTitle="Schedule" isLoading={isLoading} isShowingDetail={showDetails}>
      <GamesList title="Next game" games={sections.nextGame} headToHead={sections.headToHead} onToggleDetails={toggleDetails} />
      <GamesList title="Last game" games={sections.lastGame} headToHead={sections.headToHead} onToggleDetails={toggleDetails} />
      <GamesList title="Unplayed" games={sections.unplayed} headToHead={sections.headToHead} onToggleDetails={toggleDetails} />
      <GamesList title="Played" games={sections.played} headToHead={sections.headToHead} onToggleDetails={toggleDetails} />
    </List>
  );
}
