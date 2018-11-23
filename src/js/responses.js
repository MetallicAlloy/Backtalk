const {reload, rndrsp, cleantext} = require('./shared.js');
const rules = require('./rules.js');
const fs = require('fs-extra');
const path = require('path');
const API = require('./database/database.js').default;
import {rate_card} from './database/rate.js';
import {full_art, display_card} from './database/card.js';
import {goodstuff, badultras} from './goodstuff.js';
import {banlist, whyban, limited} from './bans.js';

module.exports = function(message) {
  if (process.env.NODE_ENV == "development" && message.guild.id != "504052742201933824") return; // Dev Server
  if (message.author.bot) return; //Ignore bot messages

  const bot = this;
  const content = message.content;
  const channel = bot.channels.get(message.channel.id);
  const mentions = Array.from(message.mentions.users.keys());

  // Prevents sending an empty message
  const send = (message) => {
    if (message) channel.send(message).catch(console.error);
  }

  const insertname = (resp, name) => {
    // Replace the mention with the display name
    if (mentions.length > 0) {
      name = this.guilds.get(message.guild.id).members.get(mentions[0]).displayName;
    }

    if (name)
      resp = resp.replace(/\{\{.+?\|(x*(.*?)|(.*?)x*)\}\}/ig, (match, p1, p2) => {return p1.replace(/x/i, name)});
    else
      resp = resp.replace(/\{\{(.*?)\|.*?\}\}/ig, (match, p1) => {return p1});
    return resp;
  }

try {
  // Our bot needs to know if it will execute a command
  // It will listen for messages that will start with `!`
  if (content.substring(0, 1) == '!') {
    const commands = reload('../config/commands.json');

    let args = content.substring(1).split(' ');
    let cmd = args[0].toLowerCase().trim();

    var options = [];
    args = args.splice(1).join(" ").replace(/(?:--|—)(\w+)/g, (match, p1) => {
      options.push(p1);
      return "";
    }).trim();

    switch(cmd) {
      case 'ping':
        message.reply('Pong!');
        break;
      case 'pong':
        channel.send('That\'s my role!');
        break;
      /* Commands */
      case 'commands':
        if (message.guild.id == 135657678633566208 && (channel.id != 387805334657433600 && channel.id != 418856983018471435))
          channel.send("To be curtious to other conversations, ask me in <#387805334657433600> :)");
        else
          send(help());
        break;
      /* Cards */
      case 'c':
      case 'card':
        send(display_card(args, options, bot));
        break;
      case 'full':
      case 'fullart':
        send(full_art(args));
        break;
      case 'find':
        send(API.find_name(args));
        break;
      case 'rate':
        send(rate_card(args, options, bot));
        break;
      /* Rule */
      case 'rule':
      case 'rules':
      case 'ruling':
        send(rules(args));
        break;
      /* Compliments */
      case 'flirt':
      case 'compliment':
        send(insertname(rndrsp(commands['compliment']), args));
        break;
      /* Insults */
      case 'burn':
      case 'roast':
      case 'insult':
        if (mentions.indexOf('279331985955094529') !== -1) 
          channel.send("<:Bodal:401553896108982282> just... <:Bodal:401553896108982282>");
        else
          send(insertname(rndrsp(commands['insult']), args));
        break;
      /* Jokes */
      case 'joke':
        send(rndrsp(commands["joke"]));
        break;
      /* Documents */
      case 'rulebook':
        channel.send("https://drive.google.com/file/d/1kzkAUXj-xsr19XkVp-cYr5V7QXGgdGMT/view");
        break;
      case 'cr':
        channel.send("<https://drive.google.com/file/d/1BFJ2lt5P9l4IzAWF_iLhhRRuZyNIeCr-/view>");
        break;
      case 'errata':
        channel.send("<https://drive.google.com/file/d/1eVyw_KtKGlpUzHCxVeitomr6JbcsTl55/view>");
        break;
      case 'guide':
        channel.send("<https://docs.google.com/document/d/1WJZIiINLk_sXczYziYsizZSNCT3UUZ19ypN2gMaSifg/view>");
        break;
      /* Starters */
      case 'starter':
      case 'starters':
        if (options.includes("metal")) send(commands["starter"][1]);
        else if (options.includes("king")) send(commands["starter"][2]);
        else send(commands["starter"][0]);
        break;
      /* Banlist and Alternative Formats */
      case 'ban':
        if (mentions.length > 0) {
          if (mentions.indexOf('279331985955094529') !== -1)
            channel.send("You try to ban me? I'll ban you!")
          else
            channel.send("I'm not in charge of banning players");
          break;
        }
      case 'whyban':
        if (mentions.length > 0) {
          channel.send("Player's aren't cards, silly");
          break;
        }
        else if (args.length > 0) {
          send(whyban(args));
          break;
        }
      case 'banlist':
        if (message.guild.id == 135657678633566208 && (channel.id != 387805334657433600 && channel.id != 418856983018471435 && channel.id !=473975360342458368))
          channel.send("I'm excited you want to follow the ban list, but to keep the channel from clogging up, can you ask me in <#387805334657433600>?");
        else
          send(banlist(options));
        break;
      case 'limited':
        send(limited());
        break;
      case 'strong':
      case 'good':
      case 'best':
      case 'goodstuff':
        if (message.guild.id == 135657678633566208 && (channel.id != 387805334657433600)) {
          channel.send("This list is long. Please ask in <#387805334657433600>")
        }
        else {
          send(goodstuff(args));
        }
        break;
      case 'bad':
      case 'badstuff':
      case 'badultras':
        send(badultras());
        break;
      case 'rm':
      case 'delete':
        let lstmsg = bot.user.lastMessage;
        if (lstmsg && lstmsg.deletable) lstmsg.delete(); // lstmsg.deletable
        if (message.deletable) message.delete(); // delete user msg
        break;
      /* Misc */
      case 'sandwich':
        channel.send(":bread: :cheese: :bacon: :tomato: :meat_on_bone: :bread: -> :hamburger:");
        break;
      case 'pizza':
        channel.send(":bread: :tomato: :cheese: :meat_on_bone: -> :pizza:");
        break;
      case 'sandwitch':
        send(display_card(["Arkanin"], bot));
        break;
      case 'never':
      case 'nowornever':
        send(nowornever(args));
        break;
      /* Moderator Only */
      case 'haxxor':
        reset(message, channel);
        break;
    }
    return;
  }

  // If no commands check message content for quips
  send(checkSass.call(bot, mentions, message));
}
catch (err) {
  console.error(err);
  bot.destroy();
}
}

