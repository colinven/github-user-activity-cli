#!/usr/bin/env node
function extractData(array) {
   const extracted = array.map(event => ({
    eventType: event.type,
    repo: event.repo.name,
    ref_type: event.payload.ref_type || null,
    ref: event.payload.ref || null,
    action: event.payload.action || null
   }));

   return extracted;
};

function countDuplicates(array) {
    const counts = {};

    array.forEach(obj => {
        const key = JSON.stringify(obj);
        counts[key] = (counts[key] || 0) + 1;
    });

    const entries = Object.entries(counts);
    return entries.map(entry => ([JSON.parse(entry[0]), entry[1]]));
};

function constructMessages(array) {
    const numOfDuplicates = countDuplicates(array);
    const formattedArray = [];

    numOfDuplicates.forEach(event => {
        const eventObj = event[0];
        const duplicates = event[1];
        switch(eventObj.eventType){
            case 'CreateEvent':
                if (eventObj.ref_type === 'repository'){
                    formattedArray.push(`- User created a new ${eventObj.ref_type} ${eventObj.ref}.`);
                    break;
                } else {
                    formattedArray.push(`- User created a new ${eventObj.ref_type} "${eventObj.ref}" in ${eventObj.repo}.`);
                    break;
                };
            case 'DeleteEvent':
                formattedArray.push(`- User deleted the ${eventObj.ref_type} ${eventObj.ref} in ${eventObj.repo}.`);
                break;
            case 'DiscussionEvent':
                formattedArray.push(`- User created ${duplicates} discussion(s) in ${eventObj.repo}.`);
                break;
            case 'PullRequestEvent':
                formattedArray.push(`- User ${eventObj.action} ${duplicates} pull request(s) in ${eventObj.repo}.`);
                break;
            case 'PullRequestReviewEvent':
                formattedArray.push(`- User reviewed ${duplicates} pull request(s) in ${eventObj.repo}.`);
                break;
            case 'PushEvent':
                formattedArray.push(`- User pushed ${duplicates} commit(s) to ${eventObj.repo}.`);
                break;
            case 'WatchEvent':
                formattedArray.push(`- User starred ${eventObj.repo}.`);
                break;
            case 'IssuesEvent':
                formattedArray.push(`- User ${eventObj.action} ${duplicates} issue(s) in ${eventObj.repo}.`);
                break;
        }
    });
    return formattedArray;
};

function printMessages(formattedArray){
    formattedArray.forEach(message => console.log(`${message}\n`));
}

async function fetchUserData(username) {
    try {
        const response = await fetch(`https://api.github.com/users/${username}/events`);
        
        if (!response.ok){
            throw new Error(`HTTP error. Status: ${response.status}`);
        }

        const data = await response.json();
        const extracted = extractData(data);

        return extracted;

    } catch (error) {
        console.error("Fetch error:", error.message);
        throw error;
    }
};

async function run() {
    const username = process.argv[2];
    const events = await fetchUserData(username);
    const messagesArray = constructMessages(events);
    printMessages(messagesArray);
};

run();
