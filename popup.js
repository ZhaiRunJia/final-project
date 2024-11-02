document.getElementById("analyze-btn").addEventListener("click", () => {
  // Show loader and hide previous results
  document.getElementById("loader").style.display = "block";
  document.getElementById("results").style.display = "none";
  document.getElementById("suggestions-text").innerText = "";

  // Request the background script to fetch the page HTML and analyze it
  chrome.runtime.sendMessage({ action: "analyzeSEO" }, (response) => {
    // Hide loader
    document.getElementById("loader").style.display = "none";

    // Display results section
    document.getElementById("results").style.display = "block";

    if (response && response.suggestions) {
      // Display the SEO suggestions
      document.getElementById("suggestions-text").innerText =
        response.suggestions;
    } else {
      document.getElementById("suggestions-text").innerText =
        "Failed to get SEO suggestions.";
    }
  });
});
