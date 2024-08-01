document.addEventListener("copy", (_event: ClipboardEvent) => {
  const selection = window.getSelection();
  const selectedText = selection ? selection.toString() : "";
  const url = window.location.href;

  if (selectedText) {
    console.log(`Copied text: ${selectedText}`);
    console.log(`URL: ${url}`);

    chrome.runtime.sendMessage(
      { type: "copiedText", text: selectedText, url: url },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
        } else {
          console.log("Message sent successfully:", response);
        }
      },
    );
  }
});

document.addEventListener("paste", (event: ClipboardEvent) => {
  const clipboardData = event.clipboardData;
  const pastedText = clipboardData ? clipboardData.getData("text") : "";
  const url = window.location.href;

  if (pastedText) {
    console.log(`Pasted text: ${pastedText}`);
    console.log(`URL: ${url}`);

    chrome.runtime.sendMessage(
      { type: "pastedText", text: pastedText, url: url },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
        } else {
          console.log("Message sent successfully:", response);
        }
      },
    );
  }
});
