# thejake
A scoring system for NFL QB's that is based off the infamous Jake Delhomme game in 2009 in which he had 6 turnovers, and was his birthday. I also invented my own metric called the TruJake, that uses a mathematical calculation based off of the rest of their stats and their individual statistical histories. Application will pull weekly stats from a couple visible endpoints I found on the internet. 

## ExpressJS API - Start first
```
node server/app 
```

### Compiles and hot-reloads for development
```
npm run serve
```

Requires database that I won't reveal here (though you could probably figure it out). If you wish to use only live data, look at getCurrentWeek() function, and process that data.
