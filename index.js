const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
const OAuth2Client = google.auth.OAuth2;

// If modifying these scopes, delete token.json.
// const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
const SCOPES = ['https://accounts.google.com/o/oauth2/v2/auth'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    // Authorize a client with credentials, then call the Gmail API.
    authorize(JSON.parse(content), listLabels);
    // authorize(JSON.parse(content), listMessages)
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getNewToken(oAuth2Client, callback);
        oAuth2Client.setCredentials(JSON.parse(token));
        callback(oAuth2Client);
    });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error retrieving access token', err);
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) return console.error(err);
                console.log('Token stored to', TOKEN_PATH);
            });

            callback(oAuth2Client);
        });
    });
}

/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listLabels(auth) {
    const gmail = google.gmail({ version: 'v1', auth });
    gmail.users.labels.list({
        userId: 'me',
    }, (err, res) => {
        if (err) return console.log('The API returned an error: ' + err);
        const labels = res.data.labels;

        if (labels.length) {
            const messages = listMessages(auth, 'label:inbox subject:reminder');
            console.log(messages);
            messages.then(function(result) {
                console.log(result) // "Some User token"
                let x = "1776b025fda2c380";
                getUserDetails()
                    // var threadMessages = gmail.Users.Threads.Get("me", x).Execute();
                    // console.log(threadMessages);
            })

            // if (messages) {
            //     console.log('Messages');
            //     messages.forEach((messages, i) => {
            //         console.log(messages, i);
            //     })
            // } else {
            //     console.log('No messages found.');
            // }
            console.log('Labels:');
            labels.forEach((label) => {
                console.log(`- ${label.name}`);

            });
        } else {
            console.log('No labels found.');
        }
    });
    // gmail.users.messages.list({
    //     userId: 'me',
    //     maxResults: 1,
    // }, function(err, res) {
    //     if (err) {
    //         console.log('The Gmail API returned an error: ' + err);
    //         return;
    //     }
    //     const messages = listMessages(oAuth2Client, 'label:inbox subject:reminder');
    //     console.log(messages);
    //     // getUserDetails();
    //     console.log("response" + JSON.stringify(res));
    //     // console.log("response" + res.headers.authorize);
    // });
}

// function listLabels(auth) {
//     // ...      
//     labels.forEach((label) => {
//         console.log(`- ${label.name} : ${label.id}`);
//     });
//     // ...
// }




function listMessages(auth, query) {
    return new Promise((resolve, reject) => {
        const gmail = google.gmail({ version: 'v1', auth });
        console.log('simple', gmail.users.messages.context)
        gmail.users.messages.list({
            userId: 'me',
            q: query,
        }, (err, res) => {
            if (err) {
                console.log('res', res);
                reject(err);
                return;
            }
            if (!res.data.messages) {
                console.log('res', res);
                console.log(res.data.messages);
                resolve([]);
                return;
            }
            resolve(res.data.messages);
        });
    });
}


function getUserDetails() {

    const https = require('https');
    // https://www.googleapis.com/gmail/v1/users/somebody%40gmail.com/messages/147199d21bbaf5a5?key={YOUR_API_KEY}
    // https.get('https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=ya29.a0AfH6SMBUH7SAxgMh67iJhYoqBzbn7ukoUrA97Aeuhw0cDglcJdJUFWgmGFWRmma-lMdlYEcSmPtreD1P8PR991LW1nxK2HG7NHgWrSlju8oj7Tv3wyrIHX37UvtMW2X3m5i2YqPTuZX3gnqiSrtqOFSwEDle6U1Kqad8zm05hGih', (resp) => {
    https.get('https://gmail.googleapis.com/gmail/v1/users/dev.faiz7295@gmail.com/threads/1765f310715aa914', (resp) => {

        let data = '';

        // A chunk of data has been received.
        resp.on('data', (chunk) => {
            data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            console.log(JSON.parse(data));
        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });

    // var request = require('request');
    // request('https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=ya29.A0AfH6SMAfrrEAW9FuvhA7KWIZunv-I6gFw8jUNPXf8K4rik_GZ46m3wbEwZVabJe6GKeEgIWNwXSyDSXLYY2yIz1yGmi1ykFx9pibu3BKa8E4c3V0fgS51M7k0q9AvlnpYtEeqppEO-4-INhY5CcZIqOQ0THBTQ', function(error, response, body) {
    //     if (!error && response.statusCode == 200) {
    //         console.log(body) // Print the google web page.
    //     }
    // })
}