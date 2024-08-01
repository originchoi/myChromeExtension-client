chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension Installed");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "copiedText") {
    console.log(`Received copied text: ${message.text}`);
    console.log(`From URL: ${message.url}`);

    sendResponse({ status: "success" });
  }

  if (message.type === "pastedText") {
    console.log(`Received pasted text: ${message.text}`);
    console.log(`From URL: ${message.url}`);

    sendResponse({ status: "success" });
  }
});
