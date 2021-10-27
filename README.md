# thejake
A scoring system for NFL QB's that is based off the infamous Jake Delhomme game in 2009 in which he had 6 turnovers, and was his birthday. I also invented my own metric called the TruJake, that uses a mathematical calculation based off of the rest of their stats and their individual statistical histories. Application will pull stats from my 'TheJakeServer' backend. These stats are refreshed during game day every minute, and not refreshed during the week to keep hits down to various open API's I've found around the internet.

## ExpressJS API - Start first
```
node server/app 
```

### Compiles and hot-reloads for development
```
npm run serve
```
Should just work out of the box, this is now wired up to a live backend.
Note: Doesn't include server software, but the server is ON and running, abuse will not be tolerated and is monitored.
