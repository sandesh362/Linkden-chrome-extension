console.log("✅ content.js is working");

// Wait for LinkedIn profile DOM to be fully ready
window.addEventListener("load", () => {
    const name = document.querySelector('.text-heading-xlarge')?.innerText || "N/A";
    const headline = document.querySelector('.text-body-medium.break-words')?.innerText || "N/A";
    const jobTitle = document.querySelector('.pv-text-details__right-panel h3')?.innerText || "N/A";
    const email = "N/A"; // LinkedIn doesn't expose email in public profile
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
    });

    console.log("✅ Data sent to popup");
});
