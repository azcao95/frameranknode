const { Octokit } = require("@octokit/rest");
const bodyParser = require("body-parser");

const octokit = new Octokit({
  auth: process.env.authkey,
});

const express = require("express");
const app = express();

let reactVotes = new Set();
let emberVotes = new Set();
let angularVotes = new Set();
let vueVotes = new Set();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers"
  );
  next();
});

async function getData(myOwner, myRepo, myProjName) {
  console.log("Looking up: " + myProjName);

  const [repoData, commitData] = await Promise.all([
    octokit.repos.get({
      owner: myOwner,
      repo: myRepo,
    }),
    octokit.request("GET /repos/{owner}/{repo}/stats/participation", {
      owner: myOwner,
      repo: myRepo,
    }),
  ]);

  let createdDate = repoData.data.created_at;
  let daysAge = (Date.now() - Date.parse(createdDate)) / (24 * 60 * 60 * 1000);

  let totalCommits = 0;

  for (let index in commitData.data.all) {
    totalCommits += commitData.data.all[index];
  }

  let forks = repoData.data.forks;
  let issueCount = repoData.data.open_issues_count;

  return {
    projName: myProjName,
    daysAge: daysAge.toFixed(0),
    repo: myRepo,
    createdDate: createdDate,
    commits: totalCommits,
    forks: forks,
    issueCount: issueCount,
  };
}

app.get("/", async (req, res) => {
  const [reactData, emberData, angularData, vueData] = await Promise.all([
    getData("facebook", "react", "React"),
    getData("emberjs", "ember.js", "Ember"),
    getData("angular", "angular.js", "Angular"),
    getData("vuejs", "vue", "Vue"),
  ]);

  let payload = {
    timestamp: Date.now(),
    react: reactData,
    ember: emberData,
    angular: angularData,
    vue: vueData,
  };

  console.log(payload);

  res.send(payload);
});

app.get("/votes", (req, res) => {
  res.send({
    react: reactVotes.size,
    ember: emberVotes.size,
    angular: angularVotes.size,
    vue: vueVotes.size,
  });
});

app.get("/frameRank.html", function (req, res) {
  res.sendFile(__dirname + "/frameRank.html");
});

function validateEmail(email) {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

function removeEmail(currEmail) {
  reactVotes.delete(currEmail);
  emberVotes.delete(currEmail);
  angularVotes.delete(currEmail);
  vueVotes.delete(currEmail);
}

app.post("/votes", (req, res) => {
  console.log("Submitting Vote");
  console.log(req.body);
  let currEmail = req.body.email.toLowerCase();

  if (validateEmail(currEmail)) {
    switch (req.body.vote.trim().toLowerCase()) {
      case "react":
        removeEmail(currEmail);

        reactVotes.add(currEmail);
        break;
      case "ember":
        removeEmail(email);

        emberVotes.add(currEmail);
        break;
      case "angular":
        removeEmail(email);

        angularVotes.add(currEmail);
        break;
      case "vue":
        removeEmail(email);

        vueVotes.add(currEmail);
        break;
      default:
        res.send({
          message: "Invalid vote",
        });
    }

    res.send({
      message: "Vote tallied",
    });
  } else {
    res.send({
      message: "Invalid email",
    });
  }
});

process.on("unhandledRejection", (err) => {
  console.error(err);
  process.exit(1);
});

const port = process.env.port || 3000;

app.listen(port, () => {
  console.log("Hi there!");
});
