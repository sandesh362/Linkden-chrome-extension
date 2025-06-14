// content.js – runs in the context of the LinkedIn page

function extractLinkedInData() {
  let name = document.querySelector('h1')?.innerText || "N/A";
  let headline = document.querySelector('.text-body-medium.break-words')?.innerText || "N/A";
  let jobTitle = document.querySelector('.pv-entity__summary-info h3')?.innerText || "N/A";
  let email = document.querySelector("a[href^='mailto:']")?.innerText || "N/A";

  // "Viewed By" is not accessible without Premium, so placeholder for now
  let viewedBy = "N/A";

  chrome.runtime.sendMessage({
    action: "sendProfileData",
    payload: { name, headline, jobTitle, email, viewedBy }
  });
  console.log("Scraping LinkedIn profile...");

}

extractLinkedInData();
