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
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0]?.id) {
      console.error("이벤트 재생을 위한 활성 탭을 찾을 수 없습니다~!");
      return;
    }

    const tabId = tabs[0].id;

    recordedEvents.forEach((eventDetails: ClickEventDetails) => {
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        func: (details: ClickEventDetails) => {
          const elements = document.elementsFromPoint(details.x, details.y);
          const targetElement = elements.find((el) => {
            // 태그 이름이 SVGElement에 대한 것인지 확인하기!!!
            if (el instanceof SVGElement) {
              return el.tagName.toUpperCase() === details.tagName.toUpperCase();
            } else {
              return (
                el.tagName.toUpperCase() === details.tagName.toUpperCase() &&
                el.id === details.id
              );
            }
          });

          if (targetElement) {
            if (targetElement instanceof HTMLElement) {
              // HTML 요소에 대해 클릭 시뮬레이션
              targetElement.click();
            } else if (targetElement instanceof SVGElement) {
              // SVG 요소에 대해 클릭 이벤트 디스패치
              targetElement.dispatchEvent(
                new MouseEvent("click", { bubbles: true }),
              );
            }

            console.log("이벤트 재생:", details);
          }
        },
        args: [eventDetails],
      });
    });
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "clearEvents") {
    recordedEvents = []; // 기록된 이벤트 초기화
    console.log("이벤트 기록이 초기화되었습니다.");
    sendResponse({ status: "success" });
  }
});
