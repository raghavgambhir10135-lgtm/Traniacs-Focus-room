let time = 1500;
let timer;

function startTimer() {
  timer = setInterval(() => {
    if (time <= 0) clearInterval(timer);
    time--;

    let min = Math.floor(time / 60);
    let sec = time % 60;

    document.getElementById("timer").innerText =
      `${min}:${sec < 10 ? '0' : ''}${sec}`;
  }, 1000);
}

function resetTimer() {
  clearInterval(timer);
  time = 1500;
  document.getElementById("timer").innerText = "25:00";
}

function sendMsg() {
  let msg = document.getElementById("msg").value;
  let box = document.getElementById("chatBox");

  box.innerHTML += `<p>${msg}</p>`;
  document.getElementById("msg").value = "";
}