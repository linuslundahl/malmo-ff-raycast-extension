import { Action, ActionPanel, List, useNavigation } from "@raycast/api";
import Table from "./components/Table";
import Schedule, { isSchedule } from "./components/Schedule";
import { useFetch } from "@raycast/utils";
import type { ScheduleData } from "./types";
import { formatGame } from "./utils";

export default function Command() {
  const { push } = useNavigation();
  const { isLoading, data } = useFetch<ScheduleData>(`https://api.unwi.se/sport/mff/schedule`, {
    keepPreviousData: true,
  });

  let nextGame = null;
  if (!isLoading && isSchedule(data) && data?.unplayed.length !== 0) {
    nextGame = formatGame(data?.unplayed[0]);
  }

  return (
    <List navigationTitle={nextGame?.full ?? "Loading next game..."} isShowingDetail={false} isLoading={isLoading}>
      <List.Section title="Men">
        <List.Item
          key="table-men"
          title="Table"
          subtitle="Allsvenskan"
          actions={
            <ActionPanel>
              <Action title="Select" onAction={() => push(<Table />)} />
            </ActionPanel>
          }
        />
        <List.Item
          key="schedule-men"
          title="Schedule"
          subtitle="Allsvenskan"
          actions={
            <ActionPanel>
              <Action title="Select" onAction={() => push(<Schedule />)} />
            </ActionPanel>
          }
        />
      </List.Section>
      <List.Section title="Women">
        <List.Item
          key="table-women"
          title="Table"
          subtitle="Elitettan"
          actions={
            <ActionPanel>
              <Action title="Select" onAction={() => push(<Table gender="dam" />)} />
            </ActionPanel>
          }
        />
        <List.Item
          key="schedule-women"
          title="Schedule"
          subtitle="Elitettan"
          actions={
            <ActionPanel>
              <Action title="Select" onAction={() => push(<Schedule gender="dam" />)} />
            </ActionPanel>
          }
        />
      </List.Section>
    </List>
  );
}
