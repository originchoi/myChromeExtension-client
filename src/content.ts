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

// // 클릭이벤트 감지하기 추가!
// document.addEventListener("click", (event: MouseEvent) => {
//   const target = event.target as HTMLElement; // 타입 단언을 사용하여 HTMLElement로 캐스팅

//   if (target) {
//     // 클릭된 요소의 정보 수집
//     const tagName: string = target.tagName; // 태그 이름
//     const id: string = target.id; // ID
//     const className: string = target.className; // 클래스 이름
//     const textContent: string | null = target.textContent; // 텍스트 내용

//     console.log("Clicked element information:");
//     console.log("Tag Name:", tagName);
//     console.log("ID:", id);
//     console.log("Class Name:", className);
//     console.log("Text Content:", textContent);

//     // 수집한 정보를 백그라운드 스크립트에 전송
//     chrome.runtime.sendMessage({
//       type: "clickEvent",
//       data: {
//         tagName,
//         id,
//         className,
//         textContent,
//       },
//     });
//   }
// });

// 클릭이벤트 저장하기!
document.addEventListener("click", (event: MouseEvent) => {
  const target = event.target as HTMLElement;

  if (target) {
    const eventDetails = {
      tagName: target.tagName,
      id: target.id,
      className: target.className,
      textContent: target.textContent,
      x: event.clientX,
      y: event.clientY,
    };

    chrome.runtime.sendMessage({ type: "recordClick", data: eventDetails });
  }
});
