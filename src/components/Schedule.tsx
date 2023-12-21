import { Action, ActionPanel, Color, Icon, List } from "@raycast/api";
import { useFetch } from "@raycast/utils";
import { ContextProvider } from "../context";
import { useAppContext } from "../hooks";
import type { Game, ScheduleData } from "../types";
import { formatDate } from "../utils";

export const isSchedule = (item: unknown): item is ScheduleData =>
  typeof item === "object" && item !== null && "played" in item && "unplayed" in item;

const colorMapping = {
  win: Color.Green,
  loss: Color.Red,
  tie: Color.Orange,
};

const Details = ({ title, text }: { title: string; text?: string }) => {
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

const Game = ({ game }: { game: Game }) => {
  const { showDetails, setShowDetails } = useAppContext();

  const accessories = [];
  if (game.gameOutcome !== undefined) {
    accessories.push({
      text: { value: game.gameOutcome, color: colorMapping[game.gameOutcome] },
    });
  }

  return (
    <List.Item
      title={`${game.homeTeam}${game.homeTeamScore !== undefined ? ` ${game.homeTeamScore}` : ""} - ${
        game.awayTeamScore !== undefined ? `${game.awayTeamScore} ` : ""
      }${game.awayTeam}`}
      subtitle={formatDate(game.date, game.time)}
      accessories={accessories}
      detail={
        <List.Item.Detail
          metadata={
            <List.Item.Detail.Metadata>
              <Details title="Competition" text={game.competition} />
              <Details
                title="Home score"
                text={game.homeTeamScore !== undefined ? game.homeTeamScore.toString() : undefined}
              />
              <Details
                title="Away score"
                text={game.awayTeamScore !== undefined ? game.awayTeamScore.toString() : undefined}
              />
              <Details title="Venue" text={game.venue} />
            </List.Item.Detail.Metadata>
          }
        />
      }
      actions={
        <ActionPanel>
          <Action
            title={`${showDetails ? "Hide" : "Show"}  Details`}
            icon={Icon.Sidebar}
            onAction={() => setShowDetails()}
          />
        </ActionPanel>
      }
    />
  );
};

const GamesList = ({ title, games = [] }: { title: string; games: (Game | undefined)[] }) => {
  if (games.length === 0) {
    return null;
  }

  return (
    <List.Section title={title}>
      {games.map((game, i) => {
        if (game === undefined) {
          return null;
        }
        return <Game game={game} key={`${i}-${game.homeSlug}-${game.awaySlug}`} />;
      })}
    </List.Section>
  );
};

const ScheduleComponent = ({ gender }: { gender?: string }) => {
  const { isLoading, data } = useFetch<ScheduleData>(
    `https://api.unwi.se/sport/mff/${gender !== undefined ? `${gender}/` : ""}schedule`,
    { keepPreviousData: true },
  );
  const { showDetails } = useAppContext();

  if (isLoading || !isSchedule(data)) {
    return (
      <List navigationTitle="Table">
        <List.EmptyView icon={Icon.SoccerBall} title={isLoading ? "Loading" : "Unable to load Schedule"} />
      </List>
    );
  }

  return (
    <List filtering={false} navigationTitle="Schedule" isLoading={isLoading} isShowingDetail={showDetails}>
      <GamesList title="Next game" games={data?.unplayed.length !== 0 ? [data?.unplayed[0]] : []} />
      <GamesList title="Last game" games={data?.played.length !== 0 ? [data?.played.at(-1)] : []} />
      <GamesList title="Unplayed" games={data?.unplayed.slice(1)} />
      <GamesList title="Played" games={data?.played} />
    </List>
  );
};

export default function Schedule({ gender }: { gender?: string }) {
  return (
    <ContextProvider>
      <ScheduleComponent gender={gender} />
    </ContextProvider>
  );
}
