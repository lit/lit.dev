/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {
  ChatInputCommandInteraction,
  Client,
  GatewayIntentBits,
  InteractionType,
  REST,
  Routes,
  SlashCommandBuilder,
} from 'discord.js';
import algolia from 'algoliasearch/lite.js';
import {publicVars} from 'lit-dev-tools-esm/lib/configs.js';

// set up algolia search
const algClient = algolia(
  publicVars.algolia.appId,
  publicVars.algolia.searchOnlyKey
);
const index = algClient.initIndex(publicVars.algolia.index);

// The is the GH action secret under the name LIT_DEV_DISCORD_BOT_CLIENT_TOKEN
const BOT_CLIENT_SECRET = process.env.BOT_CLIENT_SECRET;

if (!BOT_CLIENT_SECRET) {
  throw new Error('Missing BOT_CLIENT_SECRET');
}

interface Suggestion {
  id: number;
  relativeUrl: string;
  heading: string;
  isSubsection: boolean;
  title: string;
}

// Build the UI for the slash command.
const command = new SlashCommandBuilder()
  .setName('docs')
  .setDescription('Will search lit.dev.')
  .addStringOption((option) =>
    option
      .setName('query')
      .setDescription('The query to search for.')
      .setRequired(true)
      .setAutocomplete(true)
  );

const rest = new REST({version: '10'}).setToken(BOT_CLIENT_SECRET);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    // Tell Discord that we publish the following slash commands.
    await rest.put(Routes.applicationCommands(publicVars.discord.clientId), {
      body: [command],
    });

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();

const client = new Client({intents: [GatewayIntentBits.Guilds]});

client.on('ready', () => {
  console.log(`Logged in as ${client.user?.tag}!`);
});

client.on('interactionCreate', async (interaction) => {
  if ((interaction as ChatInputCommandInteraction).commandName !== 'docs') {
    return;
  }

  // This happens as the user is typing. Enabled by the SlashCommandBuilder's
  // .setAutocomplete(true) option.
  if (interaction.type === InteractionType.ApplicationCommandAutocomplete) {
    const focusedValue = interaction.options.getFocused();
    // Do not waste a query if the user has fewer than 3 chars.
    if (focusedValue.length < 3) {
      await interaction.respond([]);
      return;
    }

    // Search algolia for the query.
    const searchRes = await index.search<Suggestion>(focusedValue, {
      page: 0,
      hitsPerPage: 5,
    });

    // Transform the hits' relative URL to objects that are readable and
    // linkable outside of lit.dev.
    const results = searchRes.hits.map((hit) => {
      const readableText = hit.isSubsection
        ? `${hit.title} - ${hit.heading}`
        : hit.title;

      // autocomplete requires a `name` and a `value` property like a <select>
      // The name is what is shown to the user, but the `value` is what is
      // actually sent to the bot in the `.isChatInputCommand()` event.
      return {
        name: readableText,
        value: `https://lit.dev${hit.relativeUrl}`,
      };
    });

    await interaction.respond(results);
  }

  // This is true when the user finally returns a command. (a lit.dev url)
  if (interaction.isChatInputCommand()) {
    const value = interaction.options.data[0].value as string;

    // If the response is a lit.dev URL then tell the bot to post it.
    if (value.startsWith('https://lit.dev')) {
      await interaction.reply({content: value});
    } else {
      // If the response is not a lit.dev url, then bot responds with an
      // ephemeral message that is only visible to the user. This happens when
      // there are no results, or if the user hits enter before results show up.
      interaction.reply({
        ephemeral: true,
        content: `value: "${value}" is not a valid lit.dev url. Please select from the autocomplete list.`,
      });
    }
  }
});

// Start the web socket connection to the Bot.
client.login(BOT_CLIENT_SECRET);
