// ✅ content.js is working

// Wait until the LinkedIn profile page is fully loaded
window.addEventListener("load", () => {
  try {
    const name = document.querySelector('.text-heading-xlarge')?.innerText || "N/A";
    const headline = document.querySelector('.text-body-medium.break-words')?.innerText || "N/A";
    const jobTitle = document.querySelector('div.text-body-medium.break-words + div span')?.innerText || "N/A";
    const email = "N/A"; // Emails aren't publicly visible on LinkedIn
    const viewer = document.querySelector('.pv-profile-section__card-heading')?.innerText || "N/A";

    // Send message to popup.js
    chrome.runtime.sendMessage({
      action: "profileData",
      data: {
        name,
        headline,
        jobTitle,
        email,
        viewedBy: viewer
      }
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error("❌ Message send failed:", chrome.runtime.lastError.message);
      } else {
        console.log("✅ Data sent to popup:", response);
      }
    });
  } catch (err) {
    console.error("❌ content.js error:", err);
  }
});