function reset(message, channel) {
  if (message.guild.id == '135657678633566208' &&
    (message.member.roles.find(role => role.name==="Administrator") || message.member.roles.find(role => role.name==="Moderator"))
  ) {
    channel.send('Resetting...')
    .then(msg => {
      fs.remove(path.join(__dirname, '../db'), (err) => {
        new API();
        bot.destroy();
      });
    });
  }
}

// Responses
function help(args) {
  const {help} = reload('../config/commands.json');
  let message = "";
  for (var key in help) {
    message += "\n" + help[key] + "\n";
  }
  return message;
}

function nowornever(card) {
  const cards = require('../config/nowornever.json');
  card = cleantext(card); // re-merge string

  if (!card) {
    // Return random card
    var keys = Object.keys(cards);
    return `${cards[keys[keys.length * Math.random() << 0]]}`;
  }

  for (var key in cards) {
    if (cleantext(key).indexOf(card) === 0) {
      return `${cards[key]}`;
    }
  }
}

function checkSass(mentions, message) {
  const {sass, tags} = reload('../config/sass.json');
  let content = message.content;

  for (var key in sass) {
    if (content.match(new RegExp(key, "i")))
      return rndrsp(sass[key]);
  }

  if (mentions.length <= 0) return;
  let response = "";

  // if (mentions.indexOf('140143063711481856') !== -1) //kingmaxor4

  if (mentions.indexOf('279788856285331457') !== -1) // Afjak
    return ('Don\'t @ the Oracle. He sees everything anyway');

  if (mentions.indexOf('279331985955094529') !== -1) {// ChaoticBacktalk
    if (content.match(new RegExp(/did.+(king).+(make|create)/, "i"))) {
      response = (rndrsp(tags["daddy"]));
    }
    else if (content.match(new RegExp(/who.+(made|created)/, "i"))) {
      try {
        let displayname = this.guilds.get(message.guild.id).members.get("140143063711481856").displayName;
        response = `${displayname} taught me Chaotic`;
      }
      catch(err) {}
    }
    else {
      response = (rndrsp(tags["hello"]));
    }
  }

  return response;
}
