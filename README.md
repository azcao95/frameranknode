# Framework Ranker

Using HTML and Vanilla JS because I like extra credit.

Server-side, using express.js because it is widely used and familiar. It also seemed appropriate for a web application of this small a scale.

Server and page hosted on AWS Elastic Beanstalk because it is a trustworthy service to host a server and relatively inexpensive. Robust environment configuration features are also a plus.

## Repeated API Call and constantly updating API display

Every five seconds (I'm still paying for AWS hosting so I'm erring on the side of caution), the page sends two get requests to the express server--one for general information and one for votes information.

Votes for each framework are stored as email addresses in hash sets and the server sends back to the page an object containing the sizes of each set of votes for each framework.

For the general information, the express server will send two requests to the github API--one for general repo data and another for commit activity--and will display the following information:

- Timestamp of the displaying request
- Age of repository in days and date created
- Commits (and days between Commits)
  - Represents work being done
  - (Represents rate at which work is being done)
- Open Issues
  - Represents how many opportunities for improvements users have identified.
- Forks
  - Represents how many other users are working on making changes themselves

The page updates the information fields in the corresponding html elements (determined by id). If there is any error in the process, the page will hide all info fields and display a generic error message. The error will be written to the console.

## Vote Field

The user can send in a vote to the server by selecting a framework in the dropdown, entering their email, and clicking on the submitting votes button. The site will send a post request to the server with the body containing the email and one of four values corresponding to each of the frameworks. The page then receives a message back telling the user the status of vote.

The email in the body is trimmed for whitespace and converted into lowercase. The email is then validated. If the email passes, the server goes on to the next step of processing the vote. If not, no further action is taken and a message is sent to the page saying the email is invalid.

When a vote's email passes validation, the server then proceeds with some set operations. Votes are stored in the server as hash sets to ensure that no email is recorded more than once for each set of votes.

The server enters a switch statement on the vote's chosen framework. If the value for the chosen framework matches the value for the corresponding set, The server removes the email from each of the four sets. This way, votes can be easily reassigned from one framework to another. Then the email is added to the set corresponding to the value in the request. The server then sends a message to the page saying that the vote has been tallied. If the value in the request does not match any corresponding value for the each of the sets, then no action is taken and a message is sent to the page saying the vote is invalid.
