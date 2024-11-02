chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "analyzeSEO") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0 || !tabs[0].id) {
        sendResponse({ suggestions: "No active tab found or access is restricted on this page." });
        return;
      }

      const tabId = tabs[0].id;

      chrome.scripting.executeScript(
        {
          target: { tabId: tabId },
          func: () => {
            // Extract key parts of the HTML for SEO purposes
            const doc = document.documentElement;
            return {
              head: doc.querySelector("head")?.outerHTML || "",
              bodyContent: Array.from(doc.querySelectorAll("h1, h2, h3, p")).map(el => el.outerHTML).join("\n")
            };
          }
        },
        (results) => {
          if (!results || !results[0].result) {
            sendResponse({ suggestions: "Failed to retrieve page HTML." });
            return;
          }

          const { head, bodyContent } = results[0].result;
          const contentToAnalyze = `${head}\n${bodyContent}`;

          // Ensure content fits within token limits (you can adjust this)
          const maxContentLength = 12000;
          const trimmedContent = contentToAnalyze.length > maxContentLength
            ? contentToAnalyze.substring(0, maxContentLength) + "..."
            : contentToAnalyze;

          fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer OPENAI_ACCESS_TOKEN` // add your openai access token
            },
            body: JSON.stringify({
              model: "gpt-3.5-turbo-0125",
              messages: [
                { role: "system", content: "You are an SEO expert. Analyze HTML content and suggest improvements to enhance SEO." },
                { role: "user", content: `Please review the following HTML for SEO suggestions:\n\n${trimmedContent}` }
              ],
              max_tokens: 1000
            })
          })
            .then(response => response.json())
            .then(data => {
              const seoSuggestions = data.choices[0].message.content;
              sendResponse({ suggestions: seoSuggestions });
            })
            .catch(error => {
              console.error("Error:", error);
              sendResponse({ suggestions: "Error occurred while fetching SEO suggestions." });
            });
        }
      );
    });

    // Keep the message channel open for async response
    return true;
  }
});
