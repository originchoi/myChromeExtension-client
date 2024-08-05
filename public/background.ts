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
async function replayEvents() {
  console.log("이벤트 재생 시작");
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tabs[0]?.id) {
    console.error("이벤트 재생을 위한 활성 탭을 찾을 수 없습니다!");
    return;
  }

  const tabId = tabs[0].id;
  console.log(`현재 탭 ID: ${tabId}`);

  // 비동기적으로 각 이벤트를 실행
  for (const eventDetails of recordedEvents) {
    console.log("이벤트 세부사항:", eventDetails);

    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: async (details) => {
        console.log("스크립트 실행: 페이지 로드 대기");

        const waitForPageLoad = async () => {
          await new Promise<void>((resolve) => {
            if (document.readyState !== "complete") {
              console.log(
                "페이지가 아직 로드되지 않았습니다. 로드를 기다립니다.",
              );
              window.addEventListener(
                "load",
                () => {
                  console.log("페이지 로드 완료");
                  resolve();
                },
                { once: true },
              );
            } else {
              console.log("페이지가 이미 로드되었습니다.");
              resolve();
            }
          });
        };

        // 페이지 로드 완료 대기
        await waitForPageLoad();

        const elements = document.elementsFromPoint(details.x, details.y);
        const targetElement = elements.find((el) => {
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
            targetElement.click();
            console.log("HTML 요소 클릭:", details);
          } else if (targetElement instanceof SVGElement) {
            targetElement.dispatchEvent(
              new MouseEvent("click", { bubbles: true }),
            );
            console.log("SVG 요소 클릭:", details);
          }
        } else {
          console.warn("대상 요소를 찾지 못했습니다:", details);
        }
      },
      args: [eventDetails],
    });

    // 각 이벤트 간의 지연 시간을 추가하여 페이지가 변경될 경우 대기
    console.log("이벤트 간 대기 중...");
    await new Promise<void>((resolve) => setTimeout(resolve, 3000));
  }

  console.log("모든 이벤트 재생 완료");
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "clearEvents") {
    recordedEvents = []; // 기록된 이벤트 초기화
    console.log("이벤트 기록이 초기화되었습니다.");
    sendResponse({ status: "success" });
  }
});
