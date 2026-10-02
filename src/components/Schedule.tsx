import { Action, ActionPanel, Color, Icon, Keyboard, List } from "@raycast/api";
import { useFetch } from "@raycast/utils";
import { useCallback, useMemo, useState } from "react";
import type { Game, ScheduleData } from "../types";
import { formatDate } from "../utils";

export const isSchedule = (item: unknown): item is ScheduleData =>
  typeof item === "object" && item !== null && "played" in item && "unplayed" in item;

const colorMapping: Record<NonNullable<Game["gameOutcome"]>, Color> = {
  win: Color.Green,
  loss: Color.Red,
  tie: Color.Orange,
};

const DetailRow = ({ title, text }: { title: string; text?: string }) => {
  if (text === undefined || text === "") {
    return null;
  }

  return (
    <>
      <List.Item.Detail.Metadata.Label title={title} text={text} />
      <List.Item.Detail.Metadata.Separator />
    </>
  );
};

const GameItem = ({ game, onToggleDetails }: { game: Game; onToggleDetails: () => void }) => {
  const score =
    game.homeTeamScore !== null && game.awayTeamScore !== null
      ? ` ${game.homeTeamScore} - ${game.awayTeamScore} `
      : " - ";

  return (
    <List.Item
      title={`${game.homeTeam}${score}${game.awayTeam}`}
      subtitle={formatDate(game.timestamp)}
      accessories={
        game.gameOutcome !== null ? [{ tag: { value: game.gameOutcome, color: colorMapping[game.gameOutcome] } }] : []
      }
      detail={
        <List.Item.Detail
          metadata={
            <List.Item.Detail.Metadata>
              <DetailRow title="Competition" text={game.competition} />
              <DetailRow
                title="Result"
                text={
                  game.homeTeamScore !== null && game.awayTeamScore !== null
                    ? `${game.homeTeamScore} - ${game.awayTeamScore}`
                    : undefined
                }
              />
              <DetailRow title="Venue" text={game.venue} />
            </List.Item.Detail.Metadata>
          }
        />
      }
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
  onToggleDetails,
}: {
  title: string;
  games: (Game | undefined)[];
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
          key={`${game.date}-${game.homeSlug}-${game.awaySlug}`}
          game={game}
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
    return {
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
      <GamesList title="Next game" games={sections.nextGame} onToggleDetails={toggleDetails} />
      <GamesList title="Last game" games={sections.lastGame} onToggleDetails={toggleDetails} />
      <GamesList title="Unplayed" games={sections.unplayed} onToggleDetails={toggleDetails} />
      <GamesList title="Played" games={sections.played} onToggleDetails={toggleDetails} />
    </List>
  );
}
