function extractLinkedInData() {
  const name = document.querySelector('.text-heading-xlarge')?.innerText?.trim() || 'N/A';
  const headline = document.querySelector('.text-body-medium.break-words')?.innerText?.trim() || 'N/A';
  const jobTitle = document.querySelector('.pv-text-details__left-panel .text-body-medium')?.innerText?.trim() || 'N/A';
  const email = document.querySelector('a[href^="mailto:"]')?.getAttribute('href')?.replace('mailto:', '') || null;
  const viewers = Array.from(document.querySelectorAll('[data-view-name="profile_viewed_by_list_item"] span[aria-hidden="true"]'))
    .map(el => el.innerText?.trim()).filter(Boolean);

  return { name, headline, jobTitle, email, viewedBy: viewers };
}
// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   if (message.action === "sendProfileData") {
//     const data = message.payload;

//     document.getElementById("name").textContent = data.name;
//     document.getElementById("headline").textContent = data.headline;
//     document.getElementById("jobTitle").textContent = data.jobTitle;
//     document.getElementById("email").textContent = data.email;
//     document.getElementById("viewedBy").textContent = data.viewedBy;
//     console.log("Received data from content script:", message.payload);

//   }
// });

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "profileData") {
        document.getElementById("name").textContent = message.data.name;
        document.getElementById("headline").textContent = message.data.headline;
        document.getElementById("jobTitle").textContent = message.data.jobTitle;
        document.getElementById("email").textContent = message.data.email;
        document.getElementById("viewedBy").textContent = message.data.viewedBy;
    }
});



document.addEventListener("DOMContentLoaded", () => {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      tabButtons.forEach(b => b.classList.remove("active"));
      tabContents.forEach(t => t.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(btn.dataset.tab).classList.add("active");
    });
  });

  document.getElementById("toggleTheme").addEventListener("click", () => {
    document.body.classList.toggle("dark");
  });

  // Profile tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      function: extractLinkedInData
    }, (results) => {
      const result = results[0]?.result;
      if (!result) return;

      document.getElementById("profileInfo").innerHTML = `
        <strong>Name:</strong> ${result.name}<br>
        <strong>Headline:</strong> ${result.headline}<br>
        <strong>Job Title:</strong> ${result.jobTitle}<br>
        <strong>Email:</strong> ${result.email || "N/A"}<br>
        <strong>Viewed By:</strong><br>${result.viewedBy.join("<br>") || "N/A"}
      `;

      document.getElementById("saveContact").addEventListener("click", () => {
        chrome.runtime.sendMessage({ type: "save_contact", data: result }, () => {
          alert("✅ Contact saved");
        });
      });

      document.getElementById("autoConnect").addEventListener("click", () => {
        alert(`💡 Message: Hi ${result.name}, I saw your profile as ${result.jobTitle}. Let’s connect!`);
      });

      document.getElementById("trackJob").addEventListener("click", () => {
        const job = {
          title: result.jobTitle,
          profile: result.name,
          notes: `Tracked from ${result.name}`,
          timestamp: new Date().toLocaleString()
        };
        chrome.runtime.sendMessage({ type: "track_job", data: job }, () => {
          alert("📌 Job tracked");
        });
      });

      new Chart(document.getElementById('activityChart'), {
        type: 'bar',
        data: {
          labels: ['Likes', 'Comments', 'Shares'],
          datasets: [{ data: [12, 6, 3], backgroundColor: ['#0a66c2', '#0077b5', '#005582'] }]
        },
        options: { plugins: { legend: { display: false } } }
      });
    });
  });

  // View saved contacts
  chrome.storage.local.get(null, (items) => {
    const list = document.getElementById("contactsList");
    for (const key in items) {
      if (items[key].headline) {
        const c = items[key];
        const li = document.createElement("li");
        li.textContent = `${c.name} – ${c.jobTitle}`;
        list.appendChild(li);
      }
    }
  });

  // View tracked jobs
  chrome.storage.local.get("trackedJobs", (data) => {
    const jobs = data.trackedJobs || [];
    const list = document.getElementById("jobsList");
    jobs.forEach(job => {
      const li = document.createElement("li");
      li.textContent = `${job.title} from ${job.profile} (${job.timestamp})`;
      list.appendChild(li);
    });
  });

  // Export CSV (Contacts)
  document.getElementById("exportContacts").addEventListener("click", () => {
    chrome.storage.local.get(null, (items) => {
      let csv = "Name,Job Title,Headline,Email\n";
      for (const key in items) {
        if (items[key].headline) {
          const c = items[key];
          csv += `"${c.name}","${c.jobTitle}","${c.headline}","${c.email || ""}"\n`;
        }
      }
      downloadCSV(csv, "contacts.csv");
    });
  });

  // Export CSV (Jobs)
  document.getElementById("exportJobs").addEventListener("click", () => {
    chrome.storage.local.get("trackedJobs", (data) => {
      const jobs = data.trackedJobs || [];
      let csv = "Title,Profile,Note,Time\n";
      jobs.forEach(job => {
        csv += `"${job.title}","${job.profile}","${job.notes}","${job.timestamp}"\n`;
      });
      downloadCSV(csv, "jobs.csv");
    });
  });
});

function downloadCSV(content, filename) {
  const blob = new Blob([content], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.setAttribute("href", url);
  a.setAttribute("download", filename);
  a.click();
  URL.revokeObjectURL(url);
}
