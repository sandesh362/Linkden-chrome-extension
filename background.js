// background.js

// Log when LinkedIn profile page is fully loaded
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url?.includes("linkedin.com/in/")) {
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: () => {
        console.log("✅ LinkedIn profile page fully loaded. Background active.");
      }
    }).catch(err => console.error("Script injection failed:", err));
  }
});

// Handle messages from popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.type) {
    case "save_contact":
      const contact = request.data;
      if (!contact || !contact.name) {
        console.error("❌ Invalid contact data");
        sendResponse({ status: "error", message: "Invalid contact" });
        return false;
      }

      chrome.storage.local.set({ [contact.name]: contact }, () => {
        console.log(`✅ Contact '${contact.name}' saved.`);
        sendResponse({ status: "success" });
      });
      return true;

    case "track_job":
      chrome.storage.local.get("trackedJobs", (data) => {
        const jobs = data.trackedJobs || [];
        jobs.push(request.data);
        chrome.storage.local.set({ trackedJobs: jobs }, () => {
          console.log("📌 Job tracked successfully.");
          sendResponse({ status: "tracked" });
        });
      });
      return true;

    default:
      console.warn("❓ Unknown message type:", request.type);
      sendResponse({ status: "ignored" });
      return false;
  }
});

// Optional: Badge example to indicate 1 new saved contact
chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setBadgeText({ text: "" }); // Empty until triggered
  chrome.action.setBadgeBackgroundColor({ color: "#0077b5" });
});
