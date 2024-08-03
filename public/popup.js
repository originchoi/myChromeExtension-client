document
  .getElementById("toggleRecordingButton")
  .addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (activeTab?.id) {
        // 백그라운드 스크립트로 메시지 전송
        chrome.runtime.sendMessage({ type: "toggleRecording" }, (response) => {
          if (response.isRecording) {
            document.getElementById("toggleRecordingButton").innerText =
              "기록 중지";
            console.log("기록 시작");
          } else {
            document.getElementById("toggleRecordingButton").innerText =
              "기록 시작";
            console.log("기록 중지");
          }
        });
      }
    });
  });
