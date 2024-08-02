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

chrome.runtime.onMessage.addListener(
  (
    message: any,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void,
  ) => {
    if (message.type === "clickEvent") {
      const { tagName, id, className, textContent } = message.data;

      console.log("Received click event information from content script:");
      console.log("Tag Name:", tagName);
      console.log("ID:", id);
      console.log("Class Name:", className);
      console.log("Text Content:", textContent);
    }
  },
);
