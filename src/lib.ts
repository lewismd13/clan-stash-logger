import {
  bufferToFile,
  fileToBuffer,
  getPlayerName,
  indexOf,
  Item,
  print,
  toInt,
  toItem,
  visitUrl,
} from "kolmafia";
import { Clan } from "libram";

function formatDate(stringdate: string): Date {
  const [dateComponents, timeComponents] = stringdate.split(", ");

  const [month, day, year] = dateComponents.split("/");
  const [temphours, tempminutes] = timeComponents.split(":");
  let [hours, minutes] = [0, 0];
  if (tempminutes.includes("PM")) {
    [hours, minutes] = [+temphours + 12, +tempminutes.slice(0, 2)];
  } else [hours, minutes] = [+temphours, +tempminutes.slice(0, 2)];

  const date = new Date(+`20${year}`, +month - 1, +day, +hours, +minutes);
  return date;
}

interface Logentry {
  timestamp: Date;
  playerid: number;
  quantity: number;
  item: number;
}

export function updateLogFile(clan: Clan): void {
  const importedLogs: Logentry[] = JSON.parse(fileToBuffer(`stashdata_${clan.id}.json`));
  Clan.join(clan.id);

  const page = visitUrl("clan_log.php");

  const rawlogs = page.slice(
    indexOf(page, "<b>Stash Activity:</b>"),
    indexOf(page, "<b>Basement Stuff:</b>")
  );

  const stashlog = rawlogs.split("<br>");

  const parsedlog = new Array<Logentry>();
  let i = 0;
  for (const line of stashlog) {
    i++;
    if (i > 20) break;
    const re =
      /(?:(\d\d\/\d\d\/\d\d, \d\d:\d\d\wM): <a class=nounder href='showplayer\.php\?who=(\d+)'>.+ \(#\d+\)<\/a> (added|took) (\d+) (.+)\.)/;
    const matches = line.match(re);
    if (!matches) continue;
    const logdate = formatDate(matches[1]);
    const logplayerid = +matches[2];
    let logquantity = +matches[4];
    if (matches[3] === "took") logquantity = -logquantity;
    const logitem = toInt(toItem(matches[5], 2));
    print(line);
    print(
      `On ${logdate}, ${getPlayerName(logplayerid)} added ${logquantity} of the item ${toItem(
        logitem
      )} to the stash.`
    );

    const entry: Logentry = {
      timestamp: logdate,
      playerid: logplayerid,
      quantity: logquantity,
      item: logitem,
    };
    parsedlog.push(entry);
  }

  importedLogs.sort(
    (a, b) => Date.parse(b.timestamp.toString()) - Date.parse(a.timestamp.toString())
  );
  print(
    `The newest data in the saved file is ${importedLogs[0].timestamp.toUTCString()}: ${
      importedLogs[0].playerid
    } ${importedLogs[0].item}`
  );
  print(`The newest data in the current log is ${parsedlog[0].timestamp.toUTCString()}`);
  // const combinedlogs: Logentry[] = { ...parsedlog, ...importedLogs };

  // bufferToFile(JSON.stringify(combinedlogs), `stashdata_${clan.id}.json`);
}

export function newLogFile(clan: Clan) {
  Clan.join(clan.id);

  const page = visitUrl("clan_log.php");

  const rawlogs = page.slice(
    indexOf(page, "<b>Stash Activity:</b>"),
    indexOf(page, "<b>Basement Stuff:</b>")
  );

  const stashlog = rawlogs.split("<br>");

  const parsedlog = new Array<Logentry>();
  // let i = 0;
  for (const line of stashlog) {
    // i++;
    // if (i > 20) break;
    const re =
      /(?:(\d\d\/\d\d\/\d\d, \d\d:\d\d\wM): <a class=nounder href='showplayer\.php\?who=(\d+)'>.+ \(#\d+\)<\/a> (added|took) (\d+) (.+)\.)/;
    const matches = line.match(re);
    if (!matches) continue;
    const logdate = formatDate(matches[1]);
    const logplayerid = +matches[2];
    let logquantity = +matches[4];
    if (matches[3] === "took") logquantity = -logquantity;
    const logitem = toInt(toItem(matches[5], 2));
    // print(line);
    print(
      `On ${logdate}, ${getPlayerName(logplayerid)} added ${logquantity} of the item ${toItem(
        logitem
      )} to the stash.`
    );

    const entry: Logentry = {
      timestamp: logdate,
      playerid: logplayerid,
      quantity: logquantity,
      item: logitem,
    };
    parsedlog.push(entry);
  }

  bufferToFile(JSON.stringify(parsedlog), `stashdata_${clan.id}.json`);
}

export function auditPlayer(player: number) {
  const clan = Clan.get();
  const items = new Map<number, number>();
  const importedLogs: Logentry[] = JSON.parse(fileToBuffer(`stashdata_${clan.id}.json`));
  const filtereddata = importedLogs.filter((id) => id.playerid === player);
  for (const entry of filtereddata) {
    if (!items.get(entry.item)) {
      items.set(entry.item, entry.quantity);
    } else {
      const oldvalue = items.get(entry.item);
      if (oldvalue) items.set(entry.item, oldvalue + entry.quantity);
    }
  }
  print(`${getPlayerName(player)}:`);
  for (const value of items) {
    if (value[1] !== 0) print(`${Item.get(value[0])}: ${value[1]}`);
  }
}
