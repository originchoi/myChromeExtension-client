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

// chrome.runtime.onMessage.addListener(
//   (
//     message: any,
//     sender: chrome.runtime.MessageSender,
//     sendResponse: (response?: any) => void,
//   ) => {
//     if (message.type === "clickEvent") {
//       const { tagName, id, className, textContent } = message.data;

//       console.log("Received click event information from content script:");
//       console.log("Tag Name:", tagName);
//       console.log("ID:", id);
//       console.log("Class Name:", className);
//       console.log("Text Content:", textContent);
//     }
//   },
// );

interface ClickEventDetails {
  tagName: string;
  id: string;
  className: string;
  textContent: string | null;
  x: number;
  y: number;
}

let recordedEvents: ClickEventDetails[] = [];
let isRecording = false;

// 메시지 리스너
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "toggleRecording") {
    isRecording = !isRecording;

    console.log(isRecording ? "기록 시작" : "기록 중지");

    if (!isRecording) {
      console.log("기록된 이벤트:", recordedEvents);
    }

    sendResponse({ status: "success", isRecording });
    return true; // 비동기 응답을 보낼 때 true 반환
  }

  if (message.type === "recordClick" && isRecording) {
    const eventData: ClickEventDetails = message.data;
    recordedEvents.push(eventData);
    console.log("이벤트 기록:", eventData);
  }

  if (message.type === "replayEvents") {
    replayEvents();
    sendResponse({ status: "success" });
  }
});

// 이벤트 재생 함수
function replayEvents() {
  recordedEvents.forEach((eventDetails: ClickEventDetails) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: (details: ClickEventDetails) => {
            const elements = document.elementsFromPoint(details.x, details.y);
            const targetElement = elements.find(
              (el) => el.tagName === details.tagName && el.id === details.id,
            );

            if (targetElement) {
              (targetElement as HTMLElement).click();
              console.log("이벤트 재생:", details);
            }
          },
          args: [eventDetails],
        });
      }
    });
  });
}
