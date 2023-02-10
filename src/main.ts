import { Clan } from "libram";

import { updateLogFile } from "./lib";

/*
auditPlayer(parseInt(getPlayerId("asmodais")));

function main(args: string) {
  const options = args.split(" ");
  if (options.includes("help")) {
    print("A script for saving and parsing clan stash logs.");
    print(
      `This script will not change clans for you, so make sure you're in the clan for which you want to save logs.`
    );
    print(`You're currently in ${Clan.get().name}`);
    print(`save: fetch, parse, and save stash logs`);
    print(`audit [player]: Print any items a player has taken without returning or vice versa.`);
    print(`days=[number]: how many days to look back`);
    return;
  } else if (options.includes("save")) {
  }
}
*/

updateLogFile(Clan.get());
