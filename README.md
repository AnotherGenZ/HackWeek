# GuildGit ![HackWeek Badge](https://img.shields.io/badge/discord-HackWeek%202019-7289DA.svg?style=flat-square&logo=discord)

A Discord HackWeek 2019 Submission 

[![GitHub issues](https://img.shields.io/github/issues/MrJohnCoder/HackWeek.svg?style=flat-square)](https://github.com/MrJohnCoder/HackWeek/issues)
[![GitHub stars](https://img.shields.io/github/stars/MrJohnCoder/HackWeek.svg?style=flat-square)](https://github.com/MrJohnCoder/HackWeek/stargazers)

## Information and Usage

GuildGit is a Version Control for your Discord Guild. GuildGit allows you to rollback (or revert to) changes made within your server keeping a constant log specific guild interactions.

`!ping` - Pong!

`!rollback <commit>` - Undoes every action made after the specified commit, setting the server back to how it was at that time.

`!revert <commit>` - Undoes the commit specified.

`!view <amount>` - View the last amount (defaults to 1-10) changes and their Commit ID.

`!view 1` will show the 10 most recent commits, !view 2 will show the 10 commits after (10-20)

## I want to use this bot, or just try it out

Easy! You will need two things:

* A Discord Bot Token
* A MongoDB Database

Simply clone the repo, and edit the .env.example with your token and the MongoDB URI. Not sure how to build one?
Here's an example:
`mongodb://username:password@host:port/collection`

Then, run `npm i` to install dependencies and `node index.js` to start the bot.

----

### Quick Use

Make a quick change to the server (such as renaming a channel), run `!view` and grab the Commit ID.

(Example: `e186999d-b05c-4634-b888-a46ea98b461b`)

Then, run !revert with the Commit ID to undo the change you made.

(Example: `!revert e186999d-b05c-4634-b888-a46ea98b461b`)
