import * as Discord from 'discord.js';
import { Config } from "./Config";
import {Commands} from "./Commands";
import "reflect-metadata";

const client = new Discord.Client();
const BOT_SECRET_TOKEN = process.env.BOT_SECRET_TOKEN;

client.on('ready', () => {
    console.log("Connected as " + client.user.tag)
});

client.on('message', receivedMessage => {
    let prefix: string = Config.getPrefixByGuild(receivedMessage.guild.id);
    if (receivedMessage.author.bot || !receivedMessage.content.startsWith(prefix)) {
        return;
    }
    Commands.runCommand(receivedMessage, prefix);
});

client.login(BOT_SECRET_TOKEN);