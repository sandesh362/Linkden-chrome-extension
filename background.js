// You can use this to do things like handle context menus or alarms in the future.



// Listen for when a user navigates to a new tab on LinkedIn
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url?.includes("linkedin.com/in/")) {
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: () => {
        console.log("LinkedIn profile page loaded. Background script active.");
      }
    });
  }
});

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "save_contact") {
    const contact = request.data;
    chrome.storage.local.set({ [contact.name]: contact }, () => {
      console.log(`Contact '${contact.name}' saved from background.`);
      sendResponse({ status: "success" });
    });
    return true; // Keep the message channel open for sendResponse
  }

  if (request.type === "track_job") {
    chrome.storage.local.get("trackedJobs", (data) => {
      const jobs = data.trackedJobs || [];
      jobs.push(request.data);
      chrome.storage.local.set({ trackedJobs: jobs }, () => {
        console.log("Job tracked from background.");
        sendResponse({ status: "tracked" });
      });
    });
    return true;
  }
});
