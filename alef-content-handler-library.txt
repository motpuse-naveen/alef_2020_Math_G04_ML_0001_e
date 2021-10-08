function contentStarted(contentId) {
    return new Promise((resolve) => {
        console.log('content with id '+contentId+' started');
        resolve()
    })
}

function contentFinished(contentId, resultJSON) {
    return new Promise(function(resolve) {
        console.log('content with id '+contentId+' finished', resultJSON);
        resolve()
    })
}

function getProgress(contentId) {
    return new Promise(function(resolve) {
        resolve(JSON.parse(localStorage.getItem(contentId)))
    })
}

function setProgress(contentId, progressJSON) {
    return new Promise(function(resolve) {
        localStorage.setItem(contentId, JSON.stringify(progressJSON));
        resolve()
    })
}

window.contentStarted = contentStarted;
window.contentFinished = contentFinished;
window.getProgress = getProgress;
window.setProgress = setProgress;